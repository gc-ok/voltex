// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export type PlayerId = 'S' | 'S1' | 'S2' | 'OP' | 'RS' | 'MB1' | 'MB2' | 'OH1' | 'OH2' | 'L' | 'DS' | (string & {});

export interface XY {
  x: number;
  y: number;
}

export interface PlayerDef {
  id: PlayerId;
  role: string;
  short: string;
  color: string;
}

export type PositionMap = Partial<Record<string, XY>>;

export type PhaseNotes = Partial<Record<string, string>>;

export interface Phase {
  label: string;
  ball: XY;
  pos: PositionMap;
  notes: PhaseNotes;
}

export interface Play {
  id: string;
  cat: string;
  name: string;
  desc: string;
  phases: Phase[];
}

export interface QuizQuestion {
  pid: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

// ═══════════════════════════════════════════════════════════════
// Team & Rally Types
// ═══════════════════════════════════════════════════════════════

export type System = '5-1' | '6-2' | '4-2';
export type Rotation = 1 | 2 | 3 | 4 | 5 | 6;
export type FormationContext = 'serveReceive' | 'baseDefense' | 'baseOffense';
export type ComplexityLevel = 'basic' | 'standard' | 'advanced';

export interface RotationDefaults {
  system: System;
  rotation: Rotation;
  serveReceive: PositionMap;
  baseDefense: PositionMap;
  baseOffense: PositionMap;
  servePhases: Phase[];       // 3 phases: pre-serve → serve → base defense
  receivePhases: Phase[];     // 3 phases: serve receive → transition → base defense
}

export interface RallyStep {
  playId: string;
}

export interface Rally {
  id: string;
  name: string;
  desc: string;
  steps: RallyStep[];
}

export interface TeamPlay extends Play {
  sourceId: string;
  isCustomized: boolean;
}

// Defense Types
export type DefenseType = 'perimeter' | 'rotational' | 'man-up';

// Rotation-Aware Defense
export interface RotationLayout {
  front: [PlayerId, PlayerId, PlayerId]; // [Z4 left, Z3 mid, Z2 right]
  back: [PlayerId, PlayerId, PlayerId];  // [Z5 left, Z6 mid, Z1 right]
}

export interface DefenseSchema {
  blockLeft: XY;
  blockMid: XY;
  blockRight: XY;
  digLeft: XY;
  digMiddle: XY;
  digRight: XY;
}

// Strategy Profiles
export interface StrategyProfile {
  id: string;
  name: string;
  createdAt: number;
  system: System;
  defenseType: DefenseType;
  rotationDefaults: Record<string, RotationDefaults>;
  coverageStrategy: CoverageStrategy;
}

// Coverage Strategies
export type AttackDirection = 'left' | 'center' | 'right';

export interface CoverageStrategy {
  blockerCount: 1 | 2;
  coverage: Record<AttackDirection, PositionMap>;
}