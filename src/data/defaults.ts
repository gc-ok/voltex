// src/data/defaults.ts
import {
  RotationDefaults, System, Rotation, PositionMap, DefenseType,
  DefenseSchema, PlayerId, Phase, PhaseNotes, XY, ComplexityLevel, ReceiveTransition
} from './types';

// ─── Inlined constants ────────────────────────────────────────────────────────
const xy = (x: number, y: number): XY => ({ x, y });

const FR_L    = xy( 88, 328);
const FR_M    = xy(270, 325);
const FR_R    = xy(452, 328);
const DC_L    = xy( 88, 685);
const DC_M    = xy(270, 745);
const DC_R    = xy(452, 685);
const MC_L    = xy(105, 660);
const SET_TGT = xy(395, 318);

export function rotKey(system: System, rotation: Rotation): string {
  return `${system}-${rotation}`;
}

// UNIFIED 7-PLAYER LINEUP SYSTEM
// This single matrix drives 5-1, 6-2, and 4-2.
// Roles dynamically swap based on System.
export const BASE_LINEUP: Record<Rotation, { p1: PlayerId, p2: PlayerId, p3: PlayerId, p4: PlayerId, p5: PlayerId, p6: PlayerId }> = {
  1: { p1: 'S',   p2: 'OH1', p3: 'MB1', p4: 'OP',  p5: 'OH2', p6: 'L' },
  2: { p1: 'OH1', p2: 'MB1', p3: 'OP',  p4: 'OH2', p5: 'L',   p6: 'S' },
  3: { p1: 'L',   p2: 'OP',  p3: 'OH2', p4: 'MB2', p5: 'S',   p6: 'OH1' },
  4: { p1: 'OP',  p2: 'OH2', p3: 'MB2', p4: 'S',   p5: 'OH1', p6: 'L' },
  5: { p1: 'OH2', p2: 'MB2', p3: 'S',   p4: 'OH1', p5: 'L',   p6: 'OP' },
  6: { p1: 'L',   p2: 'S',   p3: 'OH1', p4: 'MB1', p5: 'OP',  p6: 'OH2' },
};

export const DEFENSE_SCHEMAS: Record<DefenseType, DefenseSchema> = {
  'perimeter': {
    blockLeft: FR_L, blockMid: FR_M, blockRight: FR_R,
    digLeft:   DC_L, digMiddle: DC_M, digRight:  DC_R,
  },
  'rotational': {
    blockLeft: FR_L, blockMid: FR_M,         blockRight: FR_R,
    digLeft:   MC_L, digMiddle: xy(195, 575), digRight:   DC_R,
  },
  'man-up': {
    blockLeft: FR_L, blockMid: FR_M,         blockRight: FR_R,
    digLeft:   DC_L, digMiddle: xy(268, 452), digRight:   DC_R,
  },
};

// Determines who is setting based on system and rotation
function getActiveSetter(system: System, rotation: Rotation): PlayerId {
  if (system === '5-1') return 'S';
  if (system === '6-2') {
    // S sets from back row (Rot 1,2,3). OP sets from back row (Rot 4,5,6).
    return [1, 2, 3].includes(rotation) ? 'S' : 'OP';
  }
  if (system === '4-2') {
    // OP sets from front row (Rot 1,2,3). S sets from front row (Rot 4,5,6).
    return [1, 2, 3].includes(rotation) ? 'OP' : 'S';
  }
  return 'S';
}

const N0: PhaseNotes = { S: '', OP: '', MB1: '', MB2: '', OH1: '', OH2: '', L: '' };

export function generateDefensePositions(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard',
): PositionMap {
  const schema = DEFENSE_SCHEMAS[defenseType];
  const pos: PositionMap = {};
  const lineup = BASE_LINEUP[rotation];
  
  // Universal Base Defense Switching
  const frontRow = [lineup.p2, lineup.p3, lineup.p4];
  for (const p of frontRow) {
      if (p.includes('OH')) pos[p] = { ...schema.blockLeft };
      if (p.includes('MB')) pos[p] = { ...schema.blockMid };
      if (p === 'OP' || p === 'S') pos[p] = { ...schema.blockRight };
  }

  const backRow = [lineup.p1, lineup.p5, lineup.p6];
  for (const p of backRow) {
      if (p.includes('OH')) pos[p] = { ...schema.digLeft };
      if (p === 'L' || p.includes('MB')) pos[p] = { ...schema.digMiddle }; 
      if (p === 'OP' || p === 'S') pos[p] = { ...schema.digRight };
  }
  return pos;
}

export function generateBasePositions(system: System, rotation: Rotation): PositionMap {
  return generateDefensePositions(system, rotation, 'perimeter', 'standard');
}

// ──────────────────────────────────────────────────────────────
// Pre-Serve Hardcoded Coordinates (All Systems)
// ──────────────────────────────────────────────────────────────
function preServePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const pos: PositionMap = {};
  
  if (system === '5-1' || system === '6-2') {
    // 5-1 and 6-2 share identical pre-serve stack zones. The active setter changes, but their physical start positions relative to rotation remain the same.
    switch(rotation) {
      case 1: return { 'S': xy(400, 805), 'OH1': xy(340, 328), 'MB1': xy(270, 325), 'OP': xy(200, 328), 'OH2': xy(88, 685), 'L': xy(270, 745) };
      case 2: return { 'OH1': xy(400, 805), 'MB1': xy(340, 328), 'OP': xy(270, 325), 'OH2': xy(88, 328), 'L': xy(88, 685), 'S': xy(452, 685) };
      case 3: return { 'L': xy(400, 805), 'OP': xy(452, 328), 'OH2': xy(270, 325), 'MB2': xy(200, 328), 'S': xy(452, 685), 'OH1': xy(88, 685) };
      case 4: return { 'OP': xy(400, 805), 'OH2': xy(340, 328), 'MB2': xy(270, 325), 'S': xy(200, 328), 'OH1': xy(88, 685), 'L': xy(270, 745) };
      case 5: return { 'OH2': xy(400, 805), 'MB2': xy(340, 328), 'S': xy(270, 325), 'OH1': xy(88, 328), 'L': xy(88, 685), 'OP': xy(452, 685) };
      case 6: return { 'L': xy(400, 805), 'S': xy(452, 328), 'OH1': xy(270, 325), 'MB1': xy(200, 328), 'OP': xy(452, 685), 'OH2': xy(88, 685) };
    }
  }
  
  if (system === '4-2') {
    // 4-2 pre-serve: Setters always pushed to target when front row.
    switch(rotation) {
      case 1: return { 'S': xy(400, 805), 'OH1': xy(452, 328), 'MB1': xy(270, 325), 'OP': xy(200, 328), 'OH2': xy(88, 685), 'L': xy(270, 745) };
      case 2: return { 'OH1': xy(400, 805), 'MB1': xy(452, 328), 'OP': xy(270, 325), 'OH2': xy(88, 328), 'L': xy(88, 685), 'S': xy(452, 685) };
      case 3: return { 'L': xy(400, 805), 'OP': xy(452, 328), 'OH2': xy(270, 325), 'MB2': xy(88, 328), 'S': xy(452, 685), 'OH1': xy(88, 685) };
      case 4: return { 'OP': xy(400, 805), 'OH2': xy(452, 328), 'MB2': xy(270, 325), 'S': xy(200, 328), 'OH1': xy(88, 685), 'L': xy(270, 745) };
      case 5: return { 'OH2': xy(400, 805), 'MB2': xy(452, 328), 'S': xy(270, 325), 'OH1': xy(88, 328), 'L': xy(88, 685), 'OP': xy(452, 685) };
      case 6: return { 'L': xy(400, 805), 'S': xy(452, 328), 'OH1': xy(270, 325), 'MB1': xy(88, 328), 'OP': xy(452, 685), 'OH2': xy(88, 685) };
    }
  }
  return pos;
}

// ──────────────────────────────────────────────────────────────
// Serve Receive Hardcoded Coordinates (All Systems & Complexities)
// ──────────────────────────────────────────────────────────────
export function serveReceivePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  
  // ══════════════════════════════════════════════════════════════
  // 5-1 SYSTEM (and 6-2 Base Footprints)
  // ══════════════════════════════════════════════════════════════
  if (system === '5-1' || system === '6-2') {
    if (complexity === 'basic') {
      // Basic W-Formation (5 passers)
      switch(rotation) {
        case 1: return { 'S': xy(400, 560), 'OH1': xy(400, 480), 'MB1': xy(270, 330), 'OP': xy(88, 330), 'OH2': xy(140, 580), 'L': xy(270, 580) };
        case 2: return { 'S': xy(270, 400), 'OH2': xy(140, 580), 'OP': xy(270, 330), 'MB1': xy(452, 330), 'L': xy(270, 620), 'OH1': xy(400, 580) };
        case 3: return { 'S': xy(140, 400), 'MB2': xy(140, 330), 'OH2': xy(270, 480), 'OP': xy(452, 330), 'OH1': xy(400, 580), 'L': xy(270, 620) };
        case 4: return { 'S': xy(140, 330), 'MB2': xy(270, 330), 'OH2': xy(400, 580), 'OH1': xy(140, 580), 'L': xy(270, 480), 'OP': xy(400, 620) };
        case 5: return { 'S': xy(270, 330), 'OH1': xy(140, 580), 'MB2': xy(452, 330), 'L': xy(270, 480), 'OP': xy(270, 620), 'OH2': xy(400, 580) };
        case 6: return { 'S': xy(400, 330), 'MB1': xy(140, 330), 'OH1': xy(270, 580), 'OP': xy(140, 620), 'OH2': xy(140, 580), 'L': xy(400, 480) };
      }
    }
    
    if (complexity === 'standard') {
      // STANDARD 3-MAN RECEIVE (HS Level)
      // Clean lines. Passers stay on their natural attacking sides to avoid cross-court traffic.
      // L, OH1, and OH2 take the primary passing seams.
      switch(rotation) {
        // Rot 1: S(Z1) pushes up behind OH1(Z2). OP(Z4) and MB1(Z3) stack left/mid net.
        case 1: return { 'S': xy(380, 550), 'OH1': xy(380, 460), 'MB1': xy(270, 330), 'OP': xy(100, 330), 'OH2': xy(140, 550), 'L': xy(270, 550) };
        // Rot 2: S(Z6) pushes mid. OH2(Z4) drops left. OH1(Z1) passes right. 
        case 2: return { 'OH1': xy(380, 550), 'MB1': xy(420, 330), 'OP': xy(270, 330), 'OH2': xy(140, 460), 'L': xy(250, 550), 'S': xy(270, 420) };
        // Rot 3: S(Z5) pushes left. OH2(Z3) drops mid-left. L(Z1) passes right.
        case 3: return { 'L': xy(420, 550), 'OP': xy(420, 330), 'OH2': xy(250, 460), 'MB2': xy(140, 330), 'S': xy(140, 420), 'OH1': xy(350, 550) };
        // Rot 4: S(Z4) front-left. OH2(Z2) drops right. OP(Z1) hides deep right.
        case 4: return { 'OP': xy(420, 600), 'OH2': xy(380, 460), 'MB2': xy(270, 330), 'S': xy(140, 330), 'OH1': xy(140, 550), 'L': xy(270, 550) };
        // Rot 5: S(Z3) front-mid. OH1(Z4) drops left. OP(Z6) hides deep mid-right.
        case 5: return { 'OH2': xy(420, 550), 'MB2': xy(420, 330), 'S': xy(270, 330), 'OH1': xy(140, 460), 'L': xy(250, 550), 'OP': xy(350, 600) };
        // Rot 6: S(Z2) front-right. OH1(Z3) drops mid. OP(Z5) hides deep left.
        case 6: return { 'L': xy(400, 550), 'S': xy(420, 330), 'OH1': xy(270, 460), 'MB1': xy(140, 330), 'OP': xy(140, 600), 'OH2': xy(220, 550) };
      }
    }

    if (complexity === 'advanced') {
      // 2-Man or Tight 3-Man Receive (Pushed up Libero/OH for fast offense)
      switch(rotation) {
        case 1: return { 'S': xy(420, 560), 'OH1': xy(420, 460), 'MB1': xy(270, 320), 'OP': xy(88, 320), 'OH2': xy(160, 520), 'L': xy(320, 520) };
        case 2: return { 'S': xy(270, 380), 'OH2': xy(160, 520), 'OP': xy(270, 320), 'MB1': xy(452, 320), 'L': xy(270, 520), 'OH1': xy(420, 460) };
        case 3: return { 'S': xy(120, 380), 'MB2': xy(140, 320), 'OH2': xy(270, 460), 'OP': xy(452, 320), 'OH1': xy(420, 520), 'L': xy(320, 560) };
        case 4: return { 'S': xy(120, 320), 'MB2': xy(270, 320), 'OH2': xy(420, 520), 'OH1': xy(160, 520), 'L': xy(270, 460), 'OP': xy(420, 600) };
        case 5: return { 'S': xy(270, 320), 'OH1': xy(160, 520), 'MB2': xy(452, 320), 'L': xy(270, 460), 'OP': xy(270, 600), 'OH2': xy(420, 520) };
        case 6: return { 'S': xy(420, 320), 'MB1': xy(140, 320), 'OH1': xy(270, 460), 'OP': xy(160, 600), 'OH2': xy(160, 520), 'L': xy(420, 460) };
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // 4-2 SYSTEM
  // ══════════════════════════════════════════════════════════════
  if (system === '4-2') {
    if (complexity === 'basic') {
      // 4-2 W-Formation (Setter is ALWAYS front row pushed to target)
      switch(rotation) {
        case 1: return { 'OP': xy(395, 318), 'OH1': xy(400, 580), 'MB1': xy(270, 330), 'S': xy(140, 620), 'OH2': xy(140, 580), 'L': xy(270, 580) };
        case 2: return { 'OP': xy(395, 318), 'OH1': xy(400, 580), 'MB1': xy(452, 330), 'S': xy(270, 620), 'OH2': xy(140, 580), 'L': xy(270, 620) };
        case 3: return { 'OP': xy(395, 318), 'OH1': xy(400, 580), 'MB2': xy(140, 330), 'S': xy(140, 620), 'OH2': xy(270, 580), 'L': xy(270, 620) };
        case 4: return { 'S': xy(395, 318), 'OH2': xy(400, 580), 'MB2': xy(270, 330), 'OP': xy(140, 620), 'OH1': xy(140, 580), 'L': xy(270, 580) };
        case 5: return { 'S': xy(395, 318), 'OH2': xy(400, 580), 'MB2': xy(452, 330), 'OP': xy(270, 620), 'OH1': xy(140, 580), 'L': xy(270, 620) };
        case 6: return { 'S': xy(395, 318), 'OH2': xy(400, 580), 'MB1': xy(140, 330), 'OP': xy(140, 620), 'OH1': xy(270, 580), 'L': xy(270, 620) };
      }
    }
    
    if (complexity === 'standard') {
      // 4-2 3-Man Receive
      switch(rotation) {
        case 1: return { 'OP': xy(395, 318), 'OH1': xy(380, 460), 'MB1': xy(270, 330), 'S': xy(100, 330), 'OH2': xy(140, 550), 'L': xy(270, 550) };
        case 2: return { 'OP': xy(395, 318), 'OH1': xy(380, 550), 'MB1': xy(420, 330), 'S': xy(270, 330), 'OH2': xy(140, 460), 'L': xy(250, 550) };
        case 3: return { 'OP': xy(395, 318), 'OH1': xy(350, 550), 'MB2': xy(140, 330), 'S': xy(140, 330), 'OH2': xy(250, 460), 'L': xy(420, 550) };
        case 4: return { 'S': xy(395, 318), 'OH2': xy(380, 460), 'MB2': xy(270, 330), 'OP': xy(100, 330), 'OH1': xy(140, 550), 'L': xy(270, 550) };
        case 5: return { 'S': xy(395, 318), 'OH2': xy(380, 550), 'MB2': xy(420, 330), 'OP': xy(270, 330), 'OH1': xy(140, 460), 'L': xy(250, 550) };
        case 6: return { 'S': xy(395, 318), 'OH2': xy(350, 550), 'MB1': xy(140, 330), 'OP': xy(140, 330), 'OH1': xy(250, 460), 'L': xy(420, 550) };
      }
    }

    if (complexity === 'advanced') {
      // 4-2 Tight 3-Man
      switch(rotation) {
        case 1: return { 'OP': xy(395, 318), 'OH1': xy(420, 460), 'MB1': xy(270, 320), 'S': xy(88, 320), 'OH2': xy(160, 520), 'L': xy(320, 520) };
        case 2: return { 'OP': xy(395, 318), 'OH1': xy(420, 460), 'MB1': xy(452, 320), 'S': xy(270, 320), 'OH2': xy(160, 520), 'L': xy(270, 520) };
        case 3: return { 'OP': xy(395, 318), 'OH1': xy(420, 520), 'MB2': xy(140, 320), 'S': xy(140, 320), 'OH2': xy(270, 460), 'L': xy(320, 560) };
        case 4: return { 'S': xy(395, 318), 'OH2': xy(420, 460), 'MB2': xy(270, 320), 'OP': xy(88, 320), 'OH1': xy(160, 520), 'L': xy(320, 520) };
        case 5: return { 'S': xy(395, 318), 'OH2': xy(420, 460), 'MB2': xy(452, 320), 'OP': xy(270, 320), 'OH1': xy(160, 520), 'L': xy(270, 520) };
        case 6: return { 'S': xy(395, 318), 'OH2': xy(420, 520), 'MB1': xy(140, 320), 'OP': xy(140, 320), 'OH1': xy(270, 460), 'L': xy(320, 560) };
      }
    }
  }

  // Fallback map if none match
  return {};
}

function passPositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const sr  = serveReceivePositions(system, rotation, complexity);
  const sid = getActiveSetter(system, rotation);

  const mid: Record<Rotation, XY> = {
    1: xy(407, 341), 2: xy(332, 341), 3: xy(257, 341),
    4: xy(257, 324), 5: xy(332, 324), 6: xy(407, 324),
  };

  return { ...sr, [sid]: mid[rotation] };
}

// ──────────────────────────────────────────────────────────────
// Transition Handler (Early vs Late Switch)
// ──────────────────────────────────────────────────────────────
function setPositions(system: System, rotation: Rotation, complexity: ComplexityLevel, transition: ReceiveTransition): PositionMap {
  const pass = passPositions(system, rotation, complexity);
  const sid  = getActiveSetter(system, rotation);
  const pos  = { ...pass, [sid]: { ...SET_TGT } };
  
  const lineup = BASE_LINEUP[rotation];
  const frontRow = [lineup.p2, lineup.p3, lineup.p4]; // Right, Mid, Left

  if (transition === 'switch-early') {
    // Players run directly to their BASE offensive zones to hit
    for (const p of frontRow) {
      if (p !== sid && pos[p]) {
        if (p.includes('OH')) pos[p] = xy(88, 380);  // Base Left
        if (p.includes('MB')) pos[p] = xy(270, 380); // Base Mid
        if (p === 'OP' || p === 'S') pos[p] = xy(452, 380); // Base Right
      }
    }
  } else {
    // switch-late: Players attack straight forward from their current ROTATIONAL slots
    if (lineup.p4 !== sid && pos[lineup.p4]) pos[lineup.p4] = xy(88, 380);  // Z4 hits Left
    if (lineup.p3 !== sid && pos[lineup.p3]) pos[lineup.p3] = xy(270, 380); // Z3 hits Mid
    if (lineup.p2 !== sid && pos[lineup.p2]) pos[lineup.p2] = xy(452, 380); // Z2 hits Right
  }
  return pos;
}

export function buildServePhases(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard',
): Phase[] {
  const preServe = preServePositions(system, rotation, complexity);
  const base     = generateDefensePositions(system, rotation, defenseType, complexity);
  const lineup   = BASE_LINEUP[rotation];
  
  const serverId = lineup.p1 as PlayerId;
  const sid      = getActiveSetter(system, rotation);
  const isFront  = lineup.p2 === sid || lineup.p3 === sid || lineup.p4 === sid;

  const preNotes: PhaseNotes = { S: '', OP: '', MB1: '', MB2: '', OH1: '', OH2: '', L: '' };
  preNotes[serverId] = 'Serving.';

  const baseNotes: PhaseNotes = {
    S:  sid === 'S' && isFront ? 'Right-front blocking.' : (sid === 'S' ? 'Z1 base (right-back) ready to defend.' : 'Base defense right.'),
    OP: sid === 'OP' && isFront ? 'Right-front blocking.' : (sid === 'OP' ? 'Z1 base (right-back) ready to defend.' : 'Base defense right.'),
    MB1: 'Base position.',
    MB2: 'Base position.',
    OH1: 'Base position.',
    OH2: 'Base position.',
    L:  'Deep center base.',
  };
  
  const serverPos = preServe[serverId];
  return [
    { label: 'Pre-Serve',    ball: { x: serverPos?.x ?? 400, y: serverPos?.y ?? 805 }, pos: preServe, notes: preNotes  },
    { label: 'Base Defense', ball: xy(270, 112),                                       pos: base,     notes: baseNotes },
  ];
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Receive Phases (5 phases)
// ═══════════════════════════════════════════════════════════════
export function buildReceivePhases(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard',
  transition: ReceiveTransition = 'switch-late',
): Phase[] {
  const base    = generateDefensePositions(system, rotation, defenseType, complexity);
  const srPos   = serveReceivePositions(system, rotation, complexity);
  const passPos = passPositions(system, rotation, complexity);
  const setPos  = setPositions(system, rotation, complexity, transition);
  const sid     = getActiveSetter(system, rotation);

  const atkPos: PositionMap = { ...setPos };

  const passNotes: PhaseNotes = { ...N0, [sid]: 'Releasing to target.', L: 'Passing ball to target.' };
  const setNotes:  PhaseNotes = { S: sid === 'S' ? 'Setting the offense.' : 'Coverage.', OP: sid === 'OP' ? 'Setting the offense.' : 'Ready to attack.', MB1: 'Ready to attack.', MB2: 'Ready to attack.', OH1: 'Ready to attack.', OH2: 'Coverage.', L: 'Coverage.' };
  const atkNotes:  PhaseNotes = { S: 'Coverage.', OP: 'Attacking or Coverage.', MB1: 'Attacking or Coverage.', MB2: 'Attacking or Coverage.', OH1: 'Attacking.', OH2: 'Coverage.', L: 'Coverage.' };

  return [
    { label: 'Serve Receive',  ball: xy(270, 80),    pos: srPos,   notes: N0        }, // Opponent serves
    { label: 'The Pass',       ball: xy(270, 500),   pos: passPos, notes: passNotes }, // Ball at passers
    { label: 'The Set',        ball: { ...SET_TGT }, pos: setPos,  notes: setNotes  }, // Ball at Setter
    { label: 'OFFENSIVE PLAY', ball: xy(88, 340),    pos: atkPos,  notes: atkNotes  }, // Ball at left pin attacker
    { label: 'Transition',     ball: xy(270, 100),   pos: atkPos,  notes: N0        }, // Ball crosses net
    { label: 'Base Defense',   ball: xy(270, 112),   pos: base,    notes: N0        }, // Ready for defense
  ];
}

// ──────────────────────────────────────────────────────────────
// Dynamic Team Defaults Generator 
// ──────────────────────────────────────────────────────────────
export function generateTeamDefaults(
  system: System, 
  complexity: ComplexityLevel = 'standard', 
  transition: ReceiveTransition = 'switch-late',
  defenseType: DefenseType = 'perimeter'
): Record<string, RotationDefaults> {
  const generated: Record<string, RotationDefaults> = {};
  
  ([1, 2, 3, 4, 5, 6] as Rotation[]).forEach(rot => {
    generated[rotKey(system, rot)] = {
      system,
      rotation: rot,
      receiveTransition: transition,
      serveReceive:  serveReceivePositions(system, rot, complexity),
      baseDefense:   generateDefensePositions(system, rot, defenseType, complexity),
      baseOffense:   generateBasePositions(system, rot),
      servePhases:   buildServePhases(system, rot, defenseType, complexity),
      receivePhases: buildReceivePhases(system, rot, defenseType, complexity, transition),
    };
  });
  
  return generated;
}

// Fallback Factory for initial loads or non-wizard environments
export const FACTORY_DEFAULTS: Record<string, RotationDefaults> = {
  ...generateTeamDefaults('5-1', 'standard', 'switch-late'),
  ...generateTeamDefaults('6-2', 'standard', 'switch-late'),
  ...generateTeamDefaults('4-2', 'standard', 'switch-late'),
};