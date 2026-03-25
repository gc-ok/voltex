import { PositionMap, PlayerId, System, Rotation } from '@/data/types';

export interface Violation {
  ids: [PlayerId, PlayerId];
  msg: string;
}

// ═══════════════════════════════════════════════════════════════
// 1. GENERAL PLAYBOOK EDITOR VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validate(pos: PositionMap, label: string, cat: string): Violation[] {
  if (!label.toLowerCase().includes('serve receive') && !cat.toLowerCase().includes('serve receive')) return [];

  const errors: Violation[] = [];

  // General loose depth checks for the generic editor
  const depthPairs: [PlayerId, PlayerId][] = [['MB1', 'L'], ['S', 'OP'], ['OH1', 'OH2']];
  depthPairs.forEach(([f, b]) => {
    if (pos[f] && pos[b] && pos[f]!.y >= pos[b]!.y) {
      errors.push({ ids: [f, b], msg: `${f} not in front of ${b}` });
    }
  });

  return errors;
}

// ═══════════════════════════════════════════════════════════════
// 2. SETUP WIZARD STRICT ROTATION VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface RotationLayout {
  front: PlayerId[][];
  back: PlayerId[][];
}

// Define exact zones [Left, Middle, Right] using arrays of possible Player IDs.
// This ensures it works even when Libero (L) subs for a Middle (MB), etc.
// Front: [Zone 4 (LF), Zone 3 (MF), Zone 2 (RF)]
// Back:  [Zone 5 (LB), Zone 6 (MB), Zone 1 (RB)]
const LAYOUTS: Record<Rotation, RotationLayout> = {
  1: {
    front: [['OP', 'RS'], ['MB1'], ['OH1']],
    back: [['OH2', 'DS'], ['L', 'MB2'], ['S', 'S1']]
  },
  2: {
    front: [['OH2', 'DS'], ['OP', 'RS'], ['MB1']],
    back: [['L', 'MB2'], ['S', 'S1'], ['OH1']]
  },
  3: {
    front: [['MB2'], ['OH2', 'DS'], ['OP', 'RS']],
    back: [['S', 'S1'], ['OH1'], ['L', 'MB1']]
  },
  4: {
    front: [['S', 'S1'], ['MB2'], ['OH2', 'DS']],
    back: [['OH1'], ['L', 'MB1'], ['OP', 'RS']]
  },
  5: {
    front: [['OH1'], ['S', 'S1'], ['MB2']],
    back: [['L', 'MB1'], ['OP', 'RS'], ['OH2', 'DS']]
  },
  6: {
    front: [['MB1'], ['OH1'], ['S', 'S1']],
    back: [['OP', 'RS'], ['OH2', 'DS'], ['L', 'MB2']]
  },
};

export function validateRotation(pos: PositionMap, rotation: Rotation, isServing: boolean): Violation[] {
  const layout = LAYOUTS[rotation];
  if (!layout) return [];

  const errors: Violation[] = [];

  // Helper to find which player is currently filling a given zone
  const getActive = (options: PlayerId[]): PlayerId | null => {
    for (const id of options) {
      if (pos[id]) return id;
    }
    return null;
  };

  const f0 = getActive(layout.front[0]); // LF (Zone 4)
  const f1 = getActive(layout.front[1]); // MF (Zone 3)
  const f2 = getActive(layout.front[2]); // RF (Zone 2)

  const b0 = getActive(layout.back[0]);  // LB (Zone 5)
  const b1 = getActive(layout.back[1]);  // MB (Zone 6)
  const b2 = getActive(layout.back[2]);  // RB (Zone 1) - SERVER

  // Depth: Front row must be closer to the net (smaller Y value)
  const checkDepth = (f: PlayerId | null, b: PlayerId | null) => {
    if (f && b && pos[f] && pos[b]) {
      if (pos[f]!.y >= pos[b]!.y) {
        errors.push({ ids: [f, b], msg: `${f} must be in front of ${b}` });
      }
    }
  };

  // Lateral: Left player must be closer to the left sideline (smaller X value)
  const checkLateral = (l: PlayerId | null, r: PlayerId | null) => {
    if (l && r && pos[l] && pos[r]) {
      if (pos[l]!.x >= pos[r]!.x) {
        errors.push({ ids: [l, r], msg: `${l} must be to the left of ${r}` });
      }
    }
  };

  // --- 1. Apply Depth Checks (Columns) ---
  checkDepth(f0, b0); // LF vs LB
  checkDepth(f1, b1); // MF vs MB
  if (!isServing) {
    checkDepth(f2, b2); // RF vs RB (Skip if our RB is the server)
  }

  // --- 2. Apply Lateral Checks (Rows) ---
  // Front Row
  checkLateral(f0, f1); // LF vs MF
  checkLateral(f1, f2); // MF vs RF
  
  // Back Row
  checkLateral(b0, b1); // LB vs MB
  if (!isServing) {
    checkLateral(b1, b2); // MB vs RB (Skip if our RB is the server)
  }

  return errors;
}