'use client';

import React from 'react';
import { PR } from '@/data/constants';
import { PlayerDef } from '@/data/types';

interface PlayerTokenProps {
  player: PlayerDef;
  x: number;
  y: number;
  isAnimating: boolean;
  violated?: boolean;
}

function PlayerTokenInner({ player, x, y, isAnimating, violated = false }: PlayerTokenProps) {
  return (
    <g style={{ cursor: isAnimating ? 'default' : 'grab' }} data-hpid={player.id}>
      {/* Violation ring */}
      {violated && !isAnimating && (
        <circle cx={x} cy={y} r={PR + 9} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.8} />
      )}

      {/* Shadow */}
      <circle cx={x + 1.5} cy={y + 2} r={PR} fill="rgba(0,0,0,.35)" />

      {/* Main circle */}
      <circle
        cx={x} cy={y} r={PR}
        fill={player.color}
        stroke={violated ? '#ef4444' : 'rgba(255,255,255,.25)'}
        strokeWidth={violated ? 2 : 1.5}
      />

      {/* Inner ring */}
      <circle cx={x} cy={y} r={PR - 3} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={1} />

      {/* Label */}
      <text
        x={x} y={y + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight={900} fill="#000"
        fontFamily="'Barlow Condensed',sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {player.short}
      </text>

      {/* ID label below (static only) */}
      {!isAnimating && (
        <text
          x={x} y={y + PR + 13}
          textAnchor="middle" fontSize={9}
          fill={player.color + '80'}
          fontFamily="'Barlow Condensed',sans-serif"
          fontWeight={700}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {player.id}
        </text>
      )}
    </g>
  );
}

export const PlayerToken = React.memo(PlayerTokenInner, (prev, next) => {
  return prev.x === next.x && prev.y === next.y
    && prev.isAnimating === next.isAnimating
    && prev.violated === next.violated;
});
