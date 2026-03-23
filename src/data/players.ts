import { PlayerDef } from './types';

export const PD: PlayerDef[] = [
  { id: 'S',   role: 'Setter',           short: 'S',   color: '#fbbf24' },
  { id: 'OP',  role: 'Opposite',         short: 'OP',  color: '#f43f5e' },
  { id: 'OH1', role: 'Outside Hitter 1', short: 'OH1', color: '#22d3ee' }, // Cyan
  { id: 'OH2', role: 'Outside Hitter 2', short: 'OH2', color: '#0891b2' }, // Darker Cyan
  { id: 'MB1', role: 'Middle Blocker 1', short: 'MB1', color: '#a78bfa' }, // Purple
  { id: 'MB2', role: 'Middle Blocker 2', short: 'MB2', color: '#7c3aed' }, // Darker Purple
  { id: 'L',   role: 'Libero',           short: 'L',   color: '#fb923c' },
];