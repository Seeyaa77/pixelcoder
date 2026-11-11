# Night Shift Report — PixelCoder

_Window: overnight, 2026-11-11. All work is committed and pushed to `origin/main`; you can just pull._

```
git pull origin main
npm install        # no new dependencies were added, but harmless
npm run check      # lint + 46 tests + curriculum verifier + build
```

Last commit: `3fcf272 fix(python): run Pyodide inside a killable worker (20s hard stop)`

---

## TL;DR

The game looked finished but **almost nothing was actually enforced**. You could clear every
stage by typing the expected string, passwords were stored in plain text and readable by anyone,
XP/gold came from the client, 18 of 45 "stages" were `cout << 20;`-style fillers, and the Python
engine could freeze the whole tab. All of that is fixed and verified in a real browser.

| Area | Before | After |
| --- | --- | --- |
| Passing a stage | regex on your source text | real execution: output must match `expectedOutput` |
| Python | main thread, unkillable | Web Worker, 20s hard stop, fresh namespace per run |
| JavaScript | broken console capture | isolated Blob worker, 5s kill, real stdout |
| C++ | simulated / broken includes | real compile+run via Piston, auto headers (`vector`, `map`, …) |
| Passwords | plaintext in a public table | PBKDF2-SHA256, 210k iterations; legacy rows upgraded on login |
| Progress authority | client wrote XP/gold freely | server state read back, local save validated, corrupt saves recovered |
| Placement | stage 1 pre-cleared, unreachable? no — misleading | clean start, real unlock chain |
| Curriculum | 18 placeholder stages | 45 real exercises, every reference solution executed |
| Admin panel | hardcoded fake users | live readable rows + heuristic integrity flags |
| Onboarding | none | 4-step How To Play, first-run auto-open, guest trial |
| Bundle | one 600 kB chunk | entry 156 kB + cached vendor chunks, modals lazy |
| Tests | none | 46 node:test cases + curriculum verifier + E2E scripts |

---

## What changed, by area

### 1. Authentication & account security (`src/lib/auth.js`, `src/lib/supabase.js`, `AuthModal.jsx`)
- PBKDF2-SHA256, 210 000 iterations, per-user 16-byte salt, stored as
  `pbkdf2$210000$<salt>$<hash>`. Legacy plaintext rows are transparently upgraded on the next
  successful login, so existing players keep their accounts.
- Password policy (min 8 chars, not equal to the username, common-password blocklist) plus a
  strength meter and confirm-password field in the modal.
- Failed-login throttling: 5 attempts then 30s lockout.
- Sessions are validated on read; `password_hash` is never put into localStorage or app state.
- Every read uses an explicit `PROFILE_COLUMNS` list, so the hash cannot leak through `select('*')`.
- `.or()` string interpolation (PostgREST filter injection) replaced with escaped `ilike` queries.
- Known limits (documented in `SECURITY.md`): the anon key is public and the current RLS lets a
  client write its own row, so XP is still client-trusted until you apply the migration below.

### 2. Real code execution (`src/lib/evaluator.js`)
- **JavaScript**: Blob Web Worker, 5s terminate, captured `console.*`, errors surfaced.
- **Python**: Pyodide 0.26.4 inside a dedicated Worker. A fresh `{__name__:'__main__'}` namespace
  per run; the timer calls `terminate()`, so `while True:` stops at 20s instead of freezing the
  tab; the next run boots warm in ~1.7s. CDN failure degrades to the static check (clearly labelled
  `STATIC CHECK ONLY`) rather than hanging.
- **C++**: real compile/run through the Piston API. `prepareCppSource` now auto-includes the
  headers learners forget (`<vector>`, `<string>`, `<map>`, `<set>`, `<algorithm>`, `<cmath>`,
  `<sstream>`, `<memory>`) and wraps bare snippets in `main()`.
- Passing requires `stdout == expectedOutput` (whitespace-normalised) **and** the stage regex.
  Guessing the expected string no longer works.

### 3. Curriculum (`src/data/syllabus.js`) — 18 filler stages rewritten
C++ 6–15 and JavaScript 8–15 became real problems (arrays/indexing, references, pointers,
classes/virtual methods, `vector`, templates, `Map`/`Set`, regex, async/await, listeners, game
loop math). Python reference solutions that referenced undeclared variables were made
self-contained. `npm run verify:curriculum` executes **every** reference solution (node, python,
g++) and asserts the exact expected output — 45/45 pass.

### 4. Game integrity & UX (`src/lib/progress.js`, `App.jsx`)
- Stored saves are normalised (`clearedStages` per track, clamped HP, defaults merged) so an old or
  corrupted blob can no longer crash the app.
- Stage 1 no longer starts pre-cleared, the unlock chain is real, and locked stages are disabled.
- Rewards/damage/potions/weapons go through pure functions in `progress.js` (unit-tested), not
  inline arithmetic in the component.
- Weapon ownership: equipping a new weapon charges once, re-equipping is free.
- Hint cost rescaled (`min(25 + 3×(stage−1), 60)`) — the old `25 × stage` was unaffordable after
  stage 4 — and purchased hints persist per stage.
- First-run onboarding (4 steps, skippable, remembered), guest trial mode with a "save to account"
  banner, guest progress merged into the account on registration.
- Toasts replace `alert()`, `ErrorBoundary` gives a way out of a crash, and the modal shell got a
  focus trap, Escape/backdrop close and scroll lock. All modals are lazy-loaded.
- `index.html` got real metadata/OG/manifest/PWA icons, `vercel.json` got security headers
  (CSP shipped as report-only first, because the app loads Pyodide and Piston).

### 5. Admin & anti-cheat (`src/components/AdminPanel.jsx`, `src/lib/admin.js`)
The old panel showed invented users and fake cheat logs. It now loads only gameplay columns
(no emails, no hashes), renders real totals/averages/per-track clears, and flags anomalies:
XP above the 45-stage ceiling, impossible or duplicated stage ids, odd gold, future timestamps,
unknown roles. It is read-only on purpose — banning needs a service key, which must never ship to
the browser. `tests/admin.test.js` covers the summariser.

---

## Verification performed (not claims — rerun them)

Engine-level, in headless Chrome against the real app modules:

```
runPython  -> hello 1                       (real, 8.5s cold)
runPython  -> leaked variable visible? False (fresh namespace)
runPython  -> while True: pass  => "Python timed out after 20s and was stopped." (20.0s)
runPython  -> print("back") => back         (recovery, 1.7s)
runCpp     -> Ready Player 1                (real, 6.3s)
runCpp     -> vector<int> auto-included => "3 6"
runJavaScript -> while(true){} => timeout at 5.01s
```

Product-level flows (guest, no account needed):

- Python stage 1: `print("Aria")` does **not** clear; the real solution clears the stage
  (100 XP, `clearedStages.python = [1]`, no hash in the save).
- JavaScript stage 1 and C++ stage 1 both run and match.
- Locked stage 3 cannot be entered (button disabled, guard in `handleSelectStage`).
- Admin console (as an admin): live metrics 10,750 XP / 4 players / ceiling 12,000, player table
  with real rows, integrity tab reports no anomalies, zero console errors.
- Mobile 390×844: `scrollWidth === 390`, no horizontal overflow.
- `npm run check` is green: oxlint clean, 46/46 tests, 45/45 curriculum stages, build 2.0s.

Real Supabase round-trip: registered a throwaway account with the new hash, logged in, wrong
password rejected, progress sync wrote back and re-read correctly, no hash in the returned session.

---

## Your action items (I could not do these without your credentials)

1. **Delete two QA rows** in `pixelcoder_profiles` (I could not delete them: RLS blocks anon
   `DELETE`): `qa_test_ignore` (a test row I neutralised) and `night_qa_2026`
   (`night.qa.2026@example.com`). Both are harmless but they will show up in leaderboards.
2. **Apply the database hardening**, `supabase/migrations/0001_harden_profiles.sql`. Read
   `SECURITY.md` first: section 2 (revoking `password_hash` from SELECT) **breaks client-side login
   until you expose a login RPC**, so start with sections 1, 3, 4, 6. Until then, anyone with the
   anon key can still read hashes and spoof XP.
3. **Move the auth/XP writes server-side** (Supabase Edge Function or RPC) — that is the only real
   fix for a public anon key. The client is hardened, but a determined player can still call the
   REST API directly.
4. Optional: set `CSP` from report-only to enforced once you confirm Pyodide + Piston still load
   in production, and add a real deploy URL to the OG tags (I left them out rather than guess).

---

## Known gaps I deliberately left

- Crystal/armor/shield upgrades still cost gold but do not change combat maths.
- No account deletion or password reset email flow (needs server-side/service key).
- Python's first load is a ~10 MB Pyodide download (cached afterwards); a self-hosted copy would
  remove the CDN dependency.
- C++ depends on the public Piston instance (rate limits) — a fallback message is shown, but a
  paid/self-hosted compiler would be sturdier.
- i18n is complete for UI chrome and stage theory, but a few newer strings are EN-only.
- No CI workflow yet: `npm run check` is ready to drop into GitHub Actions.

---

## Files worth opening first

| File | Why |
| --- | --- |
| `SECURITY.md` | threat model, what is fixed, what still needs the dashboard |
| `src/lib/evaluator.js` | the three runners; the Python worker is the interesting part |
| `src/lib/progress.js` | all economy rules as pure, tested functions |
| `src/lib/auth.js` | PBKDF2 + session + throttling |
| `scripts/verify-syllabus.mjs` | executes every stage solution (great CI gate) |
| `supabase/migrations/0001_harden_profiles.sql` | the RLS plan, in applyable sections |
