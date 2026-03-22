import { RotationDefaults, System, Rotation, PositionMap, DefenseType, RotationLayout, DefenseSchema, PlayerId, Phase, PhaseNotes, XY, ComplexityLevel } from './types';
import { PLAYS } from './plays';
import { FR_L, FR_M, FR_R, DC_L, DC_M, DC_R, MC_L, SET_TGT, BK_L, B_SET, OVR_XL, xy } from './constants';

// ═══════════════════════════════════════════════════════════════
// Factory Defaults — extracted from existing play data
// ═══════════════════════════════════════════════════════════════

function posFromPlay(playId: string): PositionMap {
  const play = PLAYS.find(p => p.id === playId);
  if (!play) throw new Error(`Play ${playId} not found`);
  return { ...play.phases[0].pos };
}

export function rotKey(system: System, rotation: Rotation): string {
  return `${system}-${rotation}`;
}

// ═══════════════════════════════════════════════════════════════
// Rotation Layouts — who is front row vs back row per rotation
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
// Defense Positions (Complexity Aware)
// ═══════════════════════════════════════════════════════════════

export function generateDefensePositions(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard'
): PositionMap {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const schema = DEFENSE_SCHEMAS[defenseType];
  const pos = {} as PositionMap;

  const z4 = layout.front[0], z3 = layout.front[1], z2 = layout.front[2];
  const z5 = layout.back[0],  z6 = layout.back[1],  z1 = layout.back[2];

  pos[z4] = { ...schema.blockLeft }; pos[z3] = { ...schema.blockMid }; pos[z2] = { ...schema.blockRight };
  pos[z5] = { ...schema.digLeft }; pos[z6] = { ...schema.digMiddle }; pos[z1] = { ...schema.digRight };

  if (complexity === 'basic') return pos;

  let activeSetterId: PlayerId = 'S';
  if (system === '6-2') activeSetterId = layout.back.includes('S') ? 'S' : 'RS';
  else if (system === '4-2') activeSetterId = layout.front.includes('S') ? 'S' : 'RS';

  if (z4 === activeSetterId || z4 === 'OP') {
    pos[z4] = { ...schema.blockRight }; pos[z2] = { ...schema.blockLeft };
  } else if (z3 === activeSetterId || z3 === 'OP') {
    pos[z3] = { ...schema.blockRight }; pos[z2] = { ...schema.blockMid };
  }

  if (z5 === activeSetterId) {
    pos[z5] = { ...schema.digRight }; pos[z1] = { ...schema.digLeft };
  } else if (z6 === activeSetterId) {
    pos[z6] = { ...schema.digRight }; pos[z1] = { ...schema.digMiddle };
  }

  return pos;
}

export function generateBasePositions(system: System, rotation: Rotation): PositionMap {
  return generateDefensePositions(system, rotation, 'perimeter', 'standard');
}

const SERVERS: Record<Rotation, PlayerId> = { 1: 'S', 2: 'L', 3: 'RS', 4: 'RS', 5: 'RS', 6: 'RS' };

// ═══════════════════════════════════════════════════════════════
// Pre-Serve Positions (OUR team is serving)
// Fix: Advanced/Standard now pinch the middle to shorten transition
// sprints for crossed players (R3, R4, R5, R6).
// ═══════════════════════════════════════════════════════════════

function preServePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const pos = {} as PositionMap;

  const z4 = layout.front[0], z3 = layout.front[1], z2 = layout.front[2];
  const z5 = layout.back[0],  z6 = layout.back[1],  server = layout.back[2];

  pos[server] = xy(400, 805); // Server at baseline

  if (complexity === 'basic') {
    pos[z4] = xy(140, 330); pos[z3] = xy(270, 330); pos[z2] = xy(400, 330);
    pos[z5] = xy(140, 560); pos[z6] = xy(270, 560);
    return pos;
  }

  // Tightly stack the front row in the middle if they are crossed
  const gap = complexity === 'advanced' ? 30 : 45;
  const cL = 270 - gap;
  const cM = 270;
  const cR = 270 + gap;

  // R1 and R2 are natural (OH left, MB mid, OP right). No pinching needed.
  if (rotation === 1 || rotation === 2) {
    pos[z4] = xy(140, 330); pos[z3] = xy(270, 330); pos[z2] = xy(400, 330);
  } else {
    // R3, R4, R5, R6 are crossed. Pinch them tight to the middle.
    pos[z4] = xy(cL, 330); pos[z3] = xy(cM, 330); pos[z2] = xy(cR, 330);
  }

  // Back row stacking (non-servers)
  if (rotation === 1 || rotation === 2 || rotation === 3) {
    // The Z5 player (Setter or RS) has to run all the way to Z1 right-back. Pinch them!
    pos[z5] = xy(cL, 560); pos[z6] = xy(cM, 560);
  } else {
    // The Z5 player is OH, who wants to stay left. Natural spread.
    pos[z5] = xy(140, 560); pos[z6] = xy(270, 560);
  }

  return pos;
}

const N0: PhaseNotes = { S: '', OP: '', MB: '', OH: '', RS: '', L: '' };

function lerpXY(a: XY, b: XY, t: number): XY {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function lerpPositions(a: PositionMap, b: PositionMap, t: number): PositionMap {
  const result: PositionMap = {} as PositionMap;
  const ids: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];
  for (const pid of ids) {
    if (a[pid] && b[pid]) result[pid] = lerpXY(a[pid], b[pid], t);
    else result[pid] = a[pid] || b[pid];
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Serve Receive Stacks (Opponent serving)
// Fix: Highly optimized passing lane shifts for R3, R4, R6 to
// ensure hit-route distances are kept minimal.
// ═══════════════════════════════════════════════════════════════

function serveReceivePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const pos = {} as PositionMap;

  const z4 = layout.front[0], z3 = layout.front[1], z2 = layout.front[2];
  const z5 = layout.back[0],  z6 = layout.back[1],  z1 = layout.back[2];

  let activeSetterId: PlayerId = 'S';
  if (system === '6-2') activeSetterId = layout.back.includes('S') ? 'S' : 'RS';
  else if (system === '4-2') activeSetterId = layout.front.includes('S') ? 'S' : 'RS';

  let setterZone = 0;
  if (layout.back[2] === activeSetterId) setterZone = 1;
  else if (layout.back[1] === activeSetterId) setterZone = 6;
  else if (layout.back[0] === activeSetterId) setterZone = 5;
  else if (layout.front[0] === activeSetterId) setterZone = 4;
  else if (layout.front[1] === activeSetterId) setterZone = 3;
  else if (layout.front[2] === activeSetterId) setterZone = 2;

  if (complexity === 'basic') {
    pos[z4] = xy(140, 360); pos[z3] = xy(270, 360); pos[z2] = xy(400, 360);
    pos[z5] = xy(140, 560); pos[z6] = xy(270, 560); pos[z1] = xy(400, 560);
    if (setterZone === 1) pos[z1] = xy(400, 450);
    else if (setterZone === 6) pos[z6] = xy(270, 450);
    else if (setterZone === 5) pos[z5] = xy(140, 450);
    return pos;
  }

  const isAdv = complexity === 'advanced';
  const stackGap = isAdv ? 25 : 35; 
  const netY = 330;
  const passY = 580;

  if (setterZone === 1) {
    // R1: Natural spread
    pos[z2] = xy(420, netY);
    pos[z1] = xy(420, netY + stackGap); 
    pos[z3] = xy(280, netY);
    pos[z5] = xy(isAdv ? 180 : 160, passY); 
    pos[z6] = xy(isAdv ? 340 : 300, passY); 
    pos[z4] = xy(isAdv ? 90 : 110, 460); // OH Pulled back
  } else if (setterZone === 6) {
    // R2: Natural spread
    pos[z3] = xy(270, netY);
    pos[z6] = xy(270, netY + stackGap); 
    pos[z2] = xy(450, netY);
    pos[z5] = xy(150, passY);
    pos[z1] = xy(isAdv ? 390 : 400, passY);
    pos[z4] = xy(isAdv ? 90 : 110, 460); // OH Pulled back
  } else if (setterZone === 5) {
    // R3: CROSSED (OP left, OH right). 
    // Fix: Pinch OP/MB left. Shift passing lane right so OH has a shorter sprint to left antenna.
    pos[z4] = xy(120, netY); // OP pinched left
    pos[z5] = xy(120, netY + stackGap); 
    pos[z3] = xy(200, netY); // MB pinched left
    pos[z2] = xy(270, 480); // OH passes in middle
    pos[z6] = xy(360, passY); // L shifted right
    pos[z1] = xy(440, passY); // RS shifted right
  } else if (setterZone === 4) {
    // R4: CROSSED (S left, OP mid, MB right). 
    // Fix: Pinch front row left so S has shorter route to target.
    pos[z4] = xy(120, netY);
    pos[z3] = xy(200, netY);
    pos[z2] = xy(280, netY);
    pos[z5] = xy(160, passY); 
    pos[z6] = xy(300, passY); 
    pos[z1] = xy(420, passY);
  } else if (setterZone === 3) {
    // R5: S in middle
    pos[z3] = xy(270, netY); 
    pos[z4] = xy(180, netY); 
    pos[z2] = xy(360, netY);
    pos[z5] = xy(150, passY); 
    pos[z6] = xy(270, passY); 
    pos[z1] = xy(390, passY);
  } else if (setterZone === 2) {
    // R6: CROSSED (MB left, OP mid, S right).
    // Fix: Pinch front row right so S is basically at target.
    pos[z2] = xy(420, netY);
    pos[z3] = xy(340, netY);
    pos[z4] = xy(260, netY);
    pos[z5] = xy(150, passY); 
    pos[z6] = xy(270, passY); 
    pos[z1] = xy(390, passY);
  }

  return pos;
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Serve Phases (Reduced to exactly 2 Phases)
// Phase 1: Pre-Serve (Where we start)
// Phase 2: Base Defense (Where we end up)
// ═══════════════════════════════════════════════════════════════

export function buildServePhases(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard'
): Phase[] {
  const server = SERVERS[rotation];
  const layout = ROTATION_LAYOUTS[system][rotation];
  const preServe = preServePositions(system, rotation, complexity);
  const base = generateDefensePositions(system, rotation, defenseType, complexity);
  const isSetterFrontRow = layout.front.includes('S');

  const preServeNotes: PhaseNotes = {
    S: server === 'S' ? 'Serving.' : (isSetterFrontRow ? 'At net, ready to set.' : 'Back row.'),
    OP: layout.front.includes('OP') ? 'At net, blocking position.' : 'Back row.',
    MB: layout.front.includes('MB') ? 'At net, center.' : 'Back row.',
    OH: layout.front.includes('OH') ? 'At net, left side.' : 'Back row.',
    RS: server === 'RS' ? 'Serving.' : 'Back row.',
    L: server === 'L' ? 'Serving.' : 'Back row, defensive ready.',
  };

  const baseNotes: PhaseNotes = {
    S: isSetterFrontRow ? 'Right-front blocking.' : 'Z1 base (right-back) ready to defend.',
    OP: layout.front.includes('OP') ? 'Right antenna blocking.' : 'Back-row defense.',
    MB: layout.front.includes('MB') ? 'Center net.' : 'Back-row defense.',
    OH: layout.front.includes('OH') ? 'Left antenna blocking.' : 'Back-row defense.',
    RS: 'Base position.',
    L: 'Deep center base.',
  };

  // Clean 2-phase Serve
  return [
    { label: 'Pre-Serve', ball: { x: preServe[server].x, y: preServe[server].y }, pos: preServe, notes: preServeNotes },
    { label: 'Base Defense', ball: xy(270, 112), pos: base, notes: baseNotes },
  ];
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Receive Phases (5 phases - Precise Physics)
// 1. Receive: Ball at server
// 2. The Pass: Ball to Passer
// 3. The Set: Ball to Setter
// 4. OFFENSIVE PLAY: OVERLAY BLACKOUT. Players freeze in place.
// 5. Base Defense: Blackout lifts, sprint to base.
// ═══════════════════════════════════════════════════════════════

export function buildReceivePhases(
  system: System, 
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard'
): Phase[] {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const base = generateDefensePositions(system, rotation, defenseType, complexity);
  const srPos = serveReceivePositions(system, rotation, complexity);

  let activeSetterId: PlayerId = 'S';
  if (system === '6-2') activeSetterId = layout.back.includes('S') ? 'S' : 'RS';
  else if (system === '4-2') activeSetterId = layout.front.includes('S') ? 'S' : 'RS';

  const setterTarget = { ...SET_TGT }; 
  const ids: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];

  // Phase 2: The Pass (Ball hits passer)
  const passPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    if (pid === activeSetterId) {
      passPos[pid] = lerpXY(srPos[pid], setterTarget, 0.5); // Setter releases halfway
    } else if (layout.back.includes(pid)) {
      passPos[pid] = { ...srPos[pid] }; // Passers hold platform
    } else {
      passPos[pid] = lerpXY(srPos[pid], xy(srPos[pid].x, Math.max(srPos[pid].y, 380)), 0.3); // Hitters open up
    }
  }

  // Phase 3: The Set (Ball hits Setter at target)
  const setPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    if (pid === activeSetterId) {
      setPos[pid] = { ...setterTarget }; // Setter arrives
    } else if (layout.front.includes(pid)) {
      // Front row hitters open up into their hitting lanes
      const xPos = pid === layout.front[0] ? 88 : pid === layout.front[1] ? 270 : 452;
      setPos[pid] = xy(xPos, 380); 
    } else {
      // Back row steps up for coverage
      setPos[pid] = lerpXY(passPos[pid], xy(passPos[pid].x, 500), 0.5); 
    }
  }

  // Phase 4: OFFENSIVE PLAY (This triggers the dark UI overlay)
  const atkPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    atkPos[pid] = { ...setPos[pid] }; // FREEZE EXACTLY IN PLACE so there is zero movement behind the blackout text
  }

  const srNotes: PhaseNotes = { S: '', OP: '', MB: '', OH: '', RS: '', L: '' };
  const passNotes: PhaseNotes = { S: 'Releasing to target.', OP: '', MB: '', OH: '', RS: '', L: 'Passing ball to target.' };
  const setNotes: PhaseNotes = { S: 'Setting the offense.', OP: 'Ready to attack.', MB: 'Ready to attack.', OH: 'Ready to attack.', RS: 'Coverage.', L: 'Coverage.' };
  const atkNotes: PhaseNotes = { S: 'Ball is live.', OP: 'Ball is live.', MB: 'Ball is live.', OH: 'Ball is live.', RS: 'Ball is live.', L: 'Ball is live.' };

  // Perfect Ball Physics Path
  return [
    { label: 'Serve Receive', ball: xy(270, 100), pos: srPos, notes: srNotes },
    { label: 'The Pass', ball: xy(270, 560), pos: passPos, notes: passNotes },
    { label: 'The Set', ball: { ...setterTarget }, pos: setPos, notes: setNotes },
    { label: 'OFFENSIVE PLAY', ball: xy(270, 158), pos: atkPos, notes: atkNotes }, // Ball flies over net during overlay
    { label: 'Base Defense', ball: xy(270, 112), pos: base, notes: N0 }, // Finish at base
  ];
}

// ═══════════════════════════════════════════════════════════════
// Build factory defaults for each system
// ═══════════════════════════════════════════════════════════════

function build51Defaults(): RotationDefaults[] {
  const srMap: Record<number, string> = { 1: '51sr1', 2: '51sr2', 3: '51sr3', 4: '51sr4', 5: '51sr5', 6: '51sr6' };
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    return {
      system: '5-1' as System,
      rotation: rot,
      serveReceive: posFromPlay(srMap[rot]),
      baseDefense: generateDefensePositions('5-1', rot, 'perimeter', 'standard'),
      baseOffense: generateBasePositions('5-1', rot),
      servePhases: buildServePhases('5-1', rot, 'perimeter', 'standard'),
      receivePhases: buildReceivePhases('5-1', rot, 'perimeter', 'standard'),
    };
  });
}

function build62Defaults(): RotationDefaults[] {
  const srMap: Record<number, string | null> = { 1: '62sr1', 2: '62sr2', 3: null, 4: '62sr4', 5: null, 6: null };
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    return {
      system: '6-2' as System,
      rotation: rot,
      serveReceive: srMap[rot] ? posFromPlay(srMap[rot] as string) : posFromPlay('51sr' + rot),
      baseDefense: generateDefensePositions('6-2', rot, 'perimeter', 'standard'),
      baseOffense: generateBasePositions('6-2', rot),
      servePhases: buildServePhases('6-2', rot, 'perimeter', 'standard'),
      receivePhases: buildReceivePhases('6-2', rot, 'perimeter', 'standard'),
    };
  });
}

function build42Defaults(): RotationDefaults[] {
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    return {
      system: '4-2' as System,
      rotation: rot,
      serveReceive: posFromPlay('51sr' + rot),
      baseDefense: generateDefensePositions('4-2', rot, 'perimeter', 'standard'),
      baseOffense: generateBasePositions('4-2', rot),
      servePhases: buildServePhases('4-2', rot, 'perimeter', 'standard'),
      receivePhases: buildReceivePhases('4-2', rot, 'perimeter', 'standard'),
    };
  });
}

export const FACTORY_DEFAULTS: Record<string, RotationDefaults> = {};
[...build51Defaults(), ...build62Defaults(), ...build42Defaults()].forEach(rd => {
  FACTORY_DEFAULTS[rotKey(rd.system, rd.rotation)] = rd;
});