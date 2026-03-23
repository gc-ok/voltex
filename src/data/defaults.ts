// src/data/defaults.ts
import {
  RotationDefaults, System, Rotation, PositionMap, DefenseType,
  RotationLayout, DefenseSchema, PlayerId, Phase, PhaseNotes, XY, ComplexityLevel, ReceiveTransition
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

const S5_1_LINEUP: Record<Rotation, { p1: string, p2: string, p3: string, p4: string, p5: string, p6: string }> = {
  1: { p1: 'S',   p2: 'OH1', p3: 'MB1', p4: 'OP',  p5: 'OH2', p6: 'L' },
  2: { p1: 'OH1', p2: 'MB1', p3: 'OP',  p4: 'OH2', p5: 'L',   p6: 'S' },
  3: { p1: 'L',   p2: 'OP',  p3: 'OH2', p4: 'MB2', p5: 'S',   p6: 'OH1' },
  4: { p1: 'OP',  p2: 'OH2', p3: 'MB2', p4: 'S',   p5: 'OH1', p6: 'L' },
  5: { p1: 'OH2', p2: 'MB2', p3: 'S',   p4: 'OH1', p5: 'L',   p6: 'OP' },
  6: { p1: 'L',   p2: 'S',   p3: 'OH1', p4: 'MB1', p5: 'OP',  p6: 'OH2' },
};

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

export function generateDefensePositions(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard',
): PositionMap {
  const schema = DEFENSE_SCHEMAS[defenseType];
  const pos: PositionMap = {};

  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    
    // Switch to Base Defense Roles dynamically!
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

const S5_1_PRE_SERVE_POSITIONS: Record<Rotation, Record<string, XY>> = {
  1: { 'S': xy(400, 805), 'OH1': xy(340, 328), 'MB1': xy(270, 325), 'OP': xy(200, 328), 'OH2': xy(88, 685), 'L': xy(270, 745) },
  2: { 'OH1': xy(400, 805), 'MB1': xy(340, 328), 'OP': xy(270, 325), 'OH2': xy(88, 328), 'L': xy(88, 685), 'S': xy(452, 685) },
  3: { 'MB1': xy(400, 805), 'OP': xy(452, 328), 'OH2': xy(270, 325), 'MB2': xy(200, 328), 'S': xy(452, 685), 'OH1': xy(88, 685) },
  4: { 'OP': xy(400, 805), 'OH2': xy(340, 328), 'MB2': xy(270, 325), 'S': xy(200, 328), 'OH1': xy(88, 685), 'L': xy(270, 745) },
  5: { 'OH2': xy(400, 805), 'MB2': xy(340, 328), 'S': xy(270, 325), 'OH1': xy(88, 328), 'L': xy(88, 685), 'OP': xy(452, 685) },
  6: { 'MB2': xy(400, 805), 'S': xy(452, 328), 'OH1': xy(270, 325), 'MB1': xy(200, 328), 'OP': xy(452, 685), 'OH2': xy(88, 685) },
};

function preServePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  if (system === '5-1') {
    const newPos = S5_1_PRE_SERVE_POSITIONS[rotation];
    const pos: PositionMap = {};
    for (const key in newPos) { pos[key as PlayerId] = newPos[key]; }
    if (rotation === 3) pos['L'] = newPos['MB1'];
    if (rotation === 6) pos['L'] = newPos['MB2'];
    return pos;
  }

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

// Highly accurate 5-1 Serve Receive Stacks
const S5_1_SERVE_RECEIVE_POSITIONS: Record<Rotation, Record<string, XY>> = {
  1: { 'S': xy(400, 560), 'OH1': xy(400, 480), 'MB1': xy(270, 330), 'OP': xy(88, 330), 'OH2': xy(140, 480), 'L': xy(270, 480) },
  2: { 'S': xy(270, 400), 'OH2': xy(140, 480), 'OP': xy(270, 330), 'MB1': xy(452, 330), 'L': xy(270, 550), 'OH1': xy(400, 480) },
  3: { 'S': xy(140, 400), 'MB2': xy(140, 330), 'OH2': xy(270, 480), 'OP': xy(452, 330), 'OH1': xy(400, 480), 'L': xy(270, 550) },
  4: { 'S': xy(140, 330), 'MB2': xy(270, 330), 'OH2': xy(400, 480), 'OH1': xy(140, 480), 'L': xy(270, 480), 'OP': xy(400, 600) },
  5: { 'S': xy(270, 330), 'OH1': xy(140, 480), 'MB2': xy(452, 330), 'L': xy(270, 480), 'OP': xy(270, 600), 'OH2': xy(400, 480) },
  6: { 'S': xy(400, 330), 'MB1': xy(140, 330), 'OH1': xy(270, 480), 'OP': xy(140, 600), 'OH2': xy(140, 480), 'L': xy(400, 480) },
};

function serveReceivePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  if (system === '5-1') {
    const newPos = S5_1_SERVE_RECEIVE_POSITIONS[rotation];
    const pos: PositionMap = {};
    for (const key in newPos) { pos[key as PlayerId] = newPos[key]; }
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

function setPositions(system: System, rotation: Rotation, complexity: ComplexityLevel, transition: ReceiveTransition): PositionMap {
  const pass = passPositions(system, rotation, complexity);
  const sid  = getActiveSetter(system, rotation);
  const pos  = { ...pass, [sid]: { ...SET_TGT } };

  if (system === '5-1') {
    const lineup = S5_1_LINEUP[rotation];
    const frontRow = [lineup.p2, lineup.p3, lineup.p4]; // Right, Mid, Left

    if (transition === 'switch-early') {
      // Players run directly to their BASE offensive zones to hit
      for (const p of frontRow) {
        if (p !== sid) {
          if (p.includes('OH')) pos[p] = xy(88, 380);  // Base Left
          if (p.includes('MB')) pos[p] = xy(270, 380); // Base Mid
          if (p === 'OP') pos[p] = xy(452, 380);       // Base Right
        }
      }
    } else {
      // switch-late: Players attack straight forward from their current ROTATIONAL slots
      if (lineup.p4 !== sid) pos[lineup.p4] = xy(88, 380);  // Z4 hits Left
      if (lineup.p3 !== sid) pos[lineup.p3] = xy(270, 380); // Z3 hits Mid
      if (lineup.p2 !== sid) pos[lineup.p2] = xy(452, 380); // Z2 hits Right
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

  if (fL !== sid && pos[fL]) pos[fL] = apL;
  if (fC !== sid && pos[fC]) pos[fC] = apC;
  if (fR !== sid && pos[fR]) pos[fR] = apR;

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
  transition: ReceiveTransition = 'switch-late',
): Phase[] {
  const base    = generateDefensePositions(system, rotation, defenseType, complexity);
  const srPos   = serveReceivePositions(system, rotation, complexity);
  const passPos = passPositions(system, rotation, complexity);
  const setPos  = setPositions(system, rotation, complexity, transition);
  const sid     = getActiveSetter(system, rotation);

  const atkPos: PositionMap = { ...setPos };

  const passNotes: PhaseNotes = { ...N0, [sid]: 'Releasing to target.', L: 'Passing ball to target.' };
  const setNotes:  PhaseNotes = { S: 'Setting the offense.', OP: 'Ready to attack.', MB1: 'Ready to attack.', MB2: 'Ready to attack.', OH1: 'Ready to attack.', OH2: 'Coverage.', L: 'Coverage.' };
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

function buildAllDefaults(system: System): RotationDefaults[] {
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => ({
    system,
    rotation: rot,
    receiveTransition: 'switch-late',
    serveReceive:  serveReceivePositions(system, rot, 'standard'),
    baseDefense:   generateDefensePositions(system, rot, 'perimeter', 'standard'),
    baseOffense:   generateBasePositions(system, rot),
    servePhases:   buildServePhases(system, rot, 'perimeter', 'standard'),
    receivePhases: buildReceivePhases(system, rot, 'perimeter', 'standard', 'switch-late'),
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