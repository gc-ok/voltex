import { Phase, Play, Rally, PlayerId, PositionMap, XY } from '@/data/types';

// ═══════════════════════════════════════════════════════════════
// Rally Phase Flattening + Transition Generation
// ═══════════════════════════════════════════════════════════════

const PLAYER_IDS: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];

function midpoint(a: XY, b: XY): XY {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Generate 1 bridging phase between two plays.
 * Takes the last phase of play A and first phase of play B,
 * creates a midpoint transition so animation is smooth.
 */
export function generateTransition(fromPlay: Play, toPlay: Play): Phase[] {
  const lastPhase = fromPlay.phases[fromPlay.phases.length - 1];
  const firstPhase = toPlay.phases[0];

  const pos: PositionMap = {} as PositionMap;
  PLAYER_IDS.forEach(pid => {
    const from = lastPhase.pos[pid];
    const to = firstPhase.pos[pid];
    if (from && to) {
      pos[pid] = midpoint(from, to);
    } else {
      pos[pid] = to || from || { x: 270, y: 500 };
    }
  });

  const ball = midpoint(lastPhase.ball, firstPhase.ball);

  return [{
    label: 'Transition',
    ball,
    pos,
    notes: { S: '', OP: '', MB: '', OH: '', RS: '', L: '' },
  }];
}

/**
 * Flatten a rally into a single Phase[] array.
 * Inserts smooth transition phases between each step.
 */
export function flattenRally(
  rally: Rally,
  resolver: (id: string) => Play,
): { phases: Phase[]; boundaries: number[] } {
  if (rally.steps.length === 0) return { phases: [], boundaries: [] };

  const phases: Phase[] = [];
  const boundaries: number[] = [];

  rally.steps.forEach((step, i) => {
    const play = resolver(step.playId);

    // Insert transition between plays
    if (i > 0) {
      const prevPlay = resolver(rally.steps[i - 1].playId);
      const trans = generateTransition(prevPlay, play);
      phases.push(...trans);
    }

    // Mark boundary at the start of this step's phases
    boundaries.push(phases.length);

    // Add all phases from this step's play
    phases.push(...play.phases);
  });

  return { phases, boundaries };
}
