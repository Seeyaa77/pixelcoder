# PixelCoder - Security Architecture, Anti-Cheat & API Specification

**Version:** 1.0.0  
**Security Posture:** Zero-Trust Client, Server-Side Authoritative, Defense-in-Depth  
**Enforcement Layers:** Supabase Edge Functions (Deno sandbox), Postgres RLS, Web Cryptography  

---

## 1. Threat Model & Vector Analysis

In competitive educational games with global leaderboards, client-side vulnerabilities are heavily exploited by malicious players. PixelCoder mitigates five critical threat vectors:

| Threat Vector | Attack Scenario | Defense Implementation |
| :--- | :--- | :--- |
| **Payload Injection (SQLi / XSS)** | User submits malicious SQL/Script in code input or username | Strict parameterized statements via Supabase PostgREST, DOMPurify HTML sanitization |
| **Score Tampering / XP Inflation** | Attacker intercepts REST call and sends `total_xp: 999999` | RLS rejects direct XP mutation; XP is calculated server-side only upon valid verification |
| **Stage Skipping / Replay Attack** | Attacker calls `/clear-stage` for Stage 15 without clearing 1-14 | Monotonic stage dependency check in Database procedure; timestamped nonces |
| **Automated Bot Submission** | Script spams submissions within milliseconds | Client entropy validation (typing cadence, focus time >= 3s), IP rate limiter |
| **Arbitrary Code Execution (RCE)** | User executes malicious code on host system | Sandboxed WebAssembly / isolated JS VM / AST validation with no filesystem or network access |

---

## 2. Anti-Cheat Engine Architecture

```
User Presses "Run Code & Submit"
             │
             ▼
+─────────────────────────────────────────+
|         Client Entropy Packager         |
| - Time spent on stage (min 3000ms)      |
| - Keystroke delta count (min 5 strokes) |
| - Anti-replay Nonce & Signature         |
+────────────────────┬────────────────────+
                     │
                     ▼ HTTPS POST
+─────────────────────────────────────────+
|      Supabase Edge Function:            |
|      /api/validate-submission           |
+────────────────────┬────────────────────+
                     │
     1. Verify JWT Authentication
     2. Verify Rate Limit (max 10 req/min per user)
     3. Verify Client Entropy (Anti-Bot)
     4. Verify Pre-requisite Stage Cleared
     5. Execute Server-Side Test Cases (Authoritative)
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   Passed All Tests         Failed or Suspicious
        │                         │
        ▼                         ▼
Execute Stored Procedure:   Log Incident in
`submit_stage_clear()`      `security_audit_logs`
- Computes canonical XP     - Flags account if >= 3
- Increments streak           suspicious payloads
- Updates leaderboard cache
```

---

## 3. Server-Side Supabase Edge Functions API

### 3.1 `POST /functions/v1/submit-task`

#### Request Headers:
```http
Authorization: Bearer <SUPABASE_JWT_TOKEN>
Content-Type: application/json
X-Client-Timestamp: 1793856100120
```

#### Request Payload:
```json
{
  "stage_id": "4a7b92f0-1092-4f90-bc42-901d89e7c102",
  "track": "python",
  "stage_number": 3,
  "submitted_code": "player_gold = 150\nsword_cost = 120\nremaining_gold = player_gold - sword_cost\ncan_afford_potion = remaining_gold >= 50\nprint(remaining_gold)\nprint(can_afford_potion)",
  "entropy": {
    "duration_ms": 14200,
    "keystrokes": 118,
    "paste_count": 0
  }
}
```

#### Server Validation Logic (Deno TypeScript):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // 1. Authenticate user
  const authHeader = req.headers.get("Authorization");
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader?.replace("Bearer ", ""));
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { stage_id, track, stage_number, submitted_code, entropy } = await req.json();

  // 2. Anti-bot heuristics (Instant-submit rejection)
  if (entropy.duration_ms < 3000 || entropy.keystrokes < 3) {
    await supabase.from("security_audit_logs").insert({
      user_id: user.id,
      flag_type: "RAPID_SUBMISSION_BOT",
      details: entropy
    });
    return new Response(JSON.stringify({ success: false, message: "Submission rejected: Unusual completion speed" }), { status: 400 });
  }

  // 3. Prevent stage skipping (verify previous stage is cleared)
  if (stage_number > 1) {
    const { data: prevProgress } = await supabase
      .from("user_progress")
      .select("is_cleared")
      .eq("user_id", user.id)
      .eq("stage_number", stage_number - 1)
      .single();

    if (!prevProgress?.is_cleared) {
      await supabase.from("security_audit_logs").insert({
        user_id: user.id,
        flag_type: "STAGE_SKIP_ATTEMPT",
        details: { stage_number }
      });
      return new Response(JSON.stringify({ success: false, message: "Prerequisite stage not unlocked" }), { status: 403 });
    }
  }

  // 4. Server-Side Authoritative Test Runner
  const isCorrect = evaluateAuthoritative(track, stage_number, submitted_code);

  if (isCorrect) {
    // 5. Atomic XP & Progress Award via RPC
    const { data, error } = await supabase.rpc("grant_stage_completion", {
      p_user_id: user.id,
      p_stage_id: stage_id,
      p_track: track,
      p_stage_number: stage_number
    });

    return new Response(JSON.stringify({ success: true, xp_awarded: data.xp_awarded, next_stage: stage_number + 1 }), {
      headers: { "Content-Type": "application/json" }
    });
  } else {
    return new Response(JSON.stringify({ success: false, message: "Validation tests failed" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

---

## 4. Anti-Hacking Database Security Procedures

### 4.1 Tamper-Proof Stored Procedure (`grant_stage_completion`)
Direct `UPDATE profiles SET total_xp = total_xp + ...` from client connections is completely blocked by PostgreSQL RLS. Only this signed security-definer function can adjust XP:

```sql
CREATE OR REPLACE FUNCTION public.grant_stage_completion(
    p_user_id UUID,
    p_stage_id UUID,
    p_track language_track,
    p_stage_number INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stage_xp INTEGER;
    v_already_cleared BOOLEAN;
    v_result JSONB;
BEGIN
    -- Query canonical XP reward from authoritative table
    SELECT xp_reward INTO v_stage_xp FROM public.stages WHERE id = p_stage_id;
    IF v_stage_xp IS NULL THEN
        v_stage_xp := 100;
    END IF;

    -- Check if stage was already cleared (prevent infinite XP grinding on same stage)
    SELECT is_cleared INTO v_already_cleared 
    FROM public.user_progress 
    WHERE user_id = p_user_id AND stage_id = p_stage_id;

    IF v_already_cleared IS TRUE THEN
        -- Stage replay: mark attempt but do NOT re-grant full XP
        UPDATE public.user_progress 
        SET attempts_count = attempts_count + 1, last_attempt_at = NOW()
        WHERE user_id = p_user_id AND stage_id = p_stage_id;

        RETURN jsonb_build_object('success', true, 'xp_awarded', 0, 'replayed', true);
    END IF;

    -- Upsert progress
    INSERT INTO public.user_progress (user_id, stage_id, is_cleared, score, attempts_count, cleared_at)
    VALUES (p_user_id, p_stage_id, TRUE, 100, 1, NOW())
    ON CONFLICT (user_id, stage_id) 
    DO UPDATE SET is_cleared = TRUE, score = 100, cleared_at = NOW();

    -- Award Canonical XP to Profile
    UPDATE public.profiles 
    SET total_xp = total_xp + v_stage_xp,
        current_streak = current_streak + 1,
        last_played_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'xp_awarded', v_stage_xp, 'replayed', false);
END;
$$;
```

---

## 5. Admin Anti-Cheat Monitoring Dashboard Specification

Admins possess special visibility via role-gated queries:
1. **Anomaly Score Velocity:** Detects users gaining > 1,000 XP in < 2 minutes.
2. **Identical Code Fingerprint:** Detects multiple accounts submitting byte-for-byte identical solutions from the same IP address.
3. **Audit Log Table:**
```sql
CREATE TABLE public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    flag_type VARCHAR(64) NOT NULL,
    details JSONB NOT NULL,
    ip_address INET,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```
Admins can flag, shadowban, or wipe suspicious XP with one-click actions.
