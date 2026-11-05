# PixelCoder - UI/UX Design System & Component Architecture

**Version:** 1.0.0  
**Design Paradigm:** Neobrutalism x 2D Pixel-Art Retro  
**Primary Color (Base/Canvas):** `#F3F6F4` (Off-white / Pale Sage Crisp White)  
**Secondary Color (Brand Accent):** `#7D8D39` (Olive Green)  
**Contrast Color (Borders & Hard Shadows):** `#1E2522` / `#111827` (Deep Ink Black)  
**Card Surfaces & Highlights:** `#FFFFFF`, `#E7EDE7`, `#D5E0B5`  

---

## 1. Neobrutalist Design System Specifications

PixelCoder fuses high-energy **Neobrutalism** with **16-bit 2D Pixel Art** aesthetics to create an educational playground that feels tactile, bold, and intrinsically rewarding.

### 1.1 Color Tokens & Palette
| Token Name | Hex Code | Usage | Neobrutalist Role |
| :--- | :--- | :--- | :--- |
| `color-bg-base` | `#F3F6F4` | Global viewport background | Off-white canvas with paper feel |
| `color-brand-olive` | `#7D8D39` | Active buttons, success, brand logo, badges | High-impact olive green accent |
| `color-brand-light` | `#E3EBD0` | Card hover backgrounds, code callouts | Soft secondary tint |
| `color-brand-dark` | `#4E5924` | Pressed buttons, focused strokes | Deep earth tone for active state |
| `color-ink-border` | `#1E2522` | All structural borders & shadows | 3px - 4px solid bold outline |
| `color-surface-card`| `#FFFFFF` | Modal dialogs, editor panels, question boxes | High contrast pure white card |
| `color-warning-amber`| `#F59E0B` | XP badges, streak counters, hints | Vibrant retro arcade amber |
| `color-danger-crimson`| `#EF4444`| Failed test cases, syntax error banners | Bold retro arcade red |
| `color-cyan-glow` | `#06B6D4` | JavaScript track badge & code tokens | Tech cyan accent |
| `color-python-blue` | `#3B82F6` | Python track badge | Classic Python blue |
| `color-cpp-indigo` | `#6366F1` | C++ track badge | Systems C++ deep indigo |

### 1.2 Elevation, Borders & Hard Shadow Mechanics
Neobrutalism forbids fuzzy Gaussian blurs or subtle drop shadows. Every elevated component utilizes **hard directional block shadows**:
- **Default Card Shadow:** `box-shadow: 5px 5px 0px #1E2522;`
- **Interactive Button Normal:** `box-shadow: 4px 4px 0px #1E2522;`
- **Interactive Button Hover:** `translate: -2px -2px; box-shadow: 6px 6px 0px #1E2522;`
- **Interactive Button Pressed (Active):** `translate: 4px 4px; box-shadow: 0px 0px 0px #1E2522;`
- **Standard Border Width:** `3px solid #1E2522` (or `4px solid #1E2522` on primary containers).
- **Border Radius:** Deliberately sharp or slightly rounded retro brutalism (`rounded-none` or `rounded-md` max 6px).

### 1.3 Typography Hierarchy
- **Header Font:** Space Grotesk / Outfit (`sans-serif`, weight 800-900, uppercase tracked, retro brutalist headline).
- **Body Font:** Inter / Public Sans (`sans-serif`, weight 500-600, ultra-readable for coding concepts).
- **Game / HUD Font:** `'Press Start 2P'`, `VT323`, or monospace pixel typography.
- **Code Editor Font:** `JetBrains Mono`, `Fira Code`, or `Courier New` monospace with syntax highlighting.

---

## 2. React Component Architecture

```
src/
├── assets/                  # Local static icons & graphics
├── components/
│   ├── common/              # Shared Neobrutalist UI elements
│   │   ├── NeoButton.jsx    # Brutalist button with 4px hard shadow & tactile press
│   │   ├── NeoCard.jsx      # Heavy border card container with color header
│   │   ├── NeoBadge.jsx     # High-contrast tag pill (Track, XP, Status)
│   │   └── NeoModal.jsx     # Centered modal with thick backdrop shade
│   ├── game/                # 2D Canvas & Pixel Art Stage View
│   │   ├── GameCanvas.jsx   # HTML5 2D Canvas rendering animated pixel character & stage
│   │   ├── CharacterSprite.jsx # Sprite sheet player animations (idle, run, victory)
│   │   ├── StageBackdrop.jsx # Retro platformer backdrop & collectibles
│   │   └── XpBurstEffect.jsx # Canvas particle burst on task completion
│   ├── learning/            # Syllabus & Lesson Content View
│   │   ├── LessonTheory.jsx # w3schools-style concise theory & syntax boxes
│   │   ├── CodePlayground.jsx # Interactive code challenge runner & terminal emulator
│   │   ├── TaskQuiz.jsx     # Multiple-choice / drag-drop coding challenge
│   │   └── OutputConsole.jsx# Execution feedback, stdout, test assertions
│   ├── navigation/          # Track & Stage Selection
│   │   ├── HeaderHUD.jsx    # Top status bar: Player Level, Streak, XP, Role badge
│   │   ├── TrackSelector.jsx# Python / C++ / JavaScript tabs
│   │   └── StageMapGrid.jsx # 10-20 level nodes with lock/unlock status & star ratings
│   ├── leaderboard/
│   │   └── LeaderboardModal.jsx # Global rankings table with brutalist rows
│   └── admin/
│       └── AdminDashboard.jsx   # Anti-cheat logs, player score audit, stage editor
├── data/
│   ├── syllabusTracks.js    # w3schools-curated curriculum & 15 stages per language
│   └── mockLeaderboard.js   # Seeded competitive ranking data
├── lib/
│   ├── supabase.js          # Supabase client instantiation & auth helpers
│   └── codeEvaluator.js     # Client-side challenge assertion engine
├── App.jsx                  # Main state coordinator & view router
└── main.jsx                 # React root mounting & styles entry
```

---

## 3. 2D Pixel Asset Management & Integration Strategy

### 3.1 Local Asset Ingestion & Directory Mapping
Local assets from `C:\Users\fakeg\Downloads\asset` are organized into `public/assets/` to ensure zero-build overhead and immediate asset caching:

```
public/assets/
├── platformer/
│   ├── Character/
│   │   └── Animations/
│   │       ├── Idle/        # idle1.png, idle2.png, idle.gif (16x16 / 32x32)
│   │       ├── Run/         # run1.png to run4.png, run.gif
│   │       ├── Jump/        # jump1.png, jump2.png
│   │       └── Fall/        # fall1.png to fall3.png
│   ├── Tileset/             # tileset.png (Platform ground, ladders, spikes)
│   └── Objects/             # Chests, coins, flags, signposts
├── rpg/
│   ├── tilemap/             # RPG_Fantasy_Starter_Pack.png
│   └── tiles/               # Item icons (scrolls, books, potions, gems)
└── horror/                  # Atmospheric sprites and obstacle tiles
```

### 3.2 CSS Pixel Rendering Rules
To maintain pixel-perfect crispness without blurry bilinear scaling on modern Retina displays:
```css
.pixelated {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

### 3.3 HTML5 Canvas 2D Game Loop Integration
The game screen sits at the top half of the challenge interface. A lightweight 60 FPS requestAnimationFrame canvas loop:
1. Clears frame buffer with retro sky gradient (`#9CB380` to `#7D8D39`).
2. Renders tiled platform ground using `tileset.png`.
3. Draws stage signpost showing current stage number (e.g., `Stage 03: Loops`).
4. Updates character state machine:
   - `IDLE`: Cycles character idle frames while user reads theory.
   - `TYPING / RUNNING`: Cycles run animation when user writes code in the editor.
   - `VICTORY`: Triggers jump animation + confetti burst when test cases pass.
   - `FAIL / HIT`: Triggers shake animation when validation fails.
