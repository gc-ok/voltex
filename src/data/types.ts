// src/data/types.ts

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
export type ReceiveTransition = 'switch-early' | 'switch-late'; // NEW TYPE

export interface RotationDefaults {
  system: System;
  rotation: Rotation;
  receiveTransition: ReceiveTransition; // NEW PROPERTY
  serveReceive: PositionMap;
  baseDefense: PositionMap;
  baseOffense: PositionMap;
  servePhases: Phase[];       // 3 phases: pre-serve → serve → base defense
  receivePhases: Phase[];     // 6 phases: serve receive → pass -> set -> attack -> transition → base defense
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

export type DefenseType = 'perimeter' | 'rotational' | 'man-up';

export interface RotationLayout {
  front: [PlayerId, PlayerId, PlayerId];
  back: [PlayerId, PlayerId, PlayerId]; 
}

export interface DefenseSchema {
  blockLeft: XY; blockMid: XY; blockRight: XY;
  digLeft: XY; digMiddle: XY; digRight: XY;
}

export interface StrategyProfile {
  id: string;
  name: string;
  createdAt: number;
  system: System;
  defenseType: DefenseType;
  rotationDefaults: Record<string, RotationDefaults>;
  coverageStrategy: CoverageStrategy;
}

export type AttackDirection = 'left' | 'center' | 'right';

export interface CoverageStrategy {
  blockerCount: 1 | 2;
  coverage: Record<AttackDirection, PositionMap>;
}