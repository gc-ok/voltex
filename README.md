# VOLTEX — Interactive Volleyball Playbook

VOLTEX is a web-based volleyball playbook engine built for coaches and players. It renders animated plays on an SVG court, validates serve-receive formations, and includes a quiz mode for player training.

This is the Next.js/React conversion of the original single-file HTML5 prototype (`Volleyball_mvp.html`). The architecture is designed to scale into a multi-tenant SaaS platform with authentication, role-based access, and persistent storage.

## Tech Stack

- **Next.js 16** — App Router, TypeScript, Turbopack
- **Zustand 5** — 6 lightweight stores with `persist` middleware, `getState()` pattern for 60fps animation without re-render storms
- **React SVG** — `React.memo`'d court components (background renders once, tokens memo on x/y)
- **CSS Custom Properties** — theming via variables, no Tailwind

## Getting Started

**Prerequisites:** Node.js v18+

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

**28 Animated Plays** — 5-1 serve receive (6 rotations), 5-1 serving (2), 6-2 (3), offense (10), defense (7). Each play has multiple phases with keyframe interpolation and quadratic easing.

**Play Controls** — Play/pause, reset, speed (0.5x–2x), ghost trails, timeline scrubber.

**Editor Mode** — Drag players on the court. Live serve-receive violation detection (depth + lateral overlap rules). Reset to original positions.

**Quiz Mode** — 15 questions covering rotation recognition, play identification, and defensive systems. The play loops on the court while the user answers.

**Setup Wizard** — Guided 5-step onboarding for coaches:
- Step 0: Team name
- Step 1: Offense system (5-1, 6-2, 4-2)
- Step 2: Defense type (perimeter, rotational, man-up) — seeds all rotation positions
- Step 3: Per-rotation walkthrough — animated serve and serve-receive sequences for all 6 rotations with confirm/edit/reset per scenario. Coaches drag players to customize positions at any phase.
- Step 4: Roster (player names)

**My Team Panel** — Team configuration outside the wizard:
- System, defense type, rotation, and formation selectors
- Strategy profiles (save/load/delete named configurations)
- Attack coverage settings (blocker count, direction-based positioning)
- Roster management with player name overrides

**Rotation-Aware Defense** — Defense positions generated per rotation based on who is front row vs back row, using `ROTATION_LAYOUTS` and `DEFENSE_SCHEMAS`. Changing defense type regenerates all 18 rotation defaults (6 rotations × 3 systems).

**Strategy Profiles** — Save snapshots of system + defense type + all rotation defaults + coverage. Load to instantly swap configurations.

**Rally Builder** — Chain multiple plays into a sequence and animate them as a continuous rally.

## Project Structure

```
voltex/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── app/
│   │   ├── globals.css              # CSS custom properties, reset, font imports
│   │   ├── layout.tsx               # Root layout — metadata, body wrapper
│   │   ├── page.tsx                 # Landing page with animated court demo
│   │   └── app/
│   │       ├── layout.tsx           # App layout — sidebar, court, panels
│   │       └── page.tsx             # Main app page — assembles all components
│   │
│   ├── data/
│   │   ├── types.ts                 # Core types: PlayerId, XY, Phase, Play, RotationDefaults, StrategyProfile, etc.
│   │   ├── constants.ts             # Court dimensions (540×840), NET_Y, named positions (SET_TGT, BK_SL, etc.)
│   │   ├── defaults.ts             # Factory defaults: ROTATION_LAYOUTS, DEFENSE_SCHEMAS, buildServePhases(), buildReceivePhases()
│   │   ├── players.ts              # PD array — 6 player definitions (S, OP, MB, OH, RS, L) with colors
│   │   ├── plays.ts                # PLAYS array — all 28 plays with phase data, ph() builder function
│   │   ├── quiz.ts                 # QUIZ array — 15 multiple-choice questions tied to play IDs
│   │   └── rallies.ts              # Rally definitions — multi-play sequences
│   │
│   ├── stores/
│   │   ├── usePlaybookStore.ts     # UI state: tab, category, play ID, phase index, team animation state
│   │   ├── useAnimationStore.ts    # Animation state: progress, playing, speed, trails, trail data
│   │   ├── useEditorStore.ts       # Editor state: position edits, modifications, violations, drag state
│   │   ├── useQuizStore.ts         # Quiz state: question index, selected answer, score, completion
│   │   ├── useTeamStore.ts         # Team state: system, rotation, defense, player names, profiles, rotation defaults (persisted)
│   │   └── useRallyStore.ts        # Rally state: active rally, step index, flattened phases
│   │
│   ├── hooks/
│   │   ├── useAnimationLoop.ts     # requestAnimationFrame loop — increments progress, records trails
│   │   ├── useQuizLoop.ts          # rAF loop for quiz — auto-loops play animation, resets at 100%
│   │   └── useTeamAnimLoop.ts      # rAF loop for team animation — drives wizard walkthrough animations
│   │
│   ├── utils/
│   │   ├── ease.ts                 # Quadratic ease-in-out function
│   │   ├── lerp.ts                 # Interpolates player + ball positions between phase keyframes
│   │   ├── validate.ts             # Serve-receive overlap checker (depth + lateral rules)
│   │   ├── svg.ts                  # Converts pointer events to SVG coordinate space
│   │   ├── adaptPlay.ts           # Adapts system plays to team's base positions
│   │   └── transitions.ts         # Transition animation utilities
│   │
│   └── components/
│       ├── court/
│       │   ├── Court.tsx            # SVG container — renders players, ball, trails, tooltip; handles drag + team animation
│       │   ├── CourtBackground.tsx  # Static court lines, net, zones, labels (React.memo — renders once)
│       │   ├── PlayerToken.tsx      # Player circle with shadow, label, position ID (React.memo on x, y)
│       │   ├── BallToken.tsx        # Ball circle with seam detail (React.memo on x, y)
│       │   ├── GhostTrails.tsx      # SVG polylines showing each player's movement path
│       │   └── PlayerTooltip.tsx    # Hover tooltip — shows player role and phase-specific note
│       │
│       ├── landing/
│       │   ├── LandingClient.tsx    # Landing page client component
│       │   └── CourtDemo.tsx        # Standalone animated court demo for landing page
│       │
│       ├── layout/
│       │   ├── Header.tsx           # Logo + tab navigation (Setup, My Team, Library, Strategies, Quiz)
│       │   ├── Sidebar.tsx          # Play library — category filter pills + scrollable play list
│       │   └── BottomTimeline.tsx   # Context-aware bottom bar: scrubber (main), phase pills (edit), loop bar (quiz)
│       │
│       ├── panels/
│       │   ├── PanelShell.tsx       # Shared panel wrapper with consistent styling
│       │   ├── PlayInfoDrawer.tsx   # Top-right overlay — play name, description, phase list, phase notes
│       │   ├── EditorPanel.tsx      # Editor overlay — phase selector, violation display, player legend
│       │   ├── QuizPanel.tsx        # Quiz overlay — question, options, explanation, score, results screen
│       │   ├── SetupWizardPanel.tsx # 5-step setup wizard with per-rotation animated walkthrough
│       │   ├── TeamDefaultsPanel.tsx # My Team panel — system, defense, profiles, coverage, roster
│       │   └── RallyBuilderPanel.tsx # Rally builder — chain plays into sequences
│       │
│       └── controls/
│           └── PlayControls.tsx     # Centered bar below court — play/pause, reset, speed buttons, trails toggle
│
├── next.config.ts
├── tsconfig.json
└── package.json
```

## State Architecture

Six Zustand stores, each focused on a single concern. Animation loops read/write via `getState()` (imperative) to avoid triggering React re-renders on every frame. Team store uses `persist` middleware with `skipHydration` for SSR compatibility.

| Store | Manages | Updated By |
|---|---|---|
| `usePlaybookStore` | tab, category, play ID, phase index, team animation state | User clicks (sidebar, header, phases), wizard |
| `useAnimationStore` | progress, playing, speed, trails | rAF loop at 60fps, play controls |
| `useEditorStore` | position edits, violations, drag state | Drag events on court, validator |
| `useQuizStore` | question index, answer, score | Quiz panel interactions |
| `useTeamStore` | system, rotation, defense type, rotation defaults, player names, profiles, coverage, team playbook | Setup wizard, My Team panel, court drag |
| `useRallyStore` | active rally, step index, flattened phases | Rally builder panel |

## Data Model

### Rotation Defaults

Each system (5-1, 6-2, 4-2) × rotation (1-6) has a `RotationDefaults` entry containing:
- `serveReceive` — static positions for serve receive formation
- `baseDefense` — static positions generated from `ROTATION_LAYOUTS` + `DEFENSE_SCHEMAS`
- `baseOffense` — static positions for base offense
- `servePhases` — 3-phase animated sequence: Pre-Serve → Ball Crosses Net → Base Defense
- `receivePhases` — 5-phase animated sequence: Serve Receive → Pass Contact → Set Contact → Attack → Ball Over Net

### Phase Generation

- **Serve phases** are generated from legal pre-serve zone positions + defense templates. The server (determined by rotation: Rot1=S, Rot2=L, Rot3=RS, Rot4=OH, Rot5=MB, Rot6=OP) starts at baseline, transitions through serve contact, and team settles into base defense.
- **Receive phases** are cloned from existing 51sr1–51sr6 play data (5 phases each with full position + ball + notes data).

## Layout

```
┌─────────────────────────────────────────────────┐
│  V  VOLTEX      Setup  My Team  Library  Quiz   │  Header
├──────────┬──────────────────────────────────────┤
│          │                    ┌────────────┐    │
│  Play    │                    │ Context    │    │
│  Library │     Court SVG      │ Panel      │    │
│          │                    │ (overlay)  │    │
│  [pills] │                    └────────────┘    │
│  [plays] │                                      │
├──────────┼──────────────────────────────────────┤
│          │   ▶  ⏮  │ 0.5x 1x 1.5x 2x │ TRAILS │  Play Controls
├──────────┴──────────────────────────────────────┤
│  ● Phase 1 ────────●──── Phase 3 ●        48%  │  Timeline (when active)
└─────────────────────────────────────────────────┘
```

## Roadmap

See `Volleyball_mvp_context.md` for the full roadmap. Next milestones:

1. **Polish** — Responsive layout, keyboard shortcuts, visual QA
2. **Auth** — NextAuth.js + Google OAuth, Supabase for persistence
3. **RBAC** — Coach vs Player views, play assignments, view tracking
4. **Animation Upgrade** — Bezier paths for realistic hitter approaches
5. **Billing** — Stripe integration, seat-based subscription tiers
