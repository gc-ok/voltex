// src/data/defaults.ts
import {
  RotationDefaults, System, Rotation, PositionMap, DefenseType,
  RotationLayout, DefenseSchema, PlayerId, Phase, PhaseNotes, XY, ComplexityLevel,
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

// ═══════════════════════════════════════════════════════════════
// rotKey
// ═══════════════════════════════════════════════════════════════
export function rotKey(system: System, rotation: Rotation): string {
  return `${system}-${rotation}`;
}

// ═══════════════════════════════════════════════════════════════
// Rotation Layouts
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// Rotation Layouts
// ═══════════════════════════════════════════════════════════════

// Player roles in each of the 6 rotational slots (P1-P6) for a 5-1 system.
// This is the source of truth for which player is in which position for each rotation.
// P1 is server, P2 is front-right, P3 is front-middle, P4 is front-left, P5 is back-left, P6 is back-middle.
const S5_1_LINEUP: Record<Rotation, { p1: string, p2: string, p3: string, p4: string, p5: string, p6: string }> = {
  // R1: S serves from P1. Front-row is OP(P4), MB1(P3), OH1(P2).
  1: { p1: 'S',   p2: 'OH1', p3: 'MB1', p4: 'OP',  p5: 'OH2', p6: 'L' },
  // R2: OH1 serves from P1. Front-row is OH2(P4), OP(P3), MB1(P2).
  2: { p1: 'OH1', p2: 'MB1', p3: 'OP',  p4: 'OH2', p5: 'L',   p6: 'S' },
  // R3: L serves for MB1 from P1. Front-row is MB2(P4), OH2(P3), OP(P2).
  3: { p1: 'L',   p2: 'OP',  p3: 'OH2', p4: 'MB2', p5: 'S',   p6: 'OH1' },
  // R4: OP serves from P1. Front-row is S(P4), MB2(P3), OH2(P2).
  4: { p1: 'OP',  p2: 'OH2', p3: 'MB2', p4: 'S',   p5: 'OH1', p6: 'L' },
  // R5: OH2 serves from P1. Front-row is OH1(P4), S(P3), MB2(P2).
  5: { p1: 'OH2', p2: 'MB2', p3: 'S',   p4: 'OH1', p5: 'L',   p6: 'OP' },
  // R6: L serves for MB2 from P1. Front-row is MB1(P4), OH1(P3), S(P2).
  6: { p1: 'L',   p2: 'S',   p3: 'OH1', p4: 'MB1', p5: 'OP',  p6: 'OH2' },
};

// This function translates the "real" lineup from S5_1_LINEUP into the legacy RotationLayout format.
// This is a temporary compatibility layer.
// This function translates the "real" lineup from S5_1_LINEUP into the legacy RotationLayout format.
// This is a temporary compatibility layer.

const LEGACY_ROTATION_LAYOUTS: Record<Exclude<System, '5-1'>, Record<Rotation, RotationLayout>> = {
  '6-2': {
    1: { front: ['OH', 'MB', 'OP'], back: ['RS', 'L',  'S' ] },
    2: { front: ['OH', 'MB', 'OP'], back: ['RS', 'S',  'L' ] },
    3: { front: ['OP', 'MB', 'OH'], back: ['S',  'L',  'RS'] },
    4: { front: ['S',  'OP', 'MB'], back: ['OH', 'L',  'RS'] },
    5: { front: ['MB', 'S',  'OP'], back: ['OH', 'L',  'RS'] },
    6: { front: ['MB', 'OP', 'S' ], back: ['OH', 'L',  'RS'] },
  },
  '4-2': {
    1: { front: ['OH', 'MB', 'OP'], back: ['RS', 'L',  'S' ] },
    2: { front: ['OH', 'MB', 'OP'], back: ['RS', 'S',  'L' ] },
    3: { front: ['OP', 'MB', 'OH'], back: ['S',  'L',  'RS'] },
    4: { front: ['S',  'OP', 'MB'], back: ['OH', 'L',  'RS'] },
    5: { front: ['MB', 'S',  'OP'], back: ['OH', 'L',  'RS'] },
    6: { front: ['MB', 'OP', 'S' ], back: ['OH', 'L',  'RS'] },
  },
};

function getLegacyRotationLayout(system: System, rotation: Rotation): RotationLayout {
  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    // The "front" and "back" arrays in the legacy layout referred to the players'
    // home positions (Z4/3/2 and Z5/6/1), not their actual rotational positions.
    // This was the source of the bugs. We now map the rotational players to these flawed fixed roles.
    const playerMap: Record<string, PlayerId> = {
      'S': 'S', 'OP': 'OP', 'L': 'L',
      'OH1': rotation <= 3 ? 'RS' : 'OH',
      'OH2': rotation <= 3 ? 'OH' : 'RS',
      'MB1': 'MB',
      'MB2': 'MB',
    };
     if (rotation === 3) { playerMap['MB1'] = 'L'; playerMap['OH1'] = 'RS'; playerMap['MB2'] = 'MB' }
     if (rotation === 4) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
     if (rotation === 5) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
     if (rotation === 6) { playerMap['MB1'] = 'MB'; playerMap['MB2'] = 'L'; playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'}


    return {
      front: [playerMap[lineup.p4], playerMap[lineup.p3], playerMap[lineup.p2]],
      back: [playerMap[lineup.p5], playerMap[lineup.p6], playerMap[lineup.p1]],
    };
  }

  // Fallback to old, incorrect layouts for other systems
  return LEGACY_ROTATION_LAYOUTS[system as Exclude<System, '5-1'>][rotation];
}


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

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function getActiveSetter(system: System, rotation: Rotation): PlayerId {
  const layout = getLegacyRotationLayout(system, rotation);
  if (system === '5-1') return 'S';
  if (system === '6-2') return layout.back.includes('S') ? 'S' : 'RS';
  if (system === '4-2') {
    if (layout.front.includes('S'))  return 'S';
    if (layout.front.includes('RS')) return 'RS';
    if (layout.front.includes('OP')) return 'OP';
    return layout.front[0];
  }
  return 'S';
}

const N0: PhaseNotes = { S: '', OP: '', MB: '', OH: '', RS: '', L: '' };

// ═══════════════════════════════════════════════════════════════
// Base Defense Positions
// ═══════════════════════════════════════════════════════════════
export function generateDefensePositions(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard',
): PositionMap {
  const schema = DEFENSE_SCHEMAS[defenseType];
  const pos: PositionMap = {} as PositionMap;

  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    const playerMap: Record<string, PlayerId> = {
      'S': 'S', 'OP': 'OP', 'L': 'L',
      'OH1': rotation <= 3 ? 'RS' : 'OH',
      'OH2': rotation <= 3 ? 'OH' : 'RS',
      'MB1': 'MB', 'MB2': 'MB',
    };
    if (rotation === 3) { playerMap['MB1'] = 'L'; playerMap['OH1'] = 'RS'; playerMap['MB2'] = 'MB' }
    if (rotation === 4) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 5) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 6) { playerMap['MB1'] = 'MB'; playerMap['MB2'] = 'L'; playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'}
    
    // Assign positions based on rotational slots (P1-P6) mapping to court zones (Z1-Z6)
    const p = lineup;
    pos[playerMap[p.p1]] = { ...schema.digRight };  // P1 maps to Z1
    pos[playerMap[p.p2]] = { ...schema.blockRight }; // P2 maps to Z2
    pos[playerMap[p.p3]] = { ...schema.blockMid };   // P3 maps to Z3
    pos[playerMap[p.p4]] = { ...schema.blockLeft };  // P4 maps to Z4
    pos[playerMap[p.p5]] = { ...schema.digLeft };    // P5 maps to Z5
    pos[playerMap[p.p6]] = { ...schema.digMiddle };  // P6 maps to Z6
    
    // The Libero has a special designation in Z6
    if (pos['L']) pos['L'] = { ...schema.digMiddle };


    // The old logic had some complexity adjustments. This is not in the reference doc
    // and was likely based on the incorrect layouts. It is removed for now to favor
    // the documented base positions. Re-implementing this would require new rules.
    return pos;
  }

  // Fallback to old incorrect logic for other systems
  const layout = getLegacyRotationLayout(system, rotation);
  const z4 = layout.front[0], z3 = layout.front[1], z2 = layout.front[2];
  const z5 = layout.back[0],  z6 = layout.back[1],  z1 = layout.back[2];
  pos[z4] = { ...schema.blockLeft };  pos[z3] = { ...schema.blockMid };  pos[z2] = { ...schema.blockRight };
  pos[z5] = { ...schema.digLeft };    pos[z6] = { ...schema.digMiddle }; pos[z1] = { ...schema.digRight };
  if (complexity === 'basic') return pos;
  const sid = getActiveSetter(system, rotation);
  if      (z4 === sid || z4 === 'OP') { pos[z4] = { ...schema.blockRight }; pos[z2] = { ...schema.blockLeft }; }
  else if (z3 === sid || z3 === 'OP') { pos[z3] = { ...schema.blockRight }; pos[z2] = { ...schema.blockMid };  }
  if      (z5 === sid) { pos[z5] = { ...schema.digRight };  pos[z1] = { ...schema.digLeft };   }
  else if (z6 === sid) { pos[z6] = { ...schema.digRight };  pos[z1] = { ...schema.digMiddle }; }
  return pos;
}

export function generateBasePositions(system: System, rotation: Rotation): PositionMap {
  return generateDefensePositions(system, rotation, 'perimeter', 'standard');
}

// ═══════════════════════════════════════════════════════════════
// PRE-SERVE POSITIONS (Our team serves)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// PRE-SERVE POSITIONS (Our team serves)
// ═══════════════════════════════════════════════════════════════

// EDIT THIS to change pre-serve positions for the 5-1 system.
// Each rotation has 6 players. The coordinates define the legal starting position *before* the serve.
// Players who are not switching should have coordinates identical to their base defense position to avoid "drifting" animations.
const S5_1_PRE_SERVE_POSITIONS: Record<Rotation, Record<string, XY>> = {
  // R1: S serves. OH1/OP switch. MB1 stays. OH2/L transition.
  1: { 'S': xy(400, 805), 'OH1': xy(440, 340), 'MB1': xy(270, 325), 'OP': xy(100, 340), 'OH2': xy(120, 560), 'L': xy(270, 560) },
  // R2: OH1 serves. MB1/OP/OH2 all switch.
  2: { 'OH1': xy(400, 805), 'MB1': xy(440, 340), 'OP': xy(270, 330), 'OH2': xy(100, 340), 'L': xy(120, 560), 'S': xy(350, 560) },
  // R3: L/MB1 serves. OP stays. MB2/OH2 switch.
  3: { 'MB1': xy(400, 805), 'OP': xy(452, 328), 'OH2': xy(270, 330), 'MB2': xy(100, 340), 'S': xy(120, 560), 'OH1': xy(270, 560) },
  // R4: OP serves. S is front row, stays. OH2/MB2 switch.
  4: { 'OP': xy(400, 805), 'OH2': xy(440, 340), 'MB2': xy(270, 330), 'S': xy(88, 328), 'OH1': xy(120, 560), 'L': xy(270, 560) },
  // R5: OH2 serves. S is front row, stays. OH1/MB2 switch.
  5: { 'OH2': xy(400, 805), 'MB2': xy(440, 340), 'S': xy(270, 325), 'OH1': xy(100, 340), 'L': xy(120, 560), 'OP': xy(270, 560) },
  // R6: L/MB2 serves. S is front row, stays. MB1/OH1 switch.
  6: { 'MB2': xy(400, 805), 'S': xy(452, 328), 'OH1': xy(270, 330), 'MB1': xy(100, 340), 'OP': xy(120, 560), 'OH2': xy(270, 560) },
};

function preServePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  if (system === '5-1') {
    const newPos = S5_1_PRE_SERVE_POSITIONS[rotation];
    const pos: PositionMap = {} as PositionMap;

    // This is a temporary mapping to translate correct player roles to the app's legacy PlayerId type.
    // This should be removed when PlayerId type is updated.
    // Assumption: 'OH' is the outside hitter opposite the setter's starting side, 'RS' is the other one. 'MB' is the middle who starts front-row with the setter.
    const playerMap: Record<string, PlayerId> = {
      'S': 'S', 'OP': 'OP', 'L': 'L',
      'OH1': rotation <= 3 ? 'RS' : 'OH',
      'OH2': rotation <= 3 ? 'OH' : 'RS',
      'MB1': rotation <= 3 || rotation === 6 ? 'MB' : 'RS', // No second MB in PlayerId
      'MB2': rotation >= 4 && rotation <= 5 ? 'MB' : 'RS', // No second MB in PlayerId
    };

    // This logic is imperfect due to the limited PlayerID type, especially for MBs.
    // It prioritizes getting OH/RS/S/OP/L correct.
    if (rotation === 3) { playerMap['MB1'] = 'L'; playerMap['OH1'] = 'RS'; playerMap['MB2'] = 'MB' }
    if (rotation === 4) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 5) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 6) { playerMap['MB1'] = 'MB'; playerMap['MB2'] = 'L'; playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'}


    for (const key in newPos) {
      const newKey = playerMap[key] || 'OP'; // Fallback
      pos[newKey] = newPos[key];
    }
    
    // Manual fix for Libero serving in R3/R6 per old logic. Ref doc says MB serves.
    if (rotation === 3) pos['L'] = newPos['MB1'];
    if (rotation === 6) pos['L'] = newPos['MB2'];


    return pos;
  }

  // NOTE: 6-2 and 4-2 systems still use the old, incorrect logic and are pending a refactor.
  // EDIT THE `switch` statements below to change pre-serve positions for 6-2 and 4-2 systems.
  const isAdv = complexity === 'advanced';
  if (system === '6-2') {
    switch (rotation) {
      case 1: return { S: xy(400,805), OP: xy(420,330), MB: xy(270,330), OH: xy(120,330), RS: xy(140,580), L: xy(270,620) };
      case 2: return { L: xy(400,805), OP: xy(420,330), MB: xy(270,330), OH: xy(120,330), RS: xy(140,580), S: xy(360,580) };
      case 3: return { RS: xy(400,805), OH: xy(320,330), MB: xy(270,330), OP: xy(220,330), S: xy(240,580), L: xy(270,620) };
      case 4: return { RS: xy(400,805), MB: xy(320,330), OP: xy(270,330), S: xy(220,330), OH: xy(140,580), L: xy(270,620) };
      case 5: return { RS: xy(400,805), OP: xy(320,330), S: xy(270,330), MB: xy(220,330), OH: xy(140,580), L: xy(270,620) };
      case 6: return { RS: xy(400,805), S: xy(420,330), OP: xy(270,330), MB: xy(220,330), OH: xy(140,580), L: xy(270,620) };
    }
  }
  if (system === '4-2') {
    switch (rotation) {
      case 1: return { S: xy(400,805), OP: xy(400,330), MB: xy(270,330), OH: xy(140,330), RS: xy(140,560), L: xy(270,560) };
      case 2: return { L: xy(400,805), OP: xy(400,330), MB: xy(270,330), OH: xy(140,330), RS: xy(140,560), S: xy(270,560) };
      case 3: return { RS: xy(400,805), OP: xy(isAdv?240:225,330), MB: xy(270,330), OH: xy(isAdv?300:315,330), S: xy(isAdv?240:225,560), L: xy(270,560) };
      case 4: return { RS: xy(400,805), S:  xy(isAdv?240:225,330), OP: xy(270,330), MB: xy(isAdv?300:315,330), OH: xy(140,560), L: xy(270,560) };
      case 5: return { RS: xy(400,805), MB: xy(isAdv?240:225,330), S:  xy(270,330), OP: xy(isAdv?300:315,330), OH: xy(140,560), L: xy(270,560) };
      case 6: return { RS: xy(400,805), MB: xy(isAdv?240:225,330), OP: xy(270,330), S:  xy(isAdv?300:315,330), OH: xy(140,560), L: xy(270,560) };
    }
  }
  return { S: xy(400,805), OP: xy(420,330), MB: xy(270,330), OH: xy(120,330), RS: xy(140,580), L: xy(270,620) };
}

// ═══════════════════════════════════════════════════════════════
// SERVE RECEIVE POSITIONS (Opponent serves)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// SERVE RECEIVE POSITIONS (Opponent serves)
// ═══════════════════════════════════════════════════════════════

// EDIT THIS to change serve-receive positions for the 5-1 system.
// Each rotation has a standard, advanced, and basic formation.
// The coordinates define the legal starting position *before* the opponent serves.
const S5_1_SERVE_RECEIVE_POSITIONS: Record<Rotation, Record<string, XY>> = {
  // R1: S pushes from P1. OH1 passes, then hits outside. OP stacks left, hits right.
  1: { 'S': xy(470, 710), 'OH1': xy(400, 550), 'MB1': xy(310, 330), 'OP': xy(120, 330), 'OH2': xy(120, 580), 'L': xy(270, 580) },
  // R2: S pushes from P6. OH2 passes, then hits outside.
  2: { 'S': xy(400, 560), 'OH1': xy(440, 600), 'MB1': xy(440, 330), 'OP': xy(300, 330), 'OH2': xy(130, 500), 'L': xy(130, 600) },
  // R3: S pushes from P5 (long run). OH2 passes center, hits outside.
  3: { 'S': xy(100, 580), 'OH1': xy(270, 600), 'L': xy(430, 600), 'MB2': xy(120, 330), 'OH2': xy(250, 480), 'OP': xy(440, 330) },
  // R4: S is front row (P4). Stacks left to allow OH2 to hit outside.
  4: { 'S': xy(100, 330), 'MB2': xy(200, 330), 'OH2': xy(300, 480), 'OP': xy(440, 600), 'OH1': xy(100, 580), 'L': xy(270, 600) },
  // R5: S is front row (P3). Easy transition.
  5: { 'S': xy(330, 330), 'MB2': xy(440, 330), 'OH1': xy(130, 480), 'OH2': xy(430, 600), 'L': xy(130, 600), 'OP': xy(270, 600) },
  // R6: S is front row (P2), already at target.
  6: { 'S': xy(395, 318), 'MB1': xy(100, 330), 'OH1': xy(250, 480), 'L': xy(430, 600), 'OH2': xy(270, 600), 'OP': xy(120, 600) },
};

function serveReceivePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  if (system === '5-1') {
    // The reference doc only has one set of coordinates, so we'll ignore complexity for now.
    const newPos = S5_1_SERVE_RECEIVE_POSITIONS[rotation];
    const pos: PositionMap = {} as PositionMap;

    // This is a temporary mapping to translate correct player roles to the app's legacy PlayerId type.
    const playerMap: Record<string, PlayerId> = {
      'S': 'S', 'OP': 'OP', 'L': 'L',
      'OH1': rotation <= 3 ? 'RS' : 'OH',
      'OH2': rotation <= 3 ? 'OH' : 'RS',
      'MB1': 'MB', // Simplification
      'MB2': 'MB', // Simplification
    };
    
    if (rotation === 3) { playerMap['L'] = 'L'; playerMap['OH1'] = 'RS'; playerMap['MB2'] = 'MB' }
    if (rotation === 4) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 5) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 6) { playerMap['MB1'] = 'MB'; playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'}


    for (const key in newPos) {
      const newKey = playerMap[key] || 'OP'; // Fallback
      if (key === 'MB1' && rotation === 6) {
        pos['MB'] = newPos[key]
      } else if (key === 'MB2' && rotation === 3) {
        pos['MB'] = newPos[key];
      }
      else {
        pos[newKey] = newPos[key];
      }
    }
    
    // Manual fix for Libero, since MB1/MB2 get mapped to the same 'MB' PlayerId
    if (rotation === 3) pos['L'] = newPos['L'];
    if (rotation === 6) pos['L'] = newPos['L'];


    return pos;
  }
  
  // NOTE: 6-2 and 4-2 systems still use the old, incorrect logic and are pending a refactor.
  // EDIT THE `switch` statements below to change serve-receive positions for 6-2 and 4-2 systems.
  // The logic is separated by `complexity` level (standard, advanced, basic).
  if (system === '6-2') {
    if (complexity === 'standard') switch (rotation) {
      case 1: return { S: xy(420,365), OP: xy(420,330), MB: xy(280,330), OH: xy(110,460), RS: xy(160,580), L: xy(300,580) };
      case 2: return { S: xy(270,365), OP: xy(450,330), MB: xy(270,330), OH: xy(110,460), RS: xy(150,580), L: xy(400,580) };
      case 3: return { S: xy(120,365), OP: xy(120,330), MB: xy(200,330), OH: xy(270,480), RS: xy(440,580), L: xy(360,580) };
      case 4: return { RS: xy(420,365), MB: xy(420,330), OP: xy(280,330), S:  xy(110,460), OH: xy(160,580), L: xy(300,580) };
      case 5: return { RS: xy(270,365), S:  xy(270,330), OP: xy(450,330), MB: xy(110,460), OH: xy(150,580), L: xy(400,580) };
      case 6: return { RS: xy(120,365), MB: xy(120,330), OP: xy(200,330), S:  xy(270,480), L:  xy(360,580), OH: xy(440,580) };
    }
    if (complexity === 'advanced') switch (rotation) {
      case 1: return { S: xy(420,355), OP: xy(420,330), MB: xy(280,330), OH: xy(90,460),  RS: xy(180,580), L: xy(340,580) };
      case 2: return { S: xy(270,355), OP: xy(450,330), MB: xy(270,330), OH: xy(90,460),  RS: xy(150,580), L: xy(390,580) };
      case 3: return { S: xy(120,355), OP: xy(120,330), MB: xy(200,330), OH: xy(270,480), RS: xy(440,580), L: xy(360,580) };
      case 4: return { RS: xy(420,355), MB: xy(420,330), OP: xy(280,330), S:  xy(90,460),  OH: xy(180,580), L: xy(340,580) };
      case 5: return { RS: xy(270,355), S:  xy(270,330), OP: xy(450,330), MB: xy(90,460),  OH: xy(150,580), L: xy(390,580) };
      case 6: return { RS: xy(120,355), MB: xy(120,330), OP: xy(200,330), S:  xy(270,480), L:  xy(360,580), OH: xy(440,580) };
    }
    return serveReceivePositions('5-1', rotation, 'basic');
  }
  if (system === '4-2') switch (rotation) {
    case 1: return { OP: xy(420,330), MB: xy(270,330), OH: xy(120,330), RS: xy(120,580), L: xy(270,580), S: xy(420,580) };
    case 2: return { OP: xy(420,330), MB: xy(270,330), OH: xy(120,330), RS: xy(120,580), S: xy(270,580), L: xy(420,580) };
    case 3: return { OP: xy(150,330), MB: xy(300,330), OH: xy(420,330), S:  xy(120,580), L: xy(270,580), RS: xy(420,580) };
    case 4: return { S:  xy(150,330), OP: xy(300,330), MB: xy(420,330), OH: xy(120,580), L: xy(270,580), RS: xy(420,580) };
    case 5: return { MB: xy(120,330), S:  xy(270,330), OP: xy(420,330), OH: xy(120,580), L: xy(270,580), RS: xy(420,580) };
    case 6: return { MB: xy(120,330), OP: xy(270,330), S:  xy(420,330), OH: xy(120,580), L: xy(270,580), RS: xy(420,580) };
  }
  return { S: xy(420,365), OP: xy(420,330), MB: xy(280,330), OH: xy(110,460), RS: xy(160,580), L: xy(300,580) };
}

// ═══════════════════════════════════════════════════════════════
// PASS POSITIONS — "The Pass" phase
// Setter is halfway to target. Everyone else holds their SR spot.
// Edit the setter mid-point per rotation below.
// ═══════════════════════════════════════════════════════════════
function passPositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const sr  = serveReceivePositions(system, rotation, complexity);
  const sid = getActiveSetter(system, rotation);

  // EDIT THIS to change the setter's mid-point position during the "Pass" phase.
  // This is the point the setter moves to while the ball is in the air from the opponent's serve.
  // Each system and rotation has its own mid-point coordinate.
  const mid: Record<System, Record<Rotation, XY>> = {
    '5-1': {
      // S is active setter
      1: xy(407, 341),  // R1: S from P1(back) → target
      2: xy(332, 341),  // R2: S from P6(back) → target
      3: xy(257, 341),  // R3: S from P5(back) → target
      4: xy(257, 324),  // R4: S from P4(front) → target
      5: xy(332, 324),  // R5: S from P3(front) → target
      6: xy(407, 324),  // R6: S from P2(front) → target
    },
    '6-2': {
      // S sets from back row in R1-3, RS (as S) sets from back row in R4-6
      1: xy(407, 341),  // R1: S from P1(back) → target
      2: xy(332, 341),  // R2: S from P6(back) → target
      3: xy(257, 341),  // R3: S from P5(back) → target
      4: xy(407, 341),  // R4: RS from P1(back) → target
      5: xy(332, 341),  // R5: RS from P6(back) → target
      6: xy(257, 341),  // R6: RS from P5(back) → target
    },
    '4-2': {
      // Active setter is always front-row
      1: xy(407, 324),  // R1: OP (as S) from P2 → target
      2: xy(407, 324),  // R2: OP (as S) from P2 → target
      3: xy(272, 324),  // R3: OP (as S) from P3 → target
      4: xy(272, 324),  // R4: S from P4 → target
      5: xy(332, 324),  // R5: S from P3 → target
      6: xy(407, 324),  // R6: S from P2 → target
    },
  };

  return { ...sr, [sid]: mid[system][rotation] };
}

// ═══════════════════════════════════════════════════════════════
// SET POSITIONS — "The Set" phase
// Setter at target. Front row approaches antennas. Back row holds.
// Edit approach x/y per rotation below.
// ═══════════════════════════════════════════════════════════════
function setPositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const pass = passPositions(system, rotation, complexity);
  const sid  = getActiveSetter(system, rotation);
  const pos  = { ...pass, [sid]: { ...SET_TGT } };

  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    const playerMap: Record<string, PlayerId> = {
      'S': 'S', 'OP': 'OP', 'L': 'L',
      'OH1': rotation <= 3 ? 'RS' : 'OH', 'OH2': rotation <= 3 ? 'OH' : 'RS',
      'MB1': 'MB', 'MB2': 'MB',
    };
    if (rotation === 3) { playerMap['MB1'] = 'L'; playerMap['OH1'] = 'RS'; playerMap['MB2'] = 'MB' }
    if (rotation === 4) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 5) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 6) { playerMap['MB1'] = 'MB'; playerMap['MB2'] = 'L'; playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'}
    
    // Front-row players are in P2, P3, P4
    const frontRow = [lineup.p2, lineup.p3, lineup.p4];

    // EDIT THIS to change the attack approach positions for front-row hitters.
    // This defines where hitters move to as they are about to attack the ball.
    const approachPositions = {
      [lineup.p4]: xy(88, 380),  // Left-side hitter's approach (from P4)
      [lineup.p3]: xy(270, 380), // Middle hitter's approach (from P3)
      [lineup.p2]: xy(452, 380), // Right-side hitter's approach (from P2)
    };
    
    for (const p of frontRow) {
      const playerId = playerMap[p];
      if (playerId !== sid) {
        pos[playerId] = approachPositions[p];
      }
    }
    return pos;
  }
  
  // Fallback to old incorrect logic for 6-2 and 4-2 systems
  // EDIT THIS to change the attack approach positions for 6-2 and 4-2 systems.
  const layout = getLegacyRotationLayout(system, rotation);
  const approach: Record<System, Record<Rotation, [XY, XY, XY]>> = {
    '5-1':{1:[xy(88,380),xy(270,380),xy(452,380)],2:[xy(88,380),xy(270,380),xy(452,380)],3:[xy(88,380),xy(270,380),xy(452,380)],4:[xy(88,380),xy(270,380),xy(452,380)],5:[xy(88,380),xy(270,380),xy(452,380)],6:[xy(88,380),xy(270,380),xy(452,380)]},
    '6-2':{1:[xy(88,380),xy(270,380),xy(452,380)],2:[xy(88,380),xy(270,380),xy(452,380)],3:[xy(88,380),xy(270,380),xy(452,380)],4:[xy(88,380),xy(270,380),xy(452,380)],5:[xy(88,380),xy(270,380),xy(452,380)],6:[xy(88,380),xy(270,380),xy(452,380)]},
    '4-2':{1:[xy(88,380),xy(270,380),xy(452,380)],2:[xy(88,380),xy(270,380),xy(452,380)],3:[xy(88,380),xy(270,380),xy(452,380)],4:[xy(88,380),xy(270,380),xy(452,380)],5:[xy(88,380),xy(270,380),xy(452,380)],6:[xy(88,380),xy(270,380),xy(452,380)]},
  };
  const [apL, apC, apR] = approach[system][rotation];
  const [fL, fC, fR]    = layout.front;

  if (fL !== sid) pos[fL] = apL;
  if (fC !== sid) pos[fC] = apC;
  if (fR !== sid) pos[fR] = apR;

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

  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    const server = lineup.p1;
    const isFront = lineup.p2 === 'S' || lineup.p3 === 'S' || lineup.p4 === 'S';
    
    const playerMap: Record<string, PlayerId> = {
      'S': 'S', 'OP': 'OP', 'L': 'L',
      'OH1': rotation <= 3 ? 'RS' : 'OH', 'OH2': rotation <= 3 ? 'OH' : 'RS',
      'MB1': 'MB', 'MB2': 'MB',
    };
    if (rotation === 3) { playerMap['MB1'] = 'L'; playerMap['OH1'] = 'RS'; playerMap['MB2'] = 'MB' }
    if (rotation === 4) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 5) { playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'; playerMap['MB2'] = 'MB'}
    if (rotation === 6) { playerMap['MB1'] = 'MB'; playerMap['MB2'] = 'L'; playerMap['OH1'] = 'OH'; playerMap['OH2'] = 'RS'}

    const serverId = playerMap[server];

    const preNotes: PhaseNotes = { S: '', OP: '', MB: '', OH: '', RS: '', L: '' };
    preNotes[serverId] = 'Serving.';

    const baseNotes: PhaseNotes = {
      S:  isFront ? 'Right-front blocking.' : 'Z1 base (right-back) ready to defend.',
      OP: 'Base position.',
      MB: 'Base position.',
      OH: 'Base position.',
      RS: 'Base position.',
      L:  'Deep center base.',
    };
    
    const serverPos = preServe[serverId];
    return [
      { label: 'Pre-Serve',    ball: { x: serverPos?.x ?? 400, y: serverPos?.y ?? 805 }, pos: preServe, notes: preNotes  },
      { label: 'Base Defense', ball: xy(270, 112),                                      pos: base,     notes: baseNotes },
    ];
  }

  // Fallback to old incorrect logic
  const layout   = getLegacyRotationLayout(system, rotation);
  const server   = layout.back[2];
  const sid      = getActiveSetter(system, rotation);
  const isFront  = layout.front.includes(sid);
  const preNotes: PhaseNotes = {
    S:  server === 'S'  ? 'Serving.' : (isFront ? 'At net, ready to set.' : 'Back row.'),
    OP: layout.front.includes('OP') ? 'At net, blocking position.' : 'Back row.',
    MB: layout.front.includes('MB') ? 'At net, center.'            : 'Back row.',
    OH: layout.front.includes('OH') ? 'At net, left side.'         : 'Back row.',
    RS: server === 'RS' ? 'Serving.' : 'Back row.',
    L:  server === 'L'  ? 'Serving.' : 'Back row, defensive ready.',
  };
  const baseNotes: PhaseNotes = {
    S:  isFront ? 'Right-front blocking.' : 'Z1 base (right-back) ready to defend.',
    OP: layout.front.includes('OP') ? 'Right antenna blocking.' : 'Back-row defense.',
    MB: layout.front.includes('MB') ? 'Center net.'             : 'Back-row defense.',
    OH: layout.front.includes('OH') ? 'Left antenna blocking.'  : 'Back-row defense.',
    RS: 'Base position.',
    L:  'Deep center base.',
  };
  return [
    { label: 'Pre-Serve',    ball: { x: preServe[server]?.x ?? 400, y: preServe[server]?.y ?? 805 }, pos: preServe, notes: preNotes  },
    { label: 'Base Defense', ball: xy(270, 112),                                                      pos: base,     notes: baseNotes },
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
): Phase[] {
  const base    = generateDefensePositions(system, rotation, defenseType, complexity);
  const srPos   = serveReceivePositions(system, rotation, complexity);
  const passPos = passPositions(system, rotation, complexity);
  const setPos  = setPositions(system, rotation, complexity);
  const sid     = getActiveSetter(system, rotation);

  // OFFENSIVE PLAY: players hold set positions — overlay triggers here, no play coded in.
  const atkPos: PositionMap = { ...setPos };

  const passNotes: PhaseNotes = { ...N0, [sid]: 'Releasing to target.', L: 'Passing ball to target.' };
  const setNotes:  PhaseNotes = { S: 'Setting the offense.', OP: 'Ready to attack.', MB: 'Ready to attack.', OH: 'Ready to attack.', RS: 'Coverage.', L: 'Coverage.' };
  const atkNotes:  PhaseNotes = { S: 'Ball is live.', OP: 'Ball is live.', MB: 'Ball is live.', OH: 'Ball is live.', RS: 'Ball is live.', L: 'Ball is live.' };

  return [
    { label: 'Serve Receive',  ball: xy(270, 100),   pos: srPos,   notes: N0        },
    { label: 'The Pass',       ball: xy(270, 560),   pos: passPos, notes: passNotes },
    { label: 'The Set',        ball: { ...SET_TGT }, pos: setPos,  notes: setNotes  },
    { label: 'OFFENSIVE PLAY', ball: { ...SET_TGT }, pos: atkPos,  notes: N0        },
    { label: 'Transition',     ball: { ...SET_TGT }, pos: atkPos,  notes: N0        },
    { label: 'Base Defense',   ball: xy(270, 112),   pos: base,    notes: N0        },
  ];
}

// ═══════════════════════════════════════════════════════════════
// FACTORY_DEFAULTS
// ═══════════════════════════════════════════════════════════════
function buildAllDefaults(system: System): RotationDefaults[] {
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => ({
    system,
    rotation: rot,
    serveReceive:  serveReceivePositions(system, rot, 'standard'),
    baseDefense:   generateDefensePositions(system, rot, 'perimeter', 'standard'),
    baseOffense:   generateBasePositions(system, rot),
    servePhases:   buildServePhases(system, rot, 'perimeter', 'standard'),
    receivePhases: buildReceivePhases(system, rot, 'perimeter', 'standard'),
  }));
}

export const FACTORY_DEFAULTS: Record<string, RotationDefaults> = {};
[
  ...buildAllDefaults('5-1'),
  ...buildAllDefaults('6-2'),
  ...buildAllDefaults('4-2'),
].forEach(rd => {
  FACTORY_DEFAULTS[rotKey(rd.system, rd.rotation)] = rd;
});