'use client';

import React from 'react';
import { BR } from '@/data/constants';

interface BallTokenProps {
  x: number;
  y: number;
}

function BallTokenInner({ x, y }: BallTokenProps) {
  return (
    <>
      {/* Shadow */}
      <circle cx={x + 1.5} cy={y + 2} r={BR + 1} fill="rgba(0,0,0,.3)" />
      {/* Ball */}
      <circle cx={x} cy={y} r={BR} fill="#fef9c3" stroke="#d97706" strokeWidth={1.5} />
      {/* Seam lines */}
      <path
        d={`M${x - BR * 0.7},${y - 0.1 * BR} Q${x},${y - BR * 0.88} ${x + BR * 0.7},${y - 0.1 * BR}`}
        fill="none" stroke="#b45309" strokeWidth={1} opacity={0.65}
      />
      <path
        d={`M${x + 0.1 * BR},${y - BR * 0.7} Q${x + BR * 0.88},${y} ${x + 0.1 * BR},${y + BR * 0.7}`}
        fill="none" stroke="#b45309" strokeWidth={1} opacity={0.65}
      />
    </>
  );
}

export const BallToken = React.memo(BallTokenInner, (prev, next) => {
  return prev.x === next.x && prev.y === next.y;
});
