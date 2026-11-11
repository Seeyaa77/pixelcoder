# PixelCoder Security Notes

Scope: `public.pixelcoder_profiles` and the client auth flow in
`src/lib/auth.js` / `src/lib/supabase.js` / `src/components/AuthModal.jsx`.

> **Status:** `supabase/migrations/0001_harden_profiles.sql` has **not** been
> applied. This repo has no service-role key and no dashboard access, so the
> owner must run it manually (steps below). Until then, risks 1–3 are live
> (existing rows may still hold plaintext; new registrations are hashed).

## Architectural constraint (read before running the migration)

Login verification is **client-side** in this build (no server runtime/Edge
Function). PBKDF2 verification needs the stored verifier, so the app must be
able to `SELECT password_hash`. That is exactly what section 2 of the
migration revokes. Therefore the migration is written as a **target state**
with two gated sections:

| Section | Effect | Run now? |
| --- | --- | --- |
| 1 | adds `avatar_url` / `character_name` columns | yes |
| 2 | revokes `password_hash` SELECT | **only after server-side verification** |
| 3 | RLS policies | yes |
| 4 | `public_profiles` view | yes |
| 5 | XP/gold/role guard trigger | **only after a verified progress RPC** |
| 6 | username shape constraint | yes |

If section 2 is run against the current client, every login returns
`42501 permission denied for table pixelcoder_profiles` (the UI shows the
generic "Could not reach the account service" message). If section 5 is run
before an RPC exists, gameplay still works offline but remote XP/leaderboard
positions freeze.

To keep the revoke *and* login working without an Edge Function, split the
verifier: store `salt` and `iterations` in readable columns (or return them
from a `SECURITY DEFINER` RPC), have the client derive the PBKDF2 key from the
entered password, and send only the derived key to a `SECURITY DEFINER` RPC
that compares it to `password_hash` in SQL and returns the sanitized profile.
The hash never leaves the database, the client never sends the raw password,
and offline cracking requires database access. That RPC is not part of this
change (it needs database access to deploy and test).

## Three live risks

### 1. Passwords are stored in plaintext (CRITICAL)

`registerUserBackend()` used to insert `password_hash: password` verbatim, and
login compared raw strings. Anyone with database or REST read access (risk 2)
therefore reads real player passwords, including passwords reused on other
sites. Every existing account created before this change is affected.

### 2. Any anonymous visitor can read `password_hash` (CRITICAL)

The anon publishable key is shipped to every browser, and the old code used
`select('*')` with no column restrictions. A direct REST call such as

```
GET /rest/v1/pixelcoder_profiles?select=username,password_hash
```

returns the hashes/plaintext for all players. The anon key is public by
design; the table must never expose that column.

### 3. XP / gold / role are client-writable (HIGH)

Because auth is custom (no Supabase JWT identity), any visitor can PATCH any
row with the anon key, e.g. `{"total_xp": 999999, "role": "admin"}`. This
corrupts the leaderboard and can unlock the admin panel. RLS alone cannot fix
this without a real user identity; the migration adds a guard trigger instead.

## What the client does now

- **Hashing (`src/lib/auth.js`):** PBKDF2-SHA256, 210000 iterations, random
  16-byte salt, 32-byte key, stored as
  `pbkdf2$210000$<base64 salt>$<base64 key>`. Hashing happens in the browser
  before the value is sent to Supabase.
- **Verification:** `verifyPassword()` parses the stored format, re-derives the
  key with the stored salt/iterations, and compares in constant time. Malformed
  or missing values fail closed.
- **Legacy upgrade (explicit path):**
  1. `verifyPassword(password, stored)` finds no `pbkdf2$` prefix, so it
     compares the raw strings (legacy plaintext) and returns
     `{ ok: true, needsUpgrade: true }` on success.
  2. `loginUserBackend()` only then computes `hashPassword(password)` and
     UPDATEs `password_hash` for that row (best effort — a blocked UPDATE is
     logged and does not fail the login).
  3. Any later login sees a `pbkdf2$...` value; if its iteration count is below
     210000 it is upgraded the same way (`needsUpgrade` on low iterations).
  4. A failed legacy compare never upgrades anything and counts toward the
     throttle. Rows that never log in again keep their old value — see
     "Password reset / rotation" below.
- **No hash in app state:** registration/login use explicit column lists and
  `sanitizeUser()` deletes `password_hash`/`passwordHash`. Sessions are built
  with `createSession()` (7-day `expiresAt`), expired sessions are cleared by
  `getStoredSession()`, and `saveStoredSession()` sanitizes before writing.
  Legacy localStorage blobs that already contain a hash are scrubbed on read.
- **Login throttling:** 5 failed attempts per identifier (case-insensitive,
  localStorage key `pixelcoder_login_throttle_v1`) trigger a 30-second lockout
  with a friendly error. Client-side only — it stops casual brute force, not a
  scripted attacker rotating identifiers/IPs.
- **Registration validation:** username `^[a-zA-Z0-9_]{3,20}$`, email format,
  8+ character password, not equal to username, rejects 10 common passwords.
  Duplicate username/email checks use two escaped `ilike` lookups
  (case-insensitive, wildcards neutralized) instead of `.or()`, removing
  PostgREST filter injection. (No unique index yet — see the optional block at
  the end of the migration.)
- **Leaderboard:** explicit safe columns only, never `password_hash`.
- **Progress sync:** whitelisted columns only; numbers clamped
  (`total_xp <= 10,000,000`, `gold <= 100,000,000`, `hp` bounded by `max_hp`,
  etc.); `cleared_stages` restricted to the three known tracks. This is
  tamper *resistance* on the client, not enforcement — enforcement is the
  migration trigger.
- **New helpers:** `changePasswordBackend(username, currentPassword,
  newPassword)` and `updateProfileBackend(username, { avatar_url,
  character_name })` (whitelisted fields, URL/name validation).

## Owner steps (Supabase dashboard, no CLI required)

1. **Back up first.** In the SQL Editor run:
   ```sql
   select count(*) from public.pixelcoder_profiles;
   ```
   Export the table (Table Editor → Export CSV) before changing grants.
2. Open your project → **SQL Editor** → New query.
3. Paste the full contents of
   `supabase/migrations/0001_harden_profiles.sql`.
   - **Phase A (safe today):** run sections 1, 3, 4, and 6 only. Comment out
     sections 2 and 5.
   - **Phase B:** after a server-side verification endpoint exists, run
     section 2 (hash revoke). Re-test login immediately.
   - **Phase C:** after a verified `grant_stage_completion` RPC exists, run
     section 5 (XP/gold/role guard).
   The script is one transaction; split it into those phases if applying
   gradually (keep section 1 with 3/4/6).
4. Verify the grants:
   ```sql
   select grantee, privilege_type, column_name
   from information_schema.column_privileges
   where table_schema = 'public'
     and table_name = 'pixelcoder_profiles'
     and grantee in ('anon', 'authenticated')
   order by grantee, column_name;
   ```
   After Phase B, `password_hash` must not appear. Before Phase B it will
   appear — that is expected, and it is the reason Phase B is gated.
   Also confirm RLS is on:
   ```sql
   select relrowsecurity from pg_class
   where oid = 'public.pixelcoder_profiles'::regclass;  -- true
   ```
5. Verify the REST surface (replace URL/key):
   ```bash
   # Phase A: leaderboard view is readable and hash-free
   curl "$VITE_SUPABASE_URL/rest/v1/public_profiles?select=*&limit=3" \
     -H "apikey: $VITE_SUPABASE_ANON_KEY"
   # expected: 200, no email / no password_hash

   # Phase B only: direct hash reads must be denied
   curl "$VITE_SUPABASE_URL/rest/v1/pixelcoder_profiles?select=*&limit=1" \
     -H "apikey: $VITE_SUPABASE_ANON_KEY"
   # expected after Phase B: 42501 permission denied
   # (before Phase B this returns rows — do not treat it as success)
   ```
   The migration sends `NOTIFY pgrst, 'reload schema'`; if PostgREST still
   caches the old schema, wait ~10s or restart the API from Project Settings.
6. **Plan for progress sync.** The guard trigger rejects client updates to
   `total_xp`/`gold`/`role`. `syncProgressToBackend()` catches the error and
   logs it, so gameplay keeps working locally but remote XP/leaderboard
   positions freeze. Rollout options:
   - **Recommended:** deploy a `SECURITY DEFINER` RPC (e.g.
     `public.grant_stage_completion`) that validates the stage server-side,
     switch the client to call it, then run section 5.
   - **Interim:** leave section 5 commented out and accept the tampering risk
     (the other fixes still apply).
7. Copy `.env.example` to `.env` if setting up a new machine and fill in
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. `.env` is git-ignored and
   must never be committed.

## Password reset / rotation

- **Legacy plaintext rows** are upgraded only after a successful login. Rows
  owned by inactive players stay plaintext indefinitely. After Phase B they
  are no longer readable via the API, but they are still plaintext at rest
  (until Phase B they are readable). Options: force a password reset for those
  accounts, delete dormant accounts, or run a one-off rotation with a
  service-role script.
  A service-role rotation must hash with the same parameters
  (PBKDF2-SHA256, 210000 iterations, 16-byte salt, 32-byte key,
  `pbkdf2$210000$<salt>$<hash>`) so `verifyPassword()` accepts it.
- **Force reset:** there is no email service wired up. Either add one, or set
  the account's `password_hash` to a random PBKDF2 hash of an unknown value
  (service role) so nobody can log in until it is rotated.
- **Compromised accounts:** use `changePasswordBackend()` (verifies the current
  password, re-hashes) or reset via the dashboard. Changing a password does not
  invalidate other browsers' localStorage sessions; sessions expire after 7
  days. To revoke immediately, clear the `pixelcoder_session_v3` key /
  localStorage on trusted devices.
- **Anon key exposure:** the anon key is public by design and must not be
  rotated to "fix" this table — rotate it only if it was paired with a leaked
  service-role key or abused beyond rate limits, and update `.env` + hosting
  env vars.
- **Never** put a service-role key in a `VITE_*` variable: Vite inlines those
  into the browser bundle.

## Known residual risks

- **Client-side verification still needs the verifier**: until Phase B lands,
  `password_hash` remains readable through the anon key (now PBKDF2, not
  plaintext). Treat hashes as public until the verification RPC exists.
- **Emails are publicly readable** through the column grants (login by email
  needs to filter on it). Consider removing `email` from anon SELECT once
  login-by-email moves to an RPC.
- No per-user authorization: anyone can update another player's non-guarded
  columns (weapon, armor, hp, potions) and can register unlimited accounts.
  Fixing this requires real Supabase Auth (JWT `sub` scoping) or signed RPCs.
- Client-side throttling is bypassable (clear localStorage, change identifier).
- Duplicate usernames/emails can still race past the app-level check until the
  optional unique indexes at the end of the migration are applied.
- `password_hash` can still be written by clients (INSERT/UPDATE table grants
  are required for registration and hash upgrade); the migration only blocks
  reading it.
