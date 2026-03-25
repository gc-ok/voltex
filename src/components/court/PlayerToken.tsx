'use client';

import React from 'react';
import { PR } from '@/data/constants';

interface PlayerTokenProps {
  player: any; 
  x: number;
  y: number;
  isAnimating: boolean;
  violated: boolean;
  displayName?: string;
}

function PlayerTokenInner({ player, x, y, isAnimating, violated, displayName }: PlayerTokenProps) {
  const teamMatteColor = '#1e293b'; 
  const indicatorColor = player.color || '#d4af37'; 
  const bottomText = displayName || player.name || player.id;

  return (
    <g 
      style={{ 
        transform: `translate(${x}px, ${y}px)`, 
        cursor: 'grab', /* NEW: Shows the open hand "ready to grab" icon */
      }}
    >
      {/* Violation Aura */}
      {violated && (
        <circle r={PR + 6} fill="none" stroke="#ef4444" strokeWidth={3} opacity={0.8} />
      )}

      {/* Clean Drop Shadow for Depth */}
      <circle cx={0} cy={4} r={PR} fill="rgba(0,0,0,0.3)" />

      {/* Main Whiteboard Magnet Token */}
      <circle 
        r={PR} 
        fill={teamMatteColor} 
        stroke={violated ? '#ef4444' : indicatorColor} 
        strokeWidth={3} 
      />

      {/* 1. POSITION ROLE ALWAYS INSIDE */}
      <text 
        x={0} 
        y={1} 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fill="#f8fafc" 
        fontSize={14} 
        fontWeight={700}
        fontFamily="inherit"
        style={{ pointerEvents: 'none' }}
      >
        {player.id}
      </text>

      {/* 2. PLAYER NAME ALWAYS BENEATH */}
      <text 
        x={0} 
        y={PR + 16}
        textAnchor="middle" 
        fill="#f8fafc" 
        fontSize={13} 
        fontWeight={600}
        fontFamily="inherit"
        style={{ 
          pointerEvents: 'none',
          textShadow: '0px 1px 4px rgba(0,0,0,0.9), 0px 2px 8px rgba(0,0,0,0.7)' 
        }}
      >
        {bottomText}
      </text>
    </g>
  );
}

export const PlayerToken = React.memo(PlayerTokenInner, (prev, next) => {
  return (
    prev.x === next.x &&
    prev.y === next.y &&
    prev.isAnimating === next.isAnimating &&
    prev.violated === next.violated &&
    prev.displayName === next.displayName
  );
});