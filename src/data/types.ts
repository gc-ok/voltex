// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export type PlayerId = 'S' | 'OP' | 'MB' | 'OH' | 'RS' | 'L';

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

export interface PhaseNotes {
  S: string;
  OP: string;
  MB: string;
  OH: string;
  RS: string;
  L: string;
}

export type PositionMap = Record<PlayerId, XY>;

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
