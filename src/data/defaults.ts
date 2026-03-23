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

// Updated Legacy Layouts mapped to new PlayerIds to prevent compilation errors.
const LEGACY_ROTATION_LAYOUTS: Record<Exclude<System, '5-1'>, Record<Rotation, RotationLayout>> = {
  '6-2': {
    1: { front: ['OH1', 'MB1', 'OP'], back: ['OH2', 'L',  'S' ] },
    2: { front: ['OH1', 'MB1', 'OP'], back: ['OH2', 'S',  'L' ] },
    3: { front: ['OP', 'MB1', 'OH1'], back: ['S',  'L',  'OH2'] },
    4: { front: ['S',  'OP', 'MB1'], back: ['OH1', 'L',  'OH2'] },
    5: { front: ['MB1', 'S',  'OP'], back: ['OH1', 'L',  'OH2'] },
    6: { front: ['MB1', 'OP', 'S' ], back: ['OH1', 'L',  'OH2'] },
  },
  '4-2': {
    1: { front: ['OH1', 'MB1', 'OP'], back: ['OH2', 'L',  'S' ] },
    2: { front: ['OH1', 'MB1', 'OP'], back: ['OH2', 'S',  'L' ] },
    3: { front: ['OP', 'MB1', 'OH1'], back: ['S',  'L',  'OH2'] },
    4: { front: ['S',  'OP', 'MB1'], back: ['OH1', 'L',  'OH2'] },
    5: { front: ['MB1', 'S',  'OP'], back: ['OH1', 'L',  'OH2'] },
    6: { front: ['MB1', 'OP', 'S' ], back: ['OH1', 'L',  'OH2'] },
  },
};

function getLegacyRotationLayout(system: System, rotation: Rotation): RotationLayout {
  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    return {
      front: [lineup.p4 as PlayerId, lineup.p3 as PlayerId, lineup.p2 as PlayerId],
      back: [lineup.p5 as PlayerId, lineup.p6 as PlayerId, lineup.p1 as PlayerId],
    };
  }
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
  if (system === '6-2') return layout.back.includes('S') ? 'S' : 'OH2';
  if (system === '4-2') {
    if (layout.front.includes('S'))  return 'S';
    if (layout.front.includes('OH2')) return 'OH2';
    if (layout.front.includes('OP')) return 'OP';
    return layout.front[0];
  }
  return 'S';
}

const N0: PhaseNotes = { S: '', OP: '', MB1: '', MB2: '', OH1: '', OH2: '', L: '' };

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
    
    // Assign positions based directly on rotational slots (P1-P6) mapping to court zones (Z1-Z6)
    pos[lineup.p1 as PlayerId] = { ...schema.digRight };  // P1 maps to Z1
    pos[lineup.p2 as PlayerId] = { ...schema.blockRight }; // P2 maps to Z2
    pos[lineup.p3 as PlayerId] = { ...schema.blockMid };   // P3 maps to Z3
    pos[lineup.p4 as PlayerId] = { ...schema.blockLeft };  // P4 maps to Z4
    pos[lineup.p5 as PlayerId] = { ...schema.digLeft };    // P5 maps to Z5
    pos[lineup.p6 as PlayerId] = { ...schema.digMiddle };  // P6 maps to Z6
    
    // The Libero has a special designation in Z6
    if (pos['L']) pos['L'] = { ...schema.digMiddle };

    return pos;
  }

  // Fallback to legacy logic for other systems
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

// Coordinates now perfectly match the target DEFENSE_SCHEMAS to prevent drifting.
// Z1=Server(400,805), Z2=FR_R(452,328), Z3=FR_M(270,325), Z4=FR_L(88,328), Z5=DC_L(88,685), Z6=DC_M(270,745)
const S5_1_PRE_SERVE_POSITIONS: Record<Rotation, Record<string, XY>> = {
  // R1: S serves. P2=OH1, P3=MB1, P4=OP, P5=OH2, P6=L
  1: { 'S': xy(400, 805), 'OH1': xy(452, 328), 'MB1': xy(270, 325), 'OP': xy(88, 328), 'OH2': xy(88, 685), 'L': xy(270, 745) },
  // R2: OH1 serves. P2=MB1, P3=OP, P4=OH2, P5=L, P6=S
  2: { 'OH1': xy(400, 805), 'MB1': xy(452, 328), 'OP': xy(270, 325), 'OH2': xy(88, 328), 'L': xy(88, 685), 'S': xy(270, 745) },
  // R3: MB1(L) serves. P2=OP, P3=OH2, P4=MB2, P5=S, P6=OH1
  3: { 'MB1': xy(400, 805), 'OP': xy(452, 328), 'OH2': xy(270, 325), 'MB2': xy(88, 328), 'S': xy(88, 685), 'OH1': xy(270, 745) },
  // R4: OP serves. P2=OH2, P3=MB2, P4=S, P5=OH1, P6=L
  4: { 'OP': xy(400, 805), 'OH2': xy(452, 328), 'MB2': xy(270, 325), 'S': xy(88, 328), 'OH1': xy(88, 685), 'L': xy(270, 745) },
  // R5: OH2 serves. P2=MB2, P3=S, P4=OH1, P5=L, P6=OP
  5: { 'OH2': xy(400, 805), 'MB2': xy(452, 328), 'S': xy(270, 325), 'OH1': xy(88, 328), 'L': xy(88, 685), 'OP': xy(270, 745) },
  // R6: MB2(L) serves. P2=S, P3=OH1, P4=MB1, P5=OP, P6=OH2
  6: { 'MB2': xy(400, 805), 'S': xy(452, 328), 'OH1': xy(270, 325), 'MB1': xy(88, 328), 'OP': xy(88, 685), 'OH2': xy(270, 745) },
};

function preServePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  if (system === '5-1') {
    const newPos = S5_1_PRE_SERVE_POSITIONS[rotation];
    const pos: PositionMap = {} as PositionMap;

    // Directly assign based on the exact keys now that types are updated
    for (const key in newPos) {
      pos[key as PlayerId] = newPos[key];
    }
    
    // Manual fix for Libero serving in R3/R6.
    if (rotation === 3) pos['L'] = newPos['MB1'];
    if (rotation === 6) pos['L'] = newPos['MB2'];

    return pos;
  }

  // NOTE: 6-2 and 4-2 systems now use exact perimeter coordinates to prevent drifting and map to new ID formats.
  if (system === '6-2') {
    switch (rotation) {
      case 1: return { S: xy(400,805), OP: xy(452,328), MB1: xy(270,325), OH1: xy(88,328), OH2: xy(88,685), L: xy(270,745) };
      case 2: return { L: xy(400,805), OP: xy(452,328), MB1: xy(270,325), OH1: xy(88,328), OH2: xy(88,685), S: xy(270,745) };
      case 3: return { OH2: xy(400,805), OH1: xy(452,328), MB1: xy(270,325), OP: xy(88,328), S: xy(88,685), L: xy(270,745) };
      case 4: return { OH2: xy(400,805), MB1: xy(452,328), OP: xy(270,325), S: xy(88,328), OH1: xy(88,685), L: xy(270,745) };
      case 5: return { OH2: xy(400,805), OP: xy(452,328), S: xy(270,325), MB1: xy(88,328), OH1: xy(88,685), L: xy(270,745) };
      case 6: return { OH2: xy(400,805), S: xy(452,328), OP: xy(270,325), MB1: xy(88,328), OH1: xy(88,685), L: xy(270,745) };
    }
  }
  if (system === '4-2') {
    switch (rotation) {
      case 1: return { S: xy(400,805), OP: xy(452,328), MB1: xy(270,325), OH1: xy(88,328), OH2: xy(88,685), L: xy(270,745) };
      case 2: return { L: xy(400,805), OP: xy(452,328), MB1: xy(270,325), OH1: xy(88,328), OH2: xy(88,685), S: xy(270,745) };
      case 3: return { OH2: xy(400,805), OH1: xy(452,328), MB1: xy(270,325), OP: xy(88,328), S: xy(88,685), L: xy(270,745) };
      case 4: return { OH2: xy(400,805), MB1: xy(452,328), OP: xy(270,325), S: xy(88,328), OH1: xy(88,685), L: xy(270,745) };
      case 5: return { OH2: xy(400,805), OP: xy(452,328), S: xy(270,325), MB1: xy(88,328), OH1: xy(88,685), L: xy(270,745) };
      case 6: return { OH2: xy(400,805), S: xy(452,328), OP: xy(270,325), MB1: xy(88,328), OH1: xy(88,685), L: xy(270,745) };
    }
  }
  return { S: xy(400,805), OP: xy(420,330), MB1: xy(270,330), OH1: xy(120,330), OH2: xy(140,580), L: xy(270,620) };
}

// ═══════════════════════════════════════════════════════════════
// SERVE RECEIVE POSITIONS (Opponent serves)
// ═══════════════════════════════════════════════════════════════

const S5_1_SERVE_RECEIVE_POSITIONS: Record<Rotation, Record<string, XY>> = {
  1: { 'S': xy(470, 710), 'OH1': xy(400, 550), 'MB1': xy(310, 330), 'OP': xy(120, 330), 'OH2': xy(120, 580), 'L': xy(270, 580) },
  2: { 'S': xy(400, 560), 'OH1': xy(440, 600), 'MB1': xy(440, 330), 'OP': xy(300, 330), 'OH2': xy(130, 500), 'L': xy(130, 600) },
  3: { 'S': xy(100, 580), 'OH1': xy(270, 600), 'L': xy(430, 600), 'MB2': xy(120, 330), 'OH2': xy(250, 480), 'OP': xy(440, 330) },
  4: { 'S': xy(100, 330), 'MB2': xy(200, 330), 'OH2': xy(300, 480), 'OP': xy(440, 600), 'OH1': xy(100, 580), 'L': xy(270, 600) },
  5: { 'S': xy(330, 330), 'MB2': xy(440, 330), 'OH1': xy(130, 480), 'OH2': xy(430, 600), 'L': xy(130, 600), 'OP': xy(270, 600) },
  6: { 'S': xy(395, 318), 'MB1': xy(100, 330), 'OH1': xy(250, 480), 'L': xy(430, 600), 'OH2': xy(270, 600), 'OP': xy(120, 600) },
};

function serveReceivePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  if (system === '5-1') {
    const newPos = S5_1_SERVE_RECEIVE_POSITIONS[rotation];
    const pos: PositionMap = {} as PositionMap;

    // Direct mapping to correct PlayerIds
    for (const key in newPos) {
      pos[key as PlayerId] = newPos[key];
    }
    
    // Manual fix for Libero mapping
    if (rotation === 3) pos['L'] = newPos['L'];
    if (rotation === 6) pos['L'] = newPos['L'];

    return pos;
  }
  
  if (system === '6-2') {
    if (complexity === 'standard') switch (rotation) {
      case 1: return { S: xy(420,365), OP: xy(420,330), MB1: xy(280,330), OH1: xy(110,460), OH2: xy(160,580), L: xy(300,580) };
      case 2: return { S: xy(270,365), OP: xy(450,330), MB1: xy(270,330), OH1: xy(110,460), OH2: xy(150,580), L: xy(400,580) };
      case 3: return { S: xy(120,365), OP: xy(120,330), MB1: xy(200,330), OH1: xy(270,480), OH2: xy(440,580), L: xy(360,580) };
      case 4: return { OH2: xy(420,365), MB1: xy(420,330), OP: xy(280,330), S:  xy(110,460), OH1: xy(160,580), L: xy(300,580) };
      case 5: return { OH2: xy(270,365), S:  xy(270,330), OP: xy(450,330), MB1: xy(110,460), OH1: xy(150,580), L: xy(400,580) };
      case 6: return { OH2: xy(120,365), MB1: xy(120,330), OP: xy(200,330), S:  xy(270,480), L:  xy(360,580), OH1: xy(440,580) };
    }
    if (complexity === 'advanced') switch (rotation) {
      case 1: return { S: xy(420,355), OP: xy(420,330), MB1: xy(280,330), OH1: xy(90,460),  OH2: xy(180,580), L: xy(340,580) };
      case 2: return { S: xy(270,355), OP: xy(450,330), MB1: xy(270,330), OH1: xy(90,460),  OH2: xy(150,580), L: xy(390,580) };
      case 3: return { S: xy(120,355), OP: xy(120,330), MB1: xy(200,330), OH1: xy(270,480), OH2: xy(440,580), L: xy(360,580) };
      case 4: return { OH2: xy(420,355), MB1: xy(420,330), OP: xy(280,330), S:  xy(90,460),  OH1: xy(180,580), L: xy(340,580) };
      case 5: return { OH2: xy(270,355), S:  xy(270,330), OP: xy(450,330), MB1: xy(90,460),  OH1: xy(150,580), L: xy(390,580) };
      case 6: return { OH2: xy(120,355), MB1: xy(120,330), OP: xy(200,330), S:  xy(270,480), L:  xy(360,580), OH1: xy(440,580) };
    }
    return serveReceivePositions('5-1', rotation, 'basic');
  }
  if (system === '4-2') switch (rotation) {
    case 1: return { OP: xy(420,330), MB1: xy(270,330), OH1: xy(120,330), OH2: xy(120,580), L: xy(270,580), S: xy(420,580) };
    case 2: return { OP: xy(420,330), MB1: xy(270,330), OH1: xy(120,330), OH2: xy(120,580), S: xy(270,580), L: xy(420,580) };
    case 3: return { OP: xy(150,330), MB1: xy(300,330), OH1: xy(420,330), S:  xy(120,580), L: xy(270,580), OH2: xy(420,580) };
    case 4: return { S:  xy(150,330), OP: xy(300,330), MB1: xy(420,330), OH1: xy(120,580), L: xy(270,580), OH2: xy(420,580) };
    case 5: return { MB1: xy(120,330), S:  xy(270,330), OP: xy(420,330), OH1: xy(120,580), L: xy(270,580), OH2: xy(420,580) };
    case 6: return { MB1: xy(120,330), OP: xy(270,330), S:  xy(420,330), OH1: xy(120,580), L: xy(270,580), OH2: xy(420,580) };
  }
  return { S: xy(420,365), OP: xy(420,330), MB1: xy(280,330), OH1: xy(110,460), OH2: xy(160,580), L: xy(300,580) };
}

// ═══════════════════════════════════════════════════════════════
// PASS POSITIONS
// ═══════════════════════════════════════════════════════════════
function passPositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const sr  = serveReceivePositions(system, rotation, complexity);
  const sid = getActiveSetter(system, rotation);

  const mid: Record<System, Record<Rotation, XY>> = {
    '5-1': {
      1: xy(407, 341), 2: xy(332, 341), 3: xy(257, 341),
      4: xy(257, 324), 5: xy(332, 324), 6: xy(407, 324),
    },
    '6-2': {
      1: xy(407, 341), 2: xy(332, 341), 3: xy(257, 341),
      4: xy(407, 341), 5: xy(332, 341), 6: xy(257, 341),
    },
    '4-2': {
      1: xy(407, 324), 2: xy(407, 324), 3: xy(272, 324),
      4: xy(272, 324), 5: xy(332, 324), 6: xy(407, 324),
    },
  };

  return { ...sr, [sid]: mid[system][rotation] };
}

// ═══════════════════════════════════════════════════════════════
// SET POSITIONS
// ═══════════════════════════════════════════════════════════════
function setPositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const pass = passPositions(system, rotation, complexity);
  const sid  = getActiveSetter(system, rotation);
  const pos  = { ...pass, [sid]: { ...SET_TGT } };

  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    
    // Front-row players are in P2, P3, P4
    const frontRow = [
      { id: lineup.p4 as PlayerId, coord: xy(88, 380) },  // Left-side
      { id: lineup.p3 as PlayerId, coord: xy(270, 380) }, // Middle
      { id: lineup.p2 as PlayerId, coord: xy(452, 380) }, // Right-side
    ];
    
    for (const player of frontRow) {
      if (player.id !== sid) {
        pos[player.id] = player.coord;
      }
    }
    return pos;
  }
  
  // Fallback for 6-2 and 4-2 systems.
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
    const serverId = lineup.p1 as PlayerId;
    const isFront = lineup.p2 === 'S' || lineup.p3 === 'S' || lineup.p4 === 'S';

    const preNotes: PhaseNotes = { S: '', OP: '', MB1: '', MB2: '', OH1: '', OH2: '', L: '' };
    preNotes[serverId] = 'Serving.';

    const baseNotes: PhaseNotes = {
      S:  isFront ? 'Right-front blocking.' : 'Z1 base (right-back) ready to defend.',
      OP: 'Base position.',
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

  // Fallback to old incorrect logic
  const layout   = getLegacyRotationLayout(system, rotation);
  const server   = layout.back[2];
  const sid      = getActiveSetter(system, rotation);
  const isFront  = layout.front.includes(sid);
  const preNotes: PhaseNotes = {
    S:  server === 'S'  ? 'Serving.' : (isFront ? 'At net, ready to set.' : 'Back row.'),
    OP: layout.front.includes('OP') ? 'At net, blocking position.' : 'Back row.',
    MB1: layout.front.includes('MB1') ? 'At net, center.'            : 'Back row.',
    MB2: '',
    OH1: layout.front.includes('OH1') ? 'At net, left side.'         : 'Back row.',
    OH2: server === 'OH2' ? 'Serving.' : 'Back row.',
    L:  server === 'L'  ? 'Serving.' : 'Back row, defensive ready.',
  };
  const baseNotes: PhaseNotes = {
    S:  isFront ? 'Right-front blocking.' : 'Z1 base (right-back) ready to defend.',
    OP: layout.front.includes('OP') ? 'Right antenna blocking.' : 'Back-row defense.',
    MB1: layout.front.includes('MB1') ? 'Center net.'             : 'Back-row defense.',
    MB2: '',
    OH1: layout.front.includes('OH1') ? 'Left antenna blocking.'  : 'Back-row defense.',
    OH2: 'Base position.',
    L:  'Deep center base.',
  };
  return [
    { label: 'Pre-Serve',    ball: { x: preServe[server]?.x ?? 400, y: preServe[server]?.y ?? 805 }, pos: preServe, notes: preNotes  },
    { label: 'Base Defense', ball: xy(270, 112),                                                     pos: base,     notes: baseNotes },
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

  // OFFENSIVE PLAY: players hold set positions
  const atkPos: PositionMap = { ...setPos };

  const passNotes: PhaseNotes = { ...N0, [sid]: 'Releasing to target.', L: 'Passing ball to target.' };
  const setNotes:  PhaseNotes = { S: 'Setting the offense.', OP: 'Ready to attack.', MB1: 'Ready to attack.', MB2: 'Ready to attack.', OH1: 'Ready to attack.', OH2: 'Coverage.', L: 'Coverage.' };
  const atkNotes:  PhaseNotes = { S: 'Ball is live.', OP: 'Ball is live.', MB1: 'Ball is live.', MB2: 'Ball is live.', OH1: 'Ball is live.', OH2: 'Ball is live.', L: 'Ball is live.' };

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