import { RotationDefaults, System, Rotation, PositionMap, DefenseType, RotationLayout, DefenseSchema, PlayerId, Phase, PhaseNotes, XY } from './types';
import { PLAYS } from './plays';
import { FR_L, FR_M, FR_R, DC_L, DC_M, DC_R, MC_L, SET_TGT, BK_L, B_SET, OVR_XL, xy } from './constants';

// ═══════════════════════════════════════════════════════════════
// Factory Defaults — extracted from existing play data
// ═══════════════════════════════════════════════════════════════

// Extract positions from first phase of a play (serve receive formation)
function posFromPlay(playId: string): PositionMap {
  const play = PLAYS.find(p => p.id === playId);
  if (!play) throw new Error(`Play ${playId} not found`);
  return { ...play.phases[0].pos };
}

// Key for rotation defaults lookup
export function rotKey(system: System, rotation: Rotation): string {
  return `${system}-${rotation}`;
}

// ═══════════════════════════════════════════════════════════════
// Rotation Layouts — who is front row vs back row per rotation
// Verified from actual serve receive play data (51sr1–51sr6)
// ═══════════════════════════════════════════════════════════════

export const ROTATION_LAYOUTS: Record<System, Record<Rotation, RotationLayout>> = {
  '5-1': {
    1: { front: ['OH', 'MB', 'OP'], back: ['RS', 'L', 'S'] },
    2: { front: ['OH', 'MB', 'OP'], back: ['RS', 'S', 'L'] },
    3: { front: ['OP', 'MB', 'OH'], back: ['S', 'L', 'RS'] },
    4: { front: ['S', 'OP', 'MB'], back: ['OH', 'L', 'RS'] },
    5: { front: ['MB', 'S', 'OP'], back: ['OH', 'L', 'RS'] },
    6: { front: ['MB', 'OP', 'S'], back: ['OH', 'L', 'RS'] },
  },
  '6-2': {
    1: { front: ['OH', 'MB', 'OP'], back: ['RS', 'L', 'S'] },
    2: { front: ['OH', 'MB', 'OP'], back: ['RS', 'S', 'L'] },
    3: { front: ['OP', 'MB', 'OH'], back: ['S', 'L', 'RS'] },
    4: { front: ['S', 'OP', 'MB'], back: ['OH', 'L', 'RS'] },
    5: { front: ['MB', 'S', 'OP'], back: ['OH', 'L', 'RS'] },
    6: { front: ['MB', 'OP', 'S'], back: ['OH', 'L', 'RS'] },
  },
  '4-2': {
    1: { front: ['OH', 'MB', 'OP'], back: ['RS', 'L', 'S'] },
    2: { front: ['OH', 'MB', 'OP'], back: ['RS', 'S', 'L'] },
    3: { front: ['OP', 'MB', 'OH'], back: ['S', 'L', 'RS'] },
    4: { front: ['S', 'OP', 'MB'], back: ['OH', 'L', 'RS'] },
    5: { front: ['MB', 'S', 'OP'], back: ['OH', 'L', 'RS'] },
    6: { front: ['MB', 'OP', 'S'], back: ['OH', 'L', 'RS'] },
  },
};

// ═══════════════════════════════════════════════════════════════
// Defense Schemas — position templates by ROLE (not player)
// Front row = blockers at net, back row = diggers
// ═══════════════════════════════════════════════════════════════

export const DEFENSE_SCHEMAS: Record<DefenseType, DefenseSchema> = {
  'perimeter': {
    blockLeft: FR_L, blockMid: FR_M, blockRight: FR_R,
    digLeft: DC_L, digMiddle: DC_M, digRight: DC_R,
  },
  'rotational': {
    blockLeft: FR_L, blockMid: FR_M, blockRight: FR_R,
    digLeft: MC_L, digMiddle: xy(195, 575), digRight: DC_R,
  },
  'man-up': {
    blockLeft: FR_L, blockMid: FR_M, blockRight: FR_R,
    digLeft: DC_L, digMiddle: xy(268, 452), digRight: DC_R,
  },
};

// ═══════════════════════════════════════════════════════════════
// Generate defense positions per rotation
// Maps the right players to front/back row based on rotation
// ═══════════════════════════════════════════════════════════════

export function generateDefensePositions(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType
): PositionMap {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const schema = DEFENSE_SCHEMAS[defenseType];
  return {
    [layout.front[0]]: { ...schema.blockLeft },
    [layout.front[1]]: { ...schema.blockMid },
    [layout.front[2]]: { ...schema.blockRight },
    [layout.back[0]]: { ...schema.digLeft },
    [layout.back[1]]: { ...schema.digMiddle },
    [layout.back[2]]: { ...schema.digRight },
  } as PositionMap;
}

// ═══════════════════════════════════════════════════════════════
// Base Positions — where each player's HOME/defensive ready position is
// After serve contact, players "switch" to these preferred positions.
// Reference: volleyball_positioning_reference.md — Base Position section
//
// Principles:
// - S back row → Z1 right-back (~440, 620), ready to sprint to target
// - S front row → Z2 right-front (~395, 340), near target
// - OH → left antenna Z4 (88, 340) when front row
// - MB → center Z3 (270, 330) when front row
// - OP → right antenna Z2 (452, 340) when front row
// - L → Z6 deep center (270, 680), always back row
// - Back-row non-setter, non-L → left-back Z5 (~105, 600)
// ═══════════════════════════════════════════════════════════════

export function generateBasePositions(system: System, rotation: Rotation): PositionMap {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const isSetterFront = layout.front.includes('S');
  const pos: PositionMap = {} as PositionMap;

  // Front-row players switch to preferred net positions
  if (isSetterFront) {
    // S at right-front (target area), MB center, other hitter at left antenna
    pos['S'] = xy(395, 340);
    pos['MB'] = xy(270, 330);
    const otherHitter = layout.front.find(p => p !== 'S' && p !== 'MB')!;
    pos[otherHitter] = xy(88, 340);
  } else {
    // Standard 3-hitter: OH left, MB center, OP right
    for (const pid of layout.front) {
      if (pid === 'OH') pos['OH'] = xy(88, 340);
      else if (pid === 'MB') pos['MB'] = xy(270, 330);
      else if (pid === 'OP') pos['OP'] = xy(452, 340);
      else pos[pid] = xy(270, 340); // fallback
    }
  }

  // Back-row: S always Z1 right-back, L always Z6 deep center, other to Z5 left-back
  if (!isSetterFront) {
    pos['S'] = xy(440, 620);
  }
  pos['L'] = xy(270, 680);

  // Remaining back-row player(s) → left-back area
  for (const pid of layout.back) {
    if (!pos[pid]) {
      pos[pid] = xy(105, 600);
    }
  }

  return pos;
}

// ═══════════════════════════════════════════════════════════════
// Server per rotation — derived from ROTATION_LAYOUTS (Z1 player serves)
// See volleyball_positioning_reference.md for detailed rationale
// ═══════════════════════════════════════════════════════════════

const SERVERS: Record<Rotation, PlayerId> = {
  1: 'S', 2: 'L', 3: 'RS', 4: 'RS', 5: 'RS', 6: 'RS',
};

// ═══════════════════════════════════════════════════════════════
// Pre-serve positions — volleyball-accurate stacking per rotation
// When OUR team serves, players position for defensive transition.
// Reference: volleyball_positioning_reference.md — Serving Formation sections
//
// Key principles:
// - Server at baseline right (~400, 805)
// - Front-row players near net in legal zone positions
// - Back-row non-servers ready for defense
// - Setter (if back row) cheats toward target for shorter transition
// - Front row will "switch" after contact to preferred positions
// ═══════════════════════════════════════════════════════════════

function preServePositions(
  system: System,
  rotation: Rotation,
): PositionMap {
  const preServeByRotation: Record<Rotation, PositionMap> = {
    // R1: S serves. Front: OH(Z4) MB(Z3) OP(Z2). Back: RS(Z5) L(Z6)
    1: {
      S:  xy(400, 805),
      OP: xy(440, 340),
      MB: xy(270, 330),
      OH: xy(100, 340),
      RS: xy(120, 560),
      L:  xy(270, 560),
    },
    // R2: L serves. Front: OH(Z4) MB(Z3) OP(Z2). Back: RS(Z5) S(Z6)
    2: {
      L:  xy(400, 805),
      OP: xy(440, 340),
      MB: xy(270, 330),
      OH: xy(100, 340),
      RS: xy(120, 560),
      S:  xy(350, 560),
    },
    // R3: RS serves. Front: OP(Z4) MB(Z3) OH(Z2). Back: S(Z5) L(Z6)
    3: {
      RS: xy(400, 805),
      OH: xy(440, 340),
      MB: xy(270, 330),
      OP: xy(100, 340),
      S:  xy(120, 560),
      L:  xy(270, 560),
    },
    // R4: RS serves. Front: S(Z4) OP(Z3) MB(Z2). Back: OH(Z5) L(Z6)
    4: {
      RS: xy(400, 805),
      MB: xy(440, 340),
      OP: xy(270, 330),
      S:  xy(100, 340),
      OH: xy(120, 560),
      L:  xy(270, 560),
    },
    // R5: RS serves. Front: MB(Z4) S(Z3) OP(Z2). Back: OH(Z5) L(Z6)
    5: {
      RS: xy(400, 805),
      OP: xy(440, 340),
      S:  xy(330, 330),
      MB: xy(100, 340),
      OH: xy(120, 560),
      L:  xy(270, 560),
    },
    // R6: RS serves. Front: MB(Z4) OP(Z3) S(Z2). Back: OH(Z5) L(Z6)
    6: {
      RS: xy(400, 805),
      S:  xy(395, 340),
      OP: xy(270, 330),
      MB: xy(100, 340),
      OH: xy(120, 560),
      L:  xy(270, 560),
    },
  };

  return preServeByRotation[rotation];
}

// Empty notes helper
const N0: PhaseNotes = { S: '', OP: '', MB: '', OH: '', RS: '', L: '' };

// Interpolate between two positions at ratio t (0-1)
function lerpXY(a: XY, b: XY, t: number): XY {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Interpolate all positions between two PositionMaps
function lerpPositions(a: PositionMap, b: PositionMap, t: number): PositionMap {
  const result: PositionMap = {} as PositionMap;
  const ids: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];
  for (const pid of ids) {
    if (a[pid] && b[pid]) {
      result[pid] = lerpXY(a[pid], b[pid], t);
    } else {
      result[pid] = a[pid] || b[pid];
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Serve Receive Stacked Positions — per rotation
// Reference: volleyball_positioning_reference.md
//
// Key stacking principles:
// - S hides behind adjacent net player, NEVER takes first ball
// - MB stays at net, never passes
// - OP stays at net (or deep if back row), rarely passes
// - Passers: L (always), OH (pulls back from net), RS (back row)
// - Positions minimize transition distance after contact
// - All positions respect overlap rules for the rotation
// ═══════════════════════════════════════════════════════════════

function serveReceivePositions(system: System, rotation: Rotation): PositionMap {
  // Per-rotation stacked serve receive formations
  // Each respects overlap rules and optimizes for setter shielding + transition
  const srByRotation: Record<Rotation, PositionMap> = {
    // R1: Front: OH(Z4) MB(Z3) OP(Z2). Back: RS(Z5) L(Z6) S(Z1)
    // S back row at Z1 — hides far right-back behind OP(Z2)
    // Passers: OH pulls back from Z4, RS at Z5, L at Z6
    // Stacking: S+OP stack right, OH+RS stack left
    1: {
      S:  xy(470, 700),  // Far right-back, hidden behind OP. Short path to target
      OP: xy(440, 330),  // Z2 right net — shields S, ready for right-side attack
      MB: xy(300, 330),  // Z3 center-right net — ready for quick attack
      OH: xy(130, 480),  // Z4 pulled back to pass left. Left of MB, in front of RS
      RS: xy(130, 600),  // Z5 left-back, passing
      L:  xy(270, 600),  // Z6 center-back, primary passer — largest zone
    },
    // R2: Front: OH(Z4) MB(Z3) OP(Z2). Back: RS(Z5) S(Z6) L(Z1)
    // S back row at Z6 — cheats right behind OP/MB. Must stay right of RS, behind MB
    // Passers: OH pulls back from Z4, L at Z1, RS at Z5
    // Stacking: S cheats right toward target behind MB/OP
    2: {
      S:  xy(400, 560),  // Z6 cheating right, behind OP(Z2), right of RS(Z5)
      OP: xy(440, 330),  // Z2 right net
      MB: xy(300, 330),  // Z3 center net, slight right
      OH: xy(130, 480),  // Z4 pulled back to pass left, left of MB, in front of RS
      RS: xy(130, 620),  // Z5 left-back, passing
      L:  xy(430, 600),  // Z1 right-back, passing
    },
    // R3: Front: OP(Z4) MB(Z3) OH(Z2). Back: S(Z5) L(Z6) RS(Z1)
    // S back row at Z5 — HARDEST rotation, full diagonal sprint to target
    // S hides left behind OP(Z4). After contact: OP switches right, OH switches left
    // Passers: OH pulls back from Z2, L at Z6, RS at Z1
    3: {
      S:  xy(100, 580),  // Z5 left-back, hidden behind OP(Z4). Longest transition!
      OP: xy(110, 330),  // Z4 left net — in front of S, will switch RIGHT after contact
      MB: xy(270, 330),  // Z3 center net — stays center
      OH: xy(400, 480),  // Z2 pulled back right to pass. Right of MB, in front of RS
      L:  xy(270, 620),  // Z6 center-back, primary passer
      RS: xy(430, 600),  // Z1 right-back, passing
    },
    // R4: Front: S(Z4) OP(Z3) MB(Z2). Back: OH(Z5) L(Z6) RS(Z1)
    // S FRONT ROW at Z4 (left net) — will slide right along net to target
    // Easy setter transition. Only 2 hitters: OP and MB
    // Passers: OH at Z5, L at Z6, RS at Z1. "Stack everyone left" (JVA)
    4: {
      S:  xy(100, 330),  // Z4 left net — will slide right to target. Already at net!
      OP: xy(200, 330),  // Z3 center-left net, right of S. Stacked left for transition
      MB: xy(440, 330),  // Z2 right net, right of OP. In front of RS
      OH: xy(100, 580),  // Z5 left-back, passing
      L:  xy(270, 620),  // Z6 center-back, primary passer
      RS: xy(430, 600),  // Z1 right-back, passing
    },
    // R5: Front: MB(Z4) S(Z3) OP(Z2). Back: OH(Z5) L(Z6) RS(Z1)
    // S FRONT ROW at Z3 (center net) — near target, very easy transition
    // Only 2 hitters: MB and OP
    // Passers: OH at Z5, L at Z6, RS at Z1
    5: {
      S:  xy(330, 330),  // Z3 center-right net — already near target!
      OP: xy(440, 330),  // Z2 right net, right of S
      MB: xy(100, 330),  // Z4 left net, left of S. Ready for quick
      OH: xy(130, 580),  // Z5 left-back, passing. Behind MB
      L:  xy(270, 620),  // Z6 center-back, primary passer
      RS: xy(430, 600),  // Z1 right-back, passing
    },
    // R6: Front: MB(Z4) OP(Z3) S(Z2). Back: OH(Z5) L(Z6) RS(Z1)
    // S FRONT ROW at Z2 (right net) — ALREADY AT TARGET! Zero transition
    // Only 2 hitters: MB and OP
    // Passers: OH at Z5, L at Z6, RS at Z1
    6: {
      S:  xy(395, 318),  // Z2 right net — ALREADY AT TARGET! Zero transition
      OP: xy(270, 330),  // Z3 center net, left of S
      MB: xy(100, 330),  // Z4 left net — ready for quick center
      OH: xy(130, 580),  // Z5 left-back, passing. Behind MB
      L:  xy(270, 620),  // Z6 center-back, primary passer
      RS: xy(430, 600),  // Z1 right-back, passing
    },
  };

  return srByRotation[rotation];
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Serve Phases (our team serves)
// 3 phases: Pre-Serve → Ball Crosses Net → Base Defense
// Reference: volleyball_positioning_reference.md
//
// FIX: Final phase uses BASE positions (S at Z1 ~440,620 when back row)
// NOT SET_TGT. Setter only goes to target AFTER a dig/pass, not before.
// ═══════════════════════════════════════════════════════════════

export function buildServePhases(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType
): Phase[] {
  const server = SERVERS[rotation];
  const layout = ROTATION_LAYOUTS[system][rotation];
  const preServe = preServePositions(system, rotation);
  const base = generateBasePositions(system, rotation);
  const isSetterFrontRow = layout.front.includes('S');

  // Phase 2: transitioning — 60% toward base positions
  const transitioning = lerpPositions(preServe, base, 0.6);
  // Server transitions slower off baseline (only 45%)
  if (preServe[server] && base[server]) {
    transitioning[server] = lerpXY(preServe[server], base[server], 0.45);
  }

  // Phase notes
  const preServeNotes: PhaseNotes = {
    S: server === 'S' ? 'Serving from baseline.' : (isSetterFrontRow ? 'At net, ready to set.' : 'Back row — will transition to Z1 base.'),
    OP: layout.front.includes('OP') ? 'At net, blocking position.' : 'Back row.',
    MB: layout.front.includes('MB') ? 'At net, center.' : 'Back row.',
    OH: layout.front.includes('OH') ? 'At net, left side.' : 'Back row.',
    RS: server === 'RS' ? 'Serving from baseline.' : 'Back row.',
    L: server === 'L' ? 'Serving from baseline.' : 'Back row, defensive ready.',
  };

  const transNotes: PhaseNotes = {
    S: isSetterFrontRow ? 'Sliding to target area at net.' : 'Transitioning to Z1 base — ready to sprint to target on dig.',
    OP: layout.front.includes('OP') ? 'Switching to right antenna blocking.' : 'Transitioning to back-row defense.',
    MB: layout.front.includes('MB') ? 'Center net — reading for block.' : 'Back row — defensive base.',
    OH: layout.front.includes('OH') ? 'Switching to left antenna blocking.' : 'Transitioning to back-row defense.',
    RS: `${server === 'RS' ? 'Served. ' : ''}Moving to defensive position.`,
    L: `${server === 'L' ? 'Served. ' : ''}Moving to deep center.`,
  };

  const baseNotes: PhaseNotes = {
    S: isSetterFrontRow ? 'Right-front at net — blocking + ready to set.' : 'Z1 base (right-back) — reads opponent, sprints to target on dig.',
    OP: layout.front.includes('OP') ? 'Right antenna — blocking position.' : 'Back-row defense.',
    MB: layout.front.includes('MB') ? 'Center net — follows setter for block.' : 'Back-row defense.',
    OH: layout.front.includes('OH') ? 'Left antenna — outside blocking.' : 'Back-row defense.',
    RS: 'Defensive base position.',
    L: 'Z6 deep center — read-and-react defense.',
  };

  return [
    {
      label: 'Pre-Serve',
      ball: { x: preServe[server].x, y: preServe[server].y },
      pos: preServe,
      notes: preServeNotes,
    },
    {
      label: 'Ball Crosses Net',
      ball: xy(270, 158),
      pos: transitioning,
      notes: transNotes,
    },
    {
      label: 'Base Defense',
      ball: xy(270, 112),
      pos: base,
      notes: baseNotes,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Receive Phases (opponent serves to us)
// 5 phases: Serve Receive → Pass → Set → Attack → Base
// Reference: volleyball_positioning_reference.md
//
// Phase 1: Stacked serve receive (setter hidden, passers spread)
// Phase 2: Pass contact (L platforms ball, S sprints to target)
// Phase 3: Set contact (S at target, hitters approaching attack positions)
// Phase 4: Attack (OH attacks from left antenna, team in coverage)
// Phase 5: Ball over net → everyone transitions to BASE positions
// ═══════════════════════════════════════════════════════════════

export function buildReceivePhases(system: System, rotation: Rotation): Phase[] {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const isSetterFront = layout.front.includes('S');
  const base = generateBasePositions(system, rotation);

  // Phase 1: Stacked serve receive
  const srPos = serveReceivePositions(system, rotation);

  // Phase 2: Pass contact — L platforms ball, S moving toward target
  // Others begin transitioning toward attack/coverage positions
  const passPos: PositionMap = {} as PositionMap;
  const setterTarget = { ...SET_TGT }; // (395, 318)
  const ids: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];

  // Setter sprints toward target — how far depends on rotation difficulty
  const setterPassProgress: Record<Rotation, number> = {
    1: 0.5,   // Medium — S from right-back
    2: 0.45,  // Medium — S from center-back cheating right
    3: 0.3,   // Hard — S from left-back, long diagonal
    4: 0.7,   // Easy — S already at net, sliding right
    5: 0.8,   // Very easy — S near target
    6: 1.0,   // Zero transition — already there
  };

  for (const pid of ids) {
    if (pid === 'S') {
      // Setter sprinting toward target
      passPos['S'] = lerpXY(srPos['S'], setterTarget, setterPassProgress[rotation]);
    } else if (pid === 'L') {
      // L stays roughly in place — passing the ball
      passPos['L'] = { ...srPos['L'] };
    } else if (pid === 'MB') {
      // MB moves toward center net for quick approach
      passPos['MB'] = lerpXY(srPos['MB'], xy(270, 330), 0.5);
    } else if (pid === 'OH') {
      // OH begins moving toward left antenna for outside attack
      const ohTarget = layout.front.includes('OH') ? xy(120, 360) : xy(105, 560);
      passPos['OH'] = lerpXY(srPos['OH'], ohTarget, 0.3);
    } else if (pid === 'OP') {
      // OP moves toward right side (or left if switching in R3)
      const opTarget = layout.front.includes('OP')
        ? (rotation === 3 ? xy(440, 340) : xy(440, 340)) // OP always wants right antenna
        : xy(430, 580); // back-row OP stays deep right
      passPos['OP'] = lerpXY(srPos['OP'], opTarget, 0.3);
    } else {
      // RS and others — begin transitioning toward coverage
      passPos[pid] = lerpXY(srPos[pid], base[pid], 0.2);
    }
  }

  // Phase 3: Set contact — S at target, hitters in approach positions
  const setPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    if (pid === 'S') {
      setPos['S'] = { ...setterTarget };
    } else if (pid === 'OH') {
      // OH approaching for outside attack (left antenna, pulled back for approach)
      setPos['OH'] = layout.front.includes('OH') ? xy(100, 380) : xy(105, 570);
    } else if (pid === 'MB') {
      // MB at center net for quick attack
      setPos['MB'] = layout.front.includes('MB') ? xy(250, 330) : xy(270, 550);
    } else if (pid === 'OP') {
      // OP at right antenna for attack (or back-row position)
      setPos['OP'] = layout.front.includes('OP') ? xy(440, 340) : xy(420, 560);
    } else if (pid === 'L') {
      // L moving to coverage behind hitters
      setPos['L'] = xy(270, 620);
    } else if (pid === 'RS') {
      // RS in coverage/back-row position
      setPos['RS'] = layout.front.includes('RS') ? xy(440, 340) : xy(380, 580);
    }
  }

  // Phase 4: Attack — OH attacks from left antenna (default)
  // In front-row setter rotations, OP hits from wherever they are
  const atkPos: PositionMap = {} as PositionMap;
  const attackerIsOH = layout.front.includes('OH');
  for (const pid of ids) {
    if (pid === 'S') {
      atkPos['S'] = { ...setterTarget }; // stays at target during attack
    } else if (pid === 'OH' && attackerIsOH) {
      atkPos['OH'] = xy(88, 340); // left antenna — attacking!
    } else if (pid === 'MB') {
      // MB at center net — could also be attacking quick
      atkPos['MB'] = layout.front.includes('MB') ? xy(270, 330) : xy(270, 560);
    } else if (pid === 'OP') {
      atkPos['OP'] = layout.front.includes('OP') ? xy(452, 340) : xy(420, 560);
    } else if (pid === 'L') {
      // L in coverage position behind attacker
      atkPos['L'] = xy(200, 500);
    } else if (pid === 'OH' && !attackerIsOH) {
      // OH back row — coverage
      atkPos['OH'] = xy(130, 560);
    } else if (pid === 'RS') {
      atkPos['RS'] = layout.front.includes('RS') ? xy(440, 340) : xy(350, 560);
    }
  }

  // Phase 5: Base — ball over net, everyone at home positions
  // (base already computed above)

  // Phase notes
  const srNotes: PhaseNotes = {
    S: isSetterFront
      ? 'At net — ready to set. No transition needed.'
      : `Back row — hidden behind teammates. Will sprint to target after pass.${rotation === 3 ? ' HARDEST rotation — full diagonal.' : ''}`,
    OP: layout.front.includes('OP') ? 'At net — ready for right-side attack.' : 'Back row — staying out of passing lanes.',
    MB: 'At net — never passes. Ready for quick attack.',
    OH: layout.front.includes('OH') ? 'Pulled back from net to pass. Will transition to left antenna.' : 'Back row — passing.',
    RS: layout.back.includes('RS') ? 'Back row — passing.' : 'At net.',
    L: 'Primary passer — covers largest zone. Deep center.',
  };

  const passNotes: PhaseNotes = {
    S: isSetterFront
      ? 'Moving to target to set.'
      : `Sprinting to target (${rotation === 3 ? 'long diagonal — team gives S time' : 'moving forward-right'}).`,
    OP: layout.front.includes('OP') ? 'Approaching for right-side attack.' : 'Back-row positioning.',
    MB: 'Approaching center net for quick attack option.',
    OH: layout.front.includes('OH') ? 'Moving to left antenna for outside attack.' : 'Back-row coverage.',
    RS: 'Transitioning to coverage position.',
    L: 'Passed the ball — moving to coverage.',
  };

  const setNotes: PhaseNotes = {
    S: 'At target — setting the ball to hitter.',
    OP: layout.front.includes('OP') ? 'Right antenna — ready to attack if set comes.' : 'Back-row attack option.',
    MB: layout.front.includes('MB') ? 'Center net — quick attack option.' : 'Back-row coverage.',
    OH: layout.front.includes('OH') ? 'Left antenna — primary outside attack option.' : 'Back-row pipe option.',
    RS: 'In coverage position.',
    L: 'Coverage behind hitters — ready for blocked ball.',
  };

  const atkNotes: PhaseNotes = {
    S: 'At target — watching attack, ready for next play.',
    OP: layout.front.includes('OP') ? 'Right side — secondary attack option or coverage.' : 'Back-row coverage.',
    MB: layout.front.includes('MB') ? 'Center — quick or coverage.' : 'Back-row coverage.',
    OH: attackerIsOH ? 'ATTACKING from left antenna!' : 'Back-row — pipe attack or coverage.',
    RS: 'Coverage — ready for blocked ball.',
    L: 'Coverage behind attacker — reading the play.',
  };

  const baseNotes: PhaseNotes = {
    S: isSetterFront ? 'Right-front base — blocking + ready to set.' : 'Z1 base (right-back) — home position, ready for next rally.',
    OP: layout.front.includes('OP') ? 'Right antenna base — blocking.' : 'Back-row base.',
    MB: layout.front.includes('MB') ? 'Center net base.' : 'Back-row base.',
    OH: layout.front.includes('OH') ? 'Left antenna base — blocking.' : 'Back-row base.',
    RS: 'Base position.',
    L: 'Z6 deep center — home base.',
  };

  // Ball positions through the sequence
  const ballSR = xy(270, 100);          // Opponent baseline
  const ballPass = xy(270, 600);        // Ball at passer contact
  const ballSet = { ...B_SET };         // Ball at setter hands (395, 318)
  const ballAtk = { ...BK_L };          // Ball at left antenna attack (82, 288)
  const ballOver = { ...OVR_XL };       // Ball crosses to opponent side (448, 98)

  return [
    { label: 'Serve Receive', ball: ballSR, pos: srPos, notes: srNotes },
    { label: 'Pass', ball: ballPass, pos: passPos, notes: passNotes },
    { label: 'Set', ball: ballSet, pos: setPos, notes: setNotes },
    { label: 'Attack', ball: ballAtk, pos: atkPos, notes: atkNotes },
    { label: 'Base', ball: ballOver, pos: base, notes: baseNotes },
  ];
}

// ═══════════════════════════════════════════════════════════════
// Build factory defaults for each system
// ═══════════════════════════════════════════════════════════════

function build51Defaults(): RotationDefaults[] {
  const srMap: Record<number, string> = {
    1: '51sr1', 2: '51sr2', 3: '51sr3',
    4: '51sr4', 5: '51sr5', 6: '51sr6',
  };

  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    const srId = srMap[rot];
    const base = generateBasePositions('5-1', rot);
    return {
      system: '5-1' as System,
      rotation: rot,
      serveReceive: posFromPlay(srId),
      baseDefense: generateDefensePositions('5-1', rot, 'perimeter'),
      baseOffense: base,
      servePhases: buildServePhases('5-1', rot, 'perimeter'),
      receivePhases: buildReceivePhases('5-1', rot),
    };
  });
}

function build62Defaults(): RotationDefaults[] {
  const srMap: Record<number, string | null> = {
    1: '62sr1', 2: '62sr2', 3: null, 4: '62sr4', 5: null, 6: null,
  };

  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    const srId = srMap[rot];
    const sr = srId ? posFromPlay(srId) : posFromPlay('51sr' + rot);
    const base = generateBasePositions('6-2', rot);
    return {
      system: '6-2' as System,
      rotation: rot,
      serveReceive: sr,
      baseDefense: generateDefensePositions('6-2', rot, 'perimeter'),
      baseOffense: base,
      servePhases: buildServePhases('6-2', rot, 'perimeter'),
      receivePhases: buildReceivePhases('6-2', rot),
    };
  });
}

function build42Defaults(): RotationDefaults[] {
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    const sr = posFromPlay('51sr' + rot);
    const base = generateBasePositions('4-2', rot);
    return {
      system: '4-2' as System,
      rotation: rot,
      serveReceive: sr,
      baseDefense: generateDefensePositions('4-2', rot, 'perimeter'),
      baseOffense: base,
      servePhases: buildServePhases('4-2', rot, 'perimeter'),
      receivePhases: buildReceivePhases('4-2', rot),
    };
  });
}

// All factory defaults
export const FACTORY_DEFAULTS: Record<string, RotationDefaults> = {};

// Initialize
const all51 = build51Defaults();
const all62 = build62Defaults();
const all42 = build42Defaults();

[...all51, ...all62, ...all42].forEach(rd => {
  FACTORY_DEFAULTS[rotKey(rd.system, rd.rotation)] = rd;
});
