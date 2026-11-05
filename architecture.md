# PixelCoder - System Architecture & Database Specification

**Version:** 1.0.0  
**Backend & Database:** Supabase (PostgreSQL 15+, GoTrue Auth, Storage, Edge Functions)  
**Frontend Client:** React.js (Vite, Single Page Application)  
**Security Model:** Role-Based Access Control (RBAC) + PostgreSQL Row-Level Security (RLS)  

---

## 1. System Topology Overview

```
                      +---------------------------------------+
                      |           Client Web Browser          |
                      |  React 18 SPA + Neobrutalist View     |
                      |  HTML5 2D Pixel Canvas Game Engine    |
                      +-------------------+-------------------+
                                          |
                        HTTPS / WSS REST  |  Supabase JS SDK v2
                                          v
+-----------------------------------------------------------------------------------+
|                            Supabase Cloud Infrastructure                          |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |     Supabase Auth      |  |     PostgreSQL DB      |  |   Edge Functions    |  |
|  |  (GoTrue JWT Session)  |  |  (Tables, Views, RLS)  |  |  (Deno Sandbox V8)  |  |
|  +-----------+------------+  +-----------+------------+  +----------+----------+  |
|              |                           |                          |             |
|              +---------------------------+--------------------------+             |
|                                          |                                        |
|                          Row Level Security (RLS) Gates                           |
|                      Strict Column Checks & JWT Claims                            |
+-----------------------------------------------------------------------------------+
```

---

## 2. Supabase PostgreSQL Schema & DDL

### 2.1 Enums & Types
```sql
-- Role types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Programming language tracks
CREATE TYPE language_track AS ENUM ('python', 'cpp', 'javascript');

-- Task submission outcome
CREATE TYPE task_status AS ENUM ('passed', 'failed', 'flagged_suspicious');
```

### 2.2 Table Definitions

#### `profiles` Table
Stores extended user profile, XP tally, and assigned role.
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(32) UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT '/assets/platformer/Character/Animations/Idle/idle1.png',
    role user_role DEFAULT 'user' NOT NULL,
    total_xp INTEGER DEFAULT 0 NOT NULL CHECK (total_xp >= 0),
    current_streak INTEGER DEFAULT 1 NOT NULL,
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### `stages` Table
Master curriculum catalog for Python, C++, and JavaScript.
```sql
CREATE TABLE public.stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track language_track NOT NULL,
    stage_number INTEGER NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    theory_content TEXT NOT NULL,          -- Markdown syllabus notes (w3schools style)
    starter_code TEXT NOT NULL,
    task_prompt TEXT NOT NULL,
    test_cases JSONB NOT NULL,             -- Array of inputs, expected outputs, hints
    xp_reward INTEGER DEFAULT 100 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_track_stage UNIQUE (track, stage_number)
);
```

#### `user_progress` Table
Tracks individual stage unlock state, completion timestamp, and attempts.
```sql
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE NOT NULL,
    is_cleared BOOLEAN DEFAULT FALSE NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    attempts_count INTEGER DEFAULT 1 NOT NULL,
    cleared_at TIMESTAMPTZ,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_stage UNIQUE (user_id, stage_id)
);
```

#### `task_submissions` Table
Immutable audit log of all code submissions for verification and anti-cheat inspection.
```sql
CREATE TABLE public.task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE NOT NULL,
    submitted_code TEXT NOT NULL,
    status task_status NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    ip_address INET,
    client_entropy JSONB,                  -- Keystroke count, time elapsed on page
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### `leaderboard_cache` View
High-performance ranking view indexed by `total_xp`.
```sql
CREATE OR REPLACE VIEW public.global_leaderboard AS
SELECT 
    p.id AS user_id,
    p.username,
    p.avatar_url,
    p.total_xp,
    p.current_streak,
    COUNT(up.id) FILTER (WHERE up.is_cleared = TRUE) AS stages_cleared,
    DENSE_RANK() OVER (ORDER BY p.total_xp DESC, p.created_at ASC) AS rank
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
GROUP BY p.id, p.username, p.avatar_url, p.total_xp, p.current_streak;
```

---

## 3. Row Level Security (RLS) Policies

All tables have RLS explicitly enabled:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
```

### 3.1 RLS Rules
```sql
-- 1. Profiles: Public read, User can only update their own username/avatar
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents self-escalating role
);

-- 2. Stages: Public read for active stages, Admin full control
CREATE POLICY "Anyone can view active stages" 
ON public.stages FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage stages" 
ON public.stages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. User Progress: Users see and update their own progress
CREATE POLICY "Users view own progress" 
ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert/update own progress" 
ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress" 
ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- 4. Submissions: Users insert their submissions, Admins read all
CREATE POLICY "Users insert own submissions" 
ON public.task_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own submissions" 
ON public.task_submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all submissions" 
ON public.task_submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 4. Auth & Role Lifecycle Flow

```
1. REGISTRATION / LOGIN:
   User signs up via Supabase GoTrue (Email + Password or GitHub OAuth)
   --> Postgres Trigger `on_auth_user_created` creates default record in `public.profiles`
   --> Default assigned role: 'user'

2. JWT TOKEN CLAIMS:
   Access token issued with user UID and role metadata
   Token refreshed automatically via Supabase client background worker

3. ROLE ELEVATION / ADMIN ACCESS:
   Admin designation is guarded by Database-only SQL seed or Super-admin manual update.
   Client-side checks inspect `profile.role === 'admin'`.
   Backend Postgres RLS rejects any mutation to `stages` or viewing `anti_cheat_logs`
   unless the user's UID maps to `role = 'admin'` in `profiles`.
```
