-- ============================================================================
-- PixelCoder migration 0001: harden public.pixelcoder_profiles
--
-- STATUS: NOT EXECUTED. This file is delivered as a migration only — the
-- project has no service-role key or dashboard access, so the owner must run
-- this manually in the Supabase SQL Editor (see SECURITY.md).
--
-- ROLLOUT WARNING — read SECURITY.md "Architectural constraint" first:
--   * Section 2 (revoking password_hash SELECT) is incompatible with the
--     CURRENT client-only login, which must read the verifier to run PBKDF2
--     in the browser. Deploy a server-side verification endpoint (or the
--     salt/derived-key RPC described in SECURITY.md) BEFORE running section 2,
--     otherwise every login fails with 42501.
--   * Section 5 (XP/gold guard) intentionally stops syncProgressToBackend()
--     from writing progression. Deploy a verified RPC before enabling it.
--   * Safe to run immediately: sections 1, 3, 4, 6.
--
-- Assumptions:
--   * PostgreSQL 15+ (Supabase). `security_invoker` views need 15+.
--   * Table is owned by `postgres`; `anon` and `authenticated` are the API roles.
--   * Existing RLS policies may have other names. Permissive policies OR
--     together, so this migration only drops/recreates the three policy names
--     it owns ("pixelcoder_profiles_*"). Inspect the dashboard for extras.
--   * Registration is anonymous (custom auth, no Supabase JWT identity), so the
--     INSERT/UPDATE policies cannot be scoped to "own row" — the guard trigger
--     below is what protects server-authoritative columns.
--
-- The script is written to be re-runnable: DROP ... IF EXISTS / CREATE OR
-- REPLACE / ADD COLUMN IF NOT EXISTS / guarded constraint creation.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Extra presentation columns used by updateProfileBackend()
--    (App.jsx already tracks `character_name` locally; this persists it.)
-- ----------------------------------------------------------------------------
ALTER TABLE public.pixelcoder_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.pixelcoder_profiles ADD COLUMN IF NOT EXISTS character_name text;

-- ----------------------------------------------------------------------------
-- 2. Column-level SELECT: make password_hash unreadable through the API.
--    Table-level SELECT is revoked first, then every non-secret column is
--    granted explicitly. INSERT/UPDATE stay table-level because registration
--    must write password_hash and login upgrades must rewrite it.
--
--    !! DO NOT RUN until login verification is server-side. The shipped client
--    verifies PBKDF2 in the browser and therefore SELECTs password_hash; after
--    this section that request returns 42501 and login is broken. See
--    SECURITY.md for the salt + derived-key RPC option that keeps this revoke.
-- ----------------------------------------------------------------------------
REVOKE SELECT ON TABLE public.pixelcoder_profiles FROM anon, authenticated;

GRANT SELECT (
  id,
  username,
  email,
  role,
  total_xp,
  current_streak,
  hp,
  max_hp,
  armor,
  weapon_name,
  weapon_atk,
  gold,
  potions,
  cleared_stages,
  created_at,
  updated_at,
  avatar_url,
  character_name
) ON public.pixelcoder_profiles TO anon, authenticated;

GRANT INSERT, UPDATE ON TABLE public.pixelcoder_profiles TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Row level security
--    SELECT is public by design (leaderboard). Column grants above keep the
--    hash out of it. Writes are guarded by the trigger in section 5.
-- ----------------------------------------------------------------------------
ALTER TABLE public.pixelcoder_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pixelcoder_profiles_public_read ON public.pixelcoder_profiles;
CREATE POLICY pixelcoder_profiles_public_read
  ON public.pixelcoder_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS pixelcoder_profiles_anon_insert ON public.pixelcoder_profiles;
CREATE POLICY pixelcoder_profiles_anon_insert
  ON public.pixelcoder_profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    role = 'user'
    AND total_xp BETWEEN 0 AND 1000000
    AND gold BETWEEN 0 AND 10000000
  );

-- Custom auth has no per-user JWT identity to scope rows with, so every player
-- can technically UPDATE every row. The trigger below blocks role/XP/gold
-- tampering; anything stricter needs real Supabase Auth (or a signed RPC).
DROP POLICY IF EXISTS pixelcoder_profiles_client_update ON public.pixelcoder_profiles;
CREATE POLICY pixelcoder_profiles_client_update
  ON public.pixelcoder_profiles
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. Leaderboard view (no email, no password_hash)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_profiles
  WITH (security_invoker = true)
AS
SELECT
  id,
  username,
  role,
  total_xp,
  current_streak,
  weapon_name,
  armor,
  created_at,
  updated_at
FROM public.pixelcoder_profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Guard trigger: clients may not change role, total_xp, or gold.
--
--    !! TARGET STATE: this intentionally stops syncProgressToBackend() from
--    updating XP/gold. That is the fix for "client-writable XP", but it freezes
--    remote progression until a server-side RPC (e.g. grant_stage_completion)
--    is deployed. Service-role / owner connections (SQL editor, admin jobs)
--    bypass the guard. See SECURITY.md for the rollout order.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.pixelcoder_guard_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF current_setting('role', true) IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'pixelcoder: role is immutable from the client';
  END IF;

  IF NEW.total_xp IS DISTINCT FROM OLD.total_xp
     OR NEW.gold IS DISTINCT FROM OLD.gold THEN
    RAISE EXCEPTION 'pixelcoder: total_xp/gold are server-authoritative; use a verified RPC';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pixelcoder_guard_profile_update ON public.pixelcoder_profiles;
CREATE TRIGGER pixelcoder_guard_profile_update
  BEFORE UPDATE ON public.pixelcoder_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.pixelcoder_guard_profile_update();

-- ----------------------------------------------------------------------------
-- 6. Shape checks for new rows (NOT VALID = legacy rows are not rewritten,
--    but every new INSERT/UPDATE must satisfy them).
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pixelcoder_profiles_username_format'
      AND conrelid = 'public.pixelcoder_profiles'::regclass
  ) THEN
    ALTER TABLE public.pixelcoder_profiles
      ADD CONSTRAINT pixelcoder_profiles_username_format
      CHECK (username ~ '^[A-Za-z0-9_]{3,20}$') NOT VALID;
  END IF;
END;
$$;

-- Ask PostgREST to pick up the new grants/view immediately.
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================================
-- OPTIONAL (do not run blindly): case-insensitive uniqueness.
-- Run only after confirming there are no existing duplicates:
--   SELECT lower(username), count(*) FROM public.pixelcoder_profiles
--   GROUP BY 1 HAVING count(*) > 1;
-- Then:
--   CREATE UNIQUE INDEX IF NOT EXISTS pixelcoder_profiles_username_lower_uniq
--     ON public.pixelcoder_profiles (lower(username));
--   CREATE UNIQUE INDEX IF NOT EXISTS pixelcoder_profiles_email_lower_uniq
--     ON public.pixelcoder_profiles (lower(email));
-- ============================================================================
