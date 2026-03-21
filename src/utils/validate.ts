import { PositionMap, PlayerId } from '@/data/types';

export interface Violation {
  ids: [PlayerId, PlayerId];
  msg: string;
}

export function validate(pos: PositionMap, label: string, cat: string): Violation[] {
  if (!label.includes('Serve Receive') || !cat.includes('Serve Receive')) return [];

  const errors: Violation[] = [];

  // Depth checks (front row must be in front of back row)
  const depthPairs: [PlayerId, PlayerId][] = [['MB', 'RS'], ['S', 'OP'], ['OH', 'L']];
  depthPairs.forEach(([f, b]) => {
    if (pos[f] && pos[b] && pos[f].y >= pos[b].y) {
      errors.push({ ids: [f, b], msg: `${f} not in front of ${b} (depth)` });
    }
  });

  // Lateral checks
  const lateralPairs: [PlayerId, PlayerId][] = [['OH', 'MB'], ['MB', 'S'], ['L', 'RS'], ['RS', 'OP']];
  lateralPairs.forEach(([l, r]) => {
    if (pos[l] && pos[r] && pos[l].x >= pos[r].x) {
      errors.push({ ids: [l, r], msg: `${l}/${r} lateral overlap` });
    }
  });

  return errors;
}
