import { Phase, XY, PlayerId, PositionMap } from '@/data/types';
import { PD } from '@/data/players';
import { ease } from './ease';

export interface LerpResult {
  pos: PositionMap;
  ball: XY;
}

export function lerp(prog: number, phases: Phase[]): LerpResult {
  const n = phases.length;
  if (n === 1) return { pos: { ...phases[0].pos }, ball: { ...phases[0].ball } };

  const seg = 100 / (n - 1);
  const fi = Math.min(n - 2, Math.floor(prog / seg));
  const t = ease((prog - fi * seg) / seg);
  const a = phases[fi];
  const b = phases[fi + 1];

  const pos = {} as PositionMap;
  PD.forEach(({ id }) => {
    if (a.pos[id] && b.pos[id]) {
      pos[id] = {
        x: a.pos[id].x + (b.pos[id].x - a.pos[id].x) * t,
        y: a.pos[id].y + (b.pos[id].y - a.pos[id].y) * t,
      };
    }
  });

  const ball: XY = {
    x: a.ball.x + (b.ball.x - a.ball.x) * t,
    y: a.ball.y + (b.ball.y - a.ball.y) * t,
  };

  return { pos, ball };
}

export function phIdxFromProg(prog: number, n: number): number {
  return n <= 1 ? 0 : Math.min(n - 1, Math.round(prog / (100 / (n - 1))));
}
