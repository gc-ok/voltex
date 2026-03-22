import { Play, Phase, PositionMap, PlayerId, XY } from '@/data/types';

const PLAYER_IDS: PlayerId[] = ['S', 'OP', 'MB', 'OH', 'RS', 'L'];

/**
 * Adapt a play so its first phase starts from the given base positions.
 * All subsequent phases preserve the original movement deltas.
 * Ball positions are shifted by the average player offset.
 */
export function adaptPlay(play: Play, basePositions: PositionMap): Play {
  if (play.phases.length === 0) return play;

  const origStart = play.phases[0].pos;

  // Compute per-player offset: base - original
  const offsets: Record<PlayerId, XY> = {} as Record<PlayerId, XY>;
  let avgDx = 0;
  let avgDy = 0;
  for (const pid of PLAYER_IDS) {
    const dx = basePositions[pid].x - origStart[pid].x;
    const dy = basePositions[pid].y - origStart[pid].y;
    offsets[pid] = { x: dx, y: dy };
    avgDx += dx;
    avgDy += dy;
  }
  avgDx /= PLAYER_IDS.length;
  avgDy /= PLAYER_IDS.length;

  // If offsets are negligible, return original play (no work needed)
  const totalOffset = Math.abs(avgDx) + Math.abs(avgDy);
  const maxPlayerOffset = Math.max(
    ...PLAYER_IDS.map(pid => Math.abs(offsets[pid].x) + Math.abs(offsets[pid].y))
  );
  if (maxPlayerOffset < 2) return play;

  // Apply offsets to all phases
  const adaptedPhases: Phase[] = play.phases.map((phase) => {
    const newPos: PositionMap = {} as PositionMap;
    for (const pid of PLAYER_IDS) {
      newPos[pid] = {
        x: phase.pos[pid].x + offsets[pid].x,
        y: phase.pos[pid].y + offsets[pid].y,
      };
    }
    const newBall: XY = {
      x: phase.ball.x + avgDx,
      y: phase.ball.y + avgDy,
    };
    return {
      ...phase,
      pos: newPos,
      ball: newBall,
    };
  });

  return {
    ...play,
    phases: adaptedPhases,
  };
}
