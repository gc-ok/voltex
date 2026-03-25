'use client';

import React from 'react';
import { BR } from '@/data/constants';

interface BallTokenProps {
  x: number;
  y: number;
}

function BallTokenInner({ x, y }: BallTokenProps) {
  // Unique IDs for gradients and clips based on coordinates so they don't clash
  const gradId = `ballGrad-${x}-${y}`;
  const clipId = `ballClip-${x}-${y}`;

  return (
    <>
      <defs>
        {/* Radial gradient gives the flat SVG a 3D spherical look */}
        <radialGradient id={gradId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        
        {/* Clip path ensures the seam lines never bleed outside the ball */}
        <clipPath id={clipId}>
          <circle cx={x} cy={y} r={BR} />
        </clipPath>
      </defs>

      {/* Drop shadow on the floor for depth */}
      <ellipse cx={x + 1} cy={y + BR} rx={BR} ry={BR * 0.4} fill="rgba(0,0,0,0.3)" />

      {/* The Ball Base */}
      <circle cx={x} cy={y} r={BR} fill={`url(#${gradId})`} />

      {/* The Seams (Classic 18-Panel Volleyball Design) */}
      <g clipPath={`url(#${clipId})`}>
        {/* Center horizontal band */}
        <path 
          d={`M ${x - BR} ${y - BR * 0.3} Q ${x} ${y - BR * 0.1} ${x + BR} ${y - BR * 0.3}`} 
          fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} 
        />
        <path 
          d={`M ${x - BR} ${y + BR * 0.3} Q ${x} ${y + BR * 0.1} ${x + BR} ${y +  BR * 0.3}`} 
          fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} 
        />

        {/* Top panel vertical seams */}
        <path 
          d={`M ${x - BR * 0.4} ${y - BR} Q ${x - BR * 0.3} ${y - BR * 0.6} ${x - BR * 0.4} ${y - BR * 0.25}`} 
          fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} 
        />
        <path 
          d={`M ${x + BR * 0.4} ${y - BR} Q ${x + BR * 0.3} ${y - BR * 0.6} ${x + BR * 0.4} ${y - BR * 0.25}`} 
          fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} 
        />

        {/* Bottom panel vertical seams */}
        <path 
          d={`M ${x - BR * 0.4} ${y + BR} Q ${x - BR * 0.3} ${y + BR * 0.6} ${x - BR * 0.4} ${y + BR * 0.25}`} 
          fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} 
        />
        <path 
          d={`M ${x + BR * 0.4} ${y + BR} Q ${x + BR * 0.3} ${y + BR * 0.6} ${x + BR * 0.4} ${y + BR * 0.25}`} 
          fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} 
        />
      </g>

      {/* Outer border to give the ball a crisp edge */}
      <circle cx={x} cy={y} r={BR} fill="none" stroke="#64748b" strokeWidth={1} opacity={0.6} />
    </>
  );
}

export const BallToken = React.memo(BallTokenInner, (prev, next) => {
  return prev.x === next.x && prev.y === next.y;
});