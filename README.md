# PixelCoder 🎮👾

A 2D pixel-art educational web game focused on teaching coding (Python, C++, JavaScript) with w3schools-style curriculum, Neobrutalism design, interactive code editor, canvas sprite animations, and anti-cheat security.

## 🌟 Key Features
- **3 Language Tracks:** Python, C++, JavaScript (15 stages each, 45 stages total).
- **2D Pixel Art Canvas View:** Real platformer sprites (Idle, Run, Victory) integrated into the Neobrutalist UI.
- **Interactive Code Runner:** Live feedback, simulated AST assertion, hints, and error diagnostics.
- **Anti-Cheat Engine:** Client entropy logging, monotonic stage unlocks, server-side authoritative RPC validation (`security_api.md`).
- **Global Leaderboard & Admin Hub:** Track XP, streaks, user progress, and suspicious payload audit logs.

## 🎨 Color Palette & Neobrutalism UI
- **Primary Canvas:** `#F3F6F4` (Off-white / Pale Sage Crisp White)
- **Secondary Accent:** `#7D8D39` (Olive Green)
- **Ink Borders:** `#1E2522` (3-4px bold borders with 4-6px hard drop shadows)

## 📚 Architectural & Technical Documentation
1. [`design.md`](./design.md) - UI/UX Neobrutalism styling guide, React component architecture, and asset management strategy.
2. [`architecture.md`](./architecture.md) - Complete system architecture, Supabase PostgreSQL schema with RLS policies, and Auth/Role flow.
3. [`task.md`](./task.md) - w3schools-based curriculum mapping detailing the first 5 stages for Python, C++, and JavaScript with validation logic.
4. [`security_api.md`](./security_api.md) - API endpoints, anti-cheat validation, payload injection defenses, and Supabase Edge Functions.

## 🚀 Deployment
- Frontend: Deployed to Vercel
- Backend & Database: Supabase PostgreSQL + Edge Functions
