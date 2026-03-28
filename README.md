Ah, I see what happened! The code blocks *inside* the README (like the bash commands and folder structure) prematurely closed the main code block. 

Here is the entire README properly enclosed so you can copy it in one click:

````markdown
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

```text
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
│   │   ├── defaults.ts              # Factory defaults: ROTATION_LAYOUTS, DEFENSE_SCHEMAS, buildServePhases(), buildReceivePhases()
│   │   ├── players.ts               # PD array — 6 player definitions (S, OP, MB, OH, RS, L) with colors
│   │   ├── plays.ts                 # PLAYS array — all 28 plays with phase data, ph() builder function
│   │   ├── quiz.ts                  # QUIZ array — 15 multiple-choice questions tied to play IDs
│   │   └── rallies.ts               # Rally definitions — multi-play sequences
│   │
│   ├── stores/
│   │   ├── usePlaybookStore.ts      # UI state: tab, category, play ID, phase index, team animation state
│   │   ├── useAnimationStore.ts     # Animation state: progress, playing, speed, trails, trail data
│   │   ├── useEditorStore.ts        # Editor state: position edits, modifications, violations, drag state
│   │   ├── useQuizStore.ts          # Quiz state: question index, selected answer, score, completion
│   │   ├── useTeamStore.ts          # Team state: system, rotation, defense, player names, profiles, rotation defaults (persisted)
│   │   └── useRallyStore.ts         # Rally state: active rally, step index, flattened phases
│   │
│   ├── hooks/
│   │   ├── useAnimationLoop.ts      # requestAnimationFrame loop — increments progress, records trails
│   │   ├── useQuizLoop.ts           # rAF loop for quiz — auto-loops play animation, resets at 100%
│   │   └── useTeamAnimLoop.ts       # rAF loop for team animation — drives wizard walkthrough animations
│   │
│   ├── utils/
│   │   ├── ease.ts                  # Quadratic ease-in-out function
│   │   ├── lerp.ts                  # Interpolates player + ball positions between phase keyframes
│   │   ├── validate.ts              # Serve-receive overlap checker (depth + lateral rules)
│   │   ├── svg.ts                   # Converts pointer events to SVG coordinate space
│   │   ├── adaptPlay.ts             # Adapts system plays to team's base positions
│   │   └── transitions.ts           # Transition animation utilities
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
│       │   ├── TeamDefaultsPanel.tsx# My Team panel — system, defense, profiles, coverage, roster
│       │   └── RallyBuilderPanel.tsx# Rally builder — chain plays into sequences
│       │
│       └── controls/
│           └── PlayControls.tsx     # Centered bar below court — play/pause, reset, speed buttons, trails toggle
│
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Roadmap: What's Next

### Phase 1.5: Technical Debt & Editor Upgrades (Immediate Next Steps)
- [ ] **Draggable Ball Animation:** Update `useEditorStore` and `Court.tsx` to allow users to drag the ball token during edit mode to customize pass/set trajectories.
- [ ] **Token Name Overrides:** Allow coaches to rename specific player tokens within an edited play (e.g., changing "OH1" to "Sarah").

Also want to Add in the ability for the caoaches to make their own quizzes... maybe based on plays, on pahses of plays... on offensive... questions of where does OH go? etc. Very specific... or generic. User ca pick a play and ask, why do we do X here? Etc.

Eventually could be If blockers are here, what do we do.... if blockers are here, where do we hit? etc

- [ ] **Play Versioning:** Allow saving multiple named versions/variations of a single edited play.
- [x] **Fix Legacy Systems:** The `6-2` and `4-2` systems in `defaults.ts` and `plays.ts` need to be fully mapped to the new 7-player ID system to ensure they render correctly without TS errors.
- [ ] **Modularize Validation:** The `validate.ts` logic relies on brittle string matching for phase labels. This needs to be converted to strict enums.

### Phase 2: Polish & UX
- [ ] **Prioritize UI/UX:** Responsive layout testing (1280px+ target, then tablet).
- [ ] Keyboard shortcuts (spacebar = play/pause, arrows = next/prev phase).
- [ ] Transition animations for drawer open/close.
- [ ] Visual QA pass — side-by-side with original HTML to verify all 28 plays render identically.
- [ ] Font & Coloring Consistency: Final sweep to ensure all tooltips, panel headers, and empty states use the new athletic gold/navy theme consistently.

### Phase 3: Authentication, Multi-Tenancy & Audit Logs
- [ ] NextAuth.js with Google OAuth provider.
- [ ] Supabase setup (Postgres + RLS).
- [ ] User table: email, tenant_id, role.
- [ ] API routes for plays CRUD (replace static imports with DB queries).
- [ ] **Multi-Team Support:** Logic to handle Free Tier (1 team limit) vs Paid Tier (Unlimited teams).
- [ ] **Multi-Coach Support & Logs:** Allow multiple coach accounts per team and implement an Audit Log (track who made edits and when).
- [ ] Row Level Security policies for tenant isolation.

### Phase 4: RBAC, Player Analytics & Custom Quizzes
- [ ] **Role-based UI:** Coach sees Edit button, Player sees read-only.
- [ ] "Highlight My Position" — player portal dims others, highlights their path.
- [ ] Assignment system: Coach assigns plays to specific players.
- [ ] **Custom Quiz Builder:** Allow coaches to create their own multiple-choice scenarios.
- [ ] **Engagement Analytics:** Dashboard to see which players logged in, when they logged in, how often they use the app, and their quiz scores over the past week.

### Phase 5: Advanced Animation
- [ ] Bezier control points per player per phase (arced hitter approaches).
- [ ] GSAP or Framer Motion integration for curved paths.
- [ ] Play-by-play mode: auto-pause between phases with narration.

### Phase 6: Billing & Launch
- [ ] Stripe integration + webhook for seat management.
- [ ] Subscription tiers (see pricing below).
- [ ] Onboarding flow for Club Directors.
- [ ] Landing page / marketing site.

---

## Planned SaaS Architecture

### Multi-Tenancy
- Every record (plays, rosters, assignments) scoped to a `tenant_id` (Club or Team).
- Team A can never access Team B's data.
- Free accounts restricted to a single team instance. Paid accounts can manage multiple teams under one Club Director.
- Row Level Security (RLS) enforced at DB level (Supabase/Postgres).

### Role-Based Access Control (RBAC)
| Role | Capabilities |
|---|---|
| Platform Admin | Full access, billing management |
| Club Director | Create/manage teams, billing, user provisioning |
| Coach | Create/edit plays, create custom quizzes, assign to players, view analytics, view audit logs |
| Player | Read-only — view assigned plays, take quizzes, view personal analytics |

### Authentication — Google OAuth
- Offload identity entirely to Google.
- No passwords, no reset flows.
- Frictionless for school/athletic environments already on Google Workspace.
- Backend verifies Google-authenticated email against `Users` table, assigns `tenant_id` + `role`.

---

## Subscription Model (Draft)

| Tier | Target | Price (est.) | Features |
|---|---|---|---|
| Basic (Free) | Individual Coach / Rec | Free | 1 Team, Standard library, No analytics |
| Club Starter | Small clubs (1–3 teams) | $49/mo | Up to 30 players, custom quizzes, analytics |
| Club Pro | Mid-size clubs (4–10 teams) | $149/mo | Up to 150 players, multi-coach audit logs |
| Athletic Department | Schools/universities | $399/mo | Unlimited teams, SSO integration |

Annual billing with a discount. Club Director controls seat allocation.