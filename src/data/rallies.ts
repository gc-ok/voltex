import { Rally } from './types';

// ═══════════════════════════════════════════════════════════════
// Pre-built Rally Templates
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_RALLIES: Rally[] = [
  {
    id: 'rally_sr_quick',
    name: 'Serve Receive → Quick Attack',
    desc: 'Rotation 1 serve receive into a middle quick set.',
    steps: [
      { playId: '51sr1' },
      { playId: 'off_1' },
    ],
  },
  {
    id: 'rally_serve_def_trans',
    name: 'Our Serve → Defense → Transition',
    desc: 'Serve, transition to perimeter defense, then run a hut set.',
    steps: [
      { playId: '51sv1' },
      { playId: 'def_peri_oh' },
      { playId: 'off_hut' },
    ],
  },
  {
    id: 'rally_full',
    name: 'Full Rally: SR → Attack → Defense → Counter',
    desc: 'Complete rally flow from serve receive through counter-attack.',
    steps: [
      { playId: '51sr1' },
      { playId: 'off_1' },
      { playId: 'def_peri_oh' },
      { playId: 'off_pipe' },
    ],
  },
];
