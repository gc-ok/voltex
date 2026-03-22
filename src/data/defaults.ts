import { RotationDefaults, System, Rotation, PositionMap, DefenseType, RotationLayout, DefenseSchema, PlayerId, Phase, PhaseNotes, XY, ComplexityLevel } from './types';
import { PLAYS } from './plays';
import { FR_L, FR_M, FR_R, DC_L, DC_M, DC_R, MC_L, SET_TGT, xy } from './constants';

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
// Helpers
// ═══════════════════════════════════════════════════════════════

// Determines exactly who the active setter is based on system rules
function getActiveSetter(system: System, layout: RotationLayout): PlayerId {
  if (system === '5-1') return 'S';
  if (system === '6-2') return layout.back.includes('S') ? 'S' : 'RS'; // 6-2 setter always back row
  if (system === '4-2') {
    // 4-2 setter always front row
    if (layout.front.includes('S')) return 'S';
    if (layout.front.includes('RS')) return 'RS';
    if (layout.front.includes('OP')) return 'OP';
    return layout.front[0];
  }
  return 'S';
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
// Base Defense Positions
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

  const activeSetterId = getActiveSetter(system, layout);

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
// PRE-SERVE POSITIONS (Our team serves)
// Fully populated defaults for all 3 Systems.
// ═══════════════════════════════════════════════════════════════

function preServePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const isAdv = complexity === 'advanced';
  
  // ─── 5-1 SYSTEM ────────────────────────────────────────────────────────
  if (system === '5-1') {
    if (complexity === 'standard' || complexity === 'advanced') {
      switch (rotation) {
      // R1: S is Server. Front is naturally aligned. L and RS start on base.
      case 1: return { S: xy(400, 805), OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(140, 580), L: xy(270, 620) };
      
      // R2: L is Server. S is Z6, must stay left of Server and right of RS(Z5). Cheats right.
      case 2: return { L: xy(400, 805), OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(140, 580), S: xy(360, 580) };
      
      // R3: RS is Server. Front row crossed (OP wants Right, OH wants Left). Pinched middle legally.
      // S is Z5, wants Right. Pinches right but stays legally left of L(Z6).
      case 3: return { RS: xy(400, 805), OH: xy(320, 330), MB: xy(270, 330), OP: xy(220, 330), S: xy(240, 580), L: xy(270, 620) };
      
      // R4: RS is Server. Front row crossed (S wants Right, OP wants Left). Pinched middle legally.
      case 4: return { RS: xy(400, 805), MB: xy(320, 330), OP: xy(270, 330), S: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
      
      // R5: RS is Server. Front row crossed (MB wants Mid, S wants Right). Pinched middle legally.
      case 5: return { RS: xy(400, 805), OP: xy(320, 330), S: xy(270, 330), MB: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
      
      // R6: RS is Server. MB and OP pinched mid-left legally. S is naturally Right.
      case 6: return { RS: xy(400, 805), S: xy(420, 330), OP: xy(270, 330), MB: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
    }
    } 
    else if (complexity === 'basic') {
      switch (rotation) {
      // R1: S is Server. Front is naturally aligned. L and RS start on base.
      case 1: return { S: xy(400, 805), OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(140, 580), L: xy(270, 620) };
      
      // R2: L is Server. S is Z6, must stay left of Server and right of RS(Z5). Cheats right.
      case 2: return { L: xy(400, 805), OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(140, 580), S: xy(360, 580) };
      
      // R3: RS is Server. Front row crossed (OP wants Right, OH wants Left). Pinched middle legally.
      // S is Z5, wants Right. Pinches right but stays legally left of L(Z6).
      case 3: return { RS: xy(400, 805), OH: xy(320, 330), MB: xy(270, 330), OP: xy(220, 330), S: xy(240, 580), L: xy(270, 620) };
      
      // R4: RS is Server. Front row crossed (S wants Right, OP wants Left). Pinched middle legally.
      case 4: return { RS: xy(400, 805), MB: xy(320, 330), OP: xy(270, 330), S: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
      
      // R5: RS is Server. Front row crossed (MB wants Mid, S wants Right). Pinched middle legally.
      case 5: return { RS: xy(400, 805), OP: xy(320, 330), S: xy(270, 330), MB: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
      
      // R6: RS is Server. MB and OP pinched mid-left legally. S is naturally Right.
      case 6: return { RS: xy(400, 805), S: xy(420, 330), OP: xy(270, 330), MB: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
    }
    }
  }

  // ─── 6-2 SYSTEM ────────────────────────────────────────────────────────
  if (system === '6-2') {
    if (complexity === 'standard' || complexity === 'advanced') {
      switch (rotation) {
      // R1: S is Server. Front is naturally aligned. L and RS start on base.
      case 1: return { S: xy(400, 805), OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(140, 580), L: xy(270, 620) };
      
      // R2: L is Server. S is Z6, must stay left of Server and right of RS(Z5). Cheats right.
      case 2: return { L: xy(400, 805), OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(140, 580), S: xy(360, 580) };
      
      // R3: RS is Server. Front row crossed (OP wants Right, OH wants Left). Pinched middle legally.
      // S is Z5, wants Right. Pinches right but stays legally left of L(Z6).
      case 3: return { RS: xy(400, 805), OH: xy(320, 330), MB: xy(270, 330), OP: xy(220, 330), S: xy(240, 580), L: xy(270, 620) };
      
      // R4: RS is Server. Front row crossed (S wants Right, OP wants Left). Pinched middle legally.
      case 4: return { RS: xy(400, 805), MB: xy(320, 330), OP: xy(270, 330), S: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
      
      // R5: RS is Server. Front row crossed (MB wants Mid, S wants Right). Pinched middle legally.
      case 5: return { RS: xy(400, 805), OP: xy(320, 330), S: xy(270, 330), MB: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
      
      // R6: RS is Server. MB and OP pinched mid-left legally. S is naturally Right.
      case 6: return { RS: xy(400, 805), S: xy(420, 330), OP: xy(270, 330), MB: xy(220, 330), OH: xy(140, 580), L: xy(270, 620) };
    }
    }
    // Basic follows 5-1 spread
    return preServePositions('5-1', rotation, 'basic');
  }

  // ─── 4-2 SYSTEM ────────────────────────────────────────────────────────
  if (system === '4-2') {
    if (complexity === 'standard' || complexity === 'advanced') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        case 1: return { S: xy(400, 805), OP: xy(400, 330), MB: xy(270, 330), OH: xy(140, 330), RS: xy(140, 560), L: xy(270, 560) };
        case 2: return { L: xy(400, 805), OP: xy(400, 330), MB: xy(270, 330), OH: xy(140, 330), RS: xy(140, 560), S: xy(270, 560) };
        case 3: return { RS: xy(400, 805), OP: xy(isAdv ? 240 : 225, 330), MB: xy(270, 330), OH: xy(isAdv ? 300 : 315, 330), S: xy(isAdv ? 240 : 225, 560), L: xy(270, 560) };
        case 4: return { RS: xy(400, 805), S: xy(isAdv ? 240 : 225, 330), OP: xy(270, 330), MB: xy(isAdv ? 300 : 315, 330), OH: xy(140, 560), L: xy(270, 560) };
        case 5: return { RS: xy(400, 805), MB: xy(isAdv ? 240 : 225, 330), S: xy(270, 330), OP: xy(isAdv ? 300 : 315, 330), OH: xy(140, 560), L: xy(270, 560) };
        case 6: return { RS: xy(400, 805), MB: xy(isAdv ? 240 : 225, 330), OP: xy(270, 330), S: xy(isAdv ? 300 : 315, 330), OH: xy(140, 560), L: xy(270, 560) };
      }
    }
    return preServePositions('5-1', rotation, 'basic');
  }

  // Absolute fallback
  return posFromPlay('51sr1');
}

// ═══════════════════════════════════════════════════════════════
// SERVE RECEIVE POSITIONS (Opponent serves)
// Fully populated defaults for all 3 Systems.
// ═══════════════════════════════════════════════════════════════

function serveReceivePositions(system: System, rotation: Rotation, complexity: ComplexityLevel = 'standard'): PositionMap {
  const isAdv = complexity === 'advanced';

  // ─── 5-1 SYSTEM ────────────────────────────────────────────────────────
  if (system === '5-1') {
    if (complexity === 'standard') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        case 1: return { S: xy(420, 365), OP: xy(420, 330), MB: xy(280, 330), OH: xy(110, 460), RS: xy(160, 580), L: xy(300, 580) };
        case 2: return { S: xy(270, 365), OP: xy(450, 330), MB: xy(270, 330), OH: xy(110, 460), RS: xy(150, 580), L: xy(400, 580) };
        case 3: return { S: xy(120, 365), OP: xy(120, 330), MB: xy(200, 330), OH: xy(270, 480), RS: xy(440, 580), L: xy(360, 580) };
        case 4: return { S: xy(120, 330), OP: xy(200, 330), MB: xy(280, 330), OH: xy(160, 580), RS: xy(420, 580), L: xy(300, 580) };
        case 5: return { S: xy(270, 330), OP: xy(360, 330), MB: xy(180, 330), OH: xy(150, 580), RS: xy(390, 580), L: xy(270, 580) };
        case 6: return { S: xy(420, 330), OP: xy(340, 330), MB: xy(260, 330), OH: xy(150, 580), RS: xy(390, 580), L: xy(270, 580) };
      }
    } 
    else if (complexity === 'advanced') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        case 1: return { S: xy(420, 355), OP: xy(420, 330), MB: xy(280, 330), OH: xy(90, 460), RS: xy(180, 580), L: xy(340, 580) };
        case 2: return { S: xy(270, 355), OP: xy(450, 330), MB: xy(270, 330), OH: xy(90, 460), RS: xy(150, 580), L: xy(390, 580) };
        case 3: return { S: xy(120, 355), OP: xy(120, 330), MB: xy(200, 330), OH: xy(270, 480), RS: xy(440, 580), L: xy(360, 580) };
        case 4: return { S: xy(120, 330), OP: xy(200, 330), MB: xy(280, 330), OH: xy(160, 580), RS: xy(420, 580), L: xy(300, 580) };
        case 5: return { S: xy(270, 330), OP: xy(360, 330), MB: xy(180, 330), OH: xy(150, 580), RS: xy(390, 580), L: xy(270, 580) };
        case 6: return { S: xy(420, 330), OP: xy(340, 330), MB: xy(260, 330), OH: xy(150, 580), RS: xy(390, 580), L: xy(270, 580) };
      }
    }
    else if (complexity === 'basic') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        case 1: return { S: xy(400, 450), OP: xy(400, 360), MB: xy(270, 360), OH: xy(140, 360), RS: xy(140, 560), L: xy(270, 560) };
        case 2: return { S: xy(270, 450), OP: xy(400, 360), MB: xy(270, 360), OH: xy(140, 360), RS: xy(140, 560), L: xy(400, 560) };
        case 3: return { S: xy(140, 450), OP: xy(140, 360), MB: xy(270, 360), OH: xy(400, 360), RS: xy(400, 560), L: xy(270, 560) };
        case 4: return { S: xy(140, 360), OP: xy(270, 360), MB: xy(400, 360), OH: xy(140, 560), RS: xy(400, 560), L: xy(270, 560) };
        case 5: return { S: xy(270, 360), OP: xy(400, 360), MB: xy(140, 360), OH: xy(140, 560), RS: xy(400, 560), L: xy(270, 560) };
        case 6: return { S: xy(400, 360), OP: xy(270, 360), MB: xy(140, 360), OH: xy(140, 560), RS: xy(400, 560), L: xy(270, 560) };
      }
    }
  }

  // ─── 6-2 SYSTEM ────────────────────────────────────────────────────────
  if (system === '6-2') {
    if (complexity === 'standard') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        case 1: return { S: xy(420, 365), OP: xy(420, 330), MB: xy(280, 330), OH: xy(110, 460), RS: xy(160, 580), L: xy(300, 580) };
        case 2: return { S: xy(270, 365), OP: xy(450, 330), MB: xy(270, 330), OH: xy(110, 460), RS: xy(150, 580), L: xy(400, 580) };
        case 3: return { S: xy(120, 365), OP: xy(120, 330), MB: xy(200, 330), OH: xy(270, 480), RS: xy(440, 580), L: xy(360, 580) };
        // RS is back row setting now
        case 4: return { RS: xy(420, 365), MB: xy(420, 330), OP: xy(280, 330), S: xy(110, 460), OH: xy(160, 580), L: xy(300, 580) };
        case 5: return { RS: xy(270, 365), S: xy(270, 330), OP: xy(450, 330), MB: xy(110, 460), OH: xy(150, 580), L: xy(400, 580) };
        case 6: return { RS: xy(120, 365), MB: xy(120, 330), OP: xy(200, 330), S: xy(270, 480), L: xy(360, 580), OH: xy(440, 580) };
      }
    }
    else if (complexity === 'advanced') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        case 1: return { S: xy(420, 355), OP: xy(420, 330), MB: xy(280, 330), OH: xy(90, 460), RS: xy(180, 580), L: xy(340, 580) };
        case 2: return { S: xy(270, 355), OP: xy(450, 330), MB: xy(270, 330), OH: xy(90, 460), RS: xy(150, 580), L: xy(390, 580) };
        case 3: return { S: xy(120, 355), OP: xy(120, 330), MB: xy(200, 330), OH: xy(270, 480), RS: xy(440, 580), L: xy(360, 580) };
        case 4: return { RS: xy(420, 355), MB: xy(420, 330), OP: xy(280, 330), S: xy(90, 460), OH: xy(180, 580), L: xy(340, 580) };
        case 5: return { RS: xy(270, 355), S: xy(270, 330), OP: xy(450, 330), MB: xy(90, 460), OH: xy(150, 580), L: xy(390, 580) };
        case 6: return { RS: xy(120, 355), MB: xy(120, 330), OP: xy(200, 330), S: xy(270, 480), L: xy(360, 580), OH: xy(440, 580) };
      }
    }
    // Basic follows 5-1 spread
    return serveReceivePositions('5-1', rotation, 'basic');
  }

  // ─── 4-2 SYSTEM ────────────────────────────────────────────────────────
  if (system === '4-2') {
    if (complexity === 'standard' || complexity === 'advanced') {
      switch (rotation) {
        // ⬇️ DEV EXPORT PASTE HERE ⬇️
        // Setter is front row. Flat formation, no complex stacking needed.
        case 1: return { OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(120, 580), L: xy(270, 580), S: xy(420, 580) };
        case 2: return { OP: xy(420, 330), MB: xy(270, 330), OH: xy(120, 330), RS: xy(120, 580), S: xy(270, 580), L: xy(420, 580) };
        case 3: return { OP: xy(150, 330), MB: xy(300, 330), OH: xy(420, 330), S: xy(120, 580), L: xy(270, 580), RS: xy(420, 580) };
        case 4: return { S: xy(150, 330), OP: xy(300, 330), MB: xy(420, 330), OH: xy(120, 580), L: xy(270, 580), RS: xy(420, 580) };
        case 5: return { MB: xy(120, 330), S: xy(270, 330), OP: xy(420, 330), OH: xy(120, 580), L: xy(270, 580), RS: xy(420, 580) };
        case 6: return { MB: xy(120, 330), OP: xy(270, 330), S: xy(420, 330), OH: xy(120, 580), L: xy(270, 580), RS: xy(420, 580) };
      }
    }
    // Basic follows 4-2 spread
    return serveReceivePositions('4-2', rotation, 'standard');
  }

  // Absolute fallback
  return posFromPlay('51sr1');
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Serve Phases (2 Phases)
// ═══════════════════════════════════════════════════════════════

export function buildServePhases(
  system: System,
  rotation: Rotation,
  defenseType: DefenseType = 'perimeter',
  complexity: ComplexityLevel = 'standard'
): Phase[] {
  const layout = ROTATION_LAYOUTS[system][rotation];
  const server = layout.back[2]; 
  const preServe = preServePositions(system, rotation, complexity);
  const base = generateDefensePositions(system, rotation, defenseType, complexity);
  
  const activeSetterId = getActiveSetter(system, layout);
  const isSetterFrontRow = layout.front.includes(activeSetterId);

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

  return [
    { label: 'Pre-Serve', ball: { x: preServe[server]?.x || 400, y: preServe[server]?.y || 805 }, pos: preServe, notes: preServeNotes },
    { label: 'Base Defense', ball: xy(270, 112), pos: base, notes: baseNotes },
  ];
}

// ═══════════════════════════════════════════════════════════════
// Phase Generation — Receive Phases (5 phases - Precise Physics)
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

  const activeSetterId = getActiveSetter(system, layout);
  const setterTarget = { ...SET_TGT }; 
  const ids: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];

  // Phase 2: The Pass
  const passPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    if (pid === activeSetterId) {
      passPos[pid] = lerpXY(srPos[pid], setterTarget, 0.5); 
    } else if (layout.back.includes(pid)) {
      passPos[pid] = { ...srPos[pid] }; 
    } else {
      passPos[pid] = lerpXY(srPos[pid], xy(srPos[pid].x, Math.max(srPos[pid].y, 380)), 0.3); 
    }
  }

  // Phase 3: The Set
  const setPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    if (pid === activeSetterId) {
      setPos[pid] = { ...setterTarget }; 
    } else if (layout.front.includes(pid)) {
      const xPos = pid === layout.front[0] ? 88 : pid === layout.front[1] ? 270 : 452;
      setPos[pid] = xy(xPos, 380); 
    } else {
      setPos[pid] = lerpXY(passPos[pid], xy(passPos[pid].x, 500), 0.5); 
    }
  }

  // Phase 4: OFFENSIVE PLAY (Overlay triggers, players freeze)
  const atkPos: PositionMap = {} as PositionMap;
  for (const pid of ids) {
    atkPos[pid] = { ...setPos[pid] }; 
  }

  const srNotes: PhaseNotes = { S: '', OP: '', MB: '', OH: '', RS: '', L: '' };
  const passNotes: PhaseNotes = { S: 'Releasing to target.', OP: '', MB: '', OH: '', RS: '', L: 'Passing ball to target.' };
  const setNotes: PhaseNotes = { S: 'Setting the offense.', OP: 'Ready to attack.', MB: 'Ready to attack.', OH: 'Ready to attack.', RS: 'Coverage.', L: 'Coverage.' };
  const atkNotes: PhaseNotes = { S: 'Ball is live.', OP: 'Ball is live.', MB: 'Ball is live.', OH: 'Ball is live.', RS: 'Ball is live.', L: 'Ball is live.' };

  return [
    { label: 'Serve Receive', ball: xy(270, 100), pos: srPos, notes: srNotes },
    { label: 'The Pass', ball: xy(270, 560), pos: passPos, notes: passNotes },
    { label: 'The Set', ball: { ...setterTarget }, pos: setPos, notes: setNotes },
    { label: 'OFFENSIVE PLAY', ball: xy(270, 158), pos: atkPos, notes: atkNotes }, 
    { label: 'Base Defense', ball: xy(270, 112), pos: base, notes: N0 }, 
  ];
}

// ═══════════════════════════════════════════════════════════════
// Build factory defaults for each system
// ═══════════════════════════════════════════════════════════════

function build51Defaults(): RotationDefaults[] {
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    return {
      system: '5-1' as System,
      rotation: rot,
      serveReceive: serveReceivePositions('5-1', rot, 'standard'),
      baseDefense: generateDefensePositions('5-1', rot, 'perimeter', 'standard'),
      baseOffense: generateBasePositions('5-1', rot),
      servePhases: buildServePhases('5-1', rot, 'perimeter', 'standard'),
      receivePhases: buildReceivePhases('5-1', rot, 'perimeter', 'standard'),
    };
  });
}

function build62Defaults(): RotationDefaults[] {
  return ([1, 2, 3, 4, 5, 6] as Rotation[]).map(rot => {
    return {
      system: '6-2' as System,
      rotation: rot,
      serveReceive: serveReceivePositions('6-2', rot, 'standard'),
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
      serveReceive: serveReceivePositions('4-2', rot, 'standard'),
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