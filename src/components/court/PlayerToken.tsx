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
  displayName?: string;
}

function PlayerTokenInner({ player, x, y, isAnimating, violated = false, displayName }: PlayerTokenProps) {
  const label = displayName || player.short;
  const labelSize = label.length > 3 ? 12 : label.length > 2 ? 15 : 19;

  return (
    <g style={{ cursor: isAnimating ? 'default' : 'grab' }} data-hpid={player.id}>
      {/* Violation ring */}
      {violated && !isAnimating && (
        <circle cx={x} cy={y} r={PR + 9} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.8} />
      )}

      {/* Shadow */}
      <circle cx={x + 2} cy={y + 3} r={PR} fill="rgba(0,0,0,.4)" />

      {/* Main circle */}
      <circle
        cx={x} cy={y} r={PR}
        fill={player.color}
        stroke={violated ? '#ef4444' : 'rgba(255,255,255,.3)'}
        strokeWidth={violated ? 2.5 : 2}
      />

      {/* Inner ring */}
      <circle cx={x} cy={y} r={PR - 4} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={1} />

      {/* Label inside circle */}
      <text
        x={x} y={y + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={labelSize} fontWeight={900} fill="#000"
        fontFamily="'Barlow Condensed',sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>

      {/* Role label below (static only) */}
      {!isAnimating && (
        <text
          x={x} y={y + PR + 16}
          textAnchor="middle" fontSize={16}
          fill="#ffffffcc"
          fontFamily="'Barlow Condensed',sans-serif"
          fontWeight={700}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {player.role}
        </text>
      )}
    </g>
  );
}

export const PlayerToken = React.memo(PlayerTokenInner, (prev, next) => {
  return prev.x === next.x && prev.y === next.y
    && prev.isAnimating === next.isAnimating
    && prev.violated === next.violated
    && prev.displayName === next.displayName;
});
