'use client';

import React from 'react';
import { BR } from '@/data/constants';

interface BallTokenProps {
  x: number;
  y: number;
  isDraggable?: boolean;
  isDragging?: boolean;
}

export function BallToken({ x, y, isDraggable = false, isDragging = false }: BallTokenProps) {
  const gradId = `ballGrad-${x}-${y}`;
  const clipId = `ballClip-${x}-${y}`;

  return (
    <g style={{ 
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        transition: 'cursor 0.1s' 
    }}>
      <defs>
        <radialGradient id={gradId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={x} cy={y} r={BR} />
        </clipPath>
      </defs>

      <ellipse cx={x + 1} cy={y + BR} rx={BR} ry={BR * 0.4} fill="rgba(0,0,0,0.3)" />
      <circle cx={x} cy={y} r={BR} fill={`url(#${gradId})`} />

      <g clipPath={`url(#${clipId})`}>
        <path d={`M ${x - BR} ${y - BR * 0.3} Q ${x} ${y - BR * 0.1} ${x + BR} ${y - BR * 0.3}`} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
        <path d={`M ${x - BR} ${y + BR * 0.3} Q ${x} ${y + BR * 0.1} ${x + BR} ${y +  BR * 0.3}`} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
        <path d={`M ${x - BR * 0.4} ${y - BR} Q ${x - BR * 0.3} ${y - BR * 0.6} ${x - BR * 0.4} ${y - BR * 0.25}`} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
        <path d={`M ${x + BR * 0.4} ${y - BR} Q ${x + BR * 0.3} ${y - BR * 0.6} ${x + BR * 0.4} ${y - BR * 0.25}`} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
        <path d={`M ${x - BR * 0.4} ${y + BR} Q ${x - BR * 0.3} ${y + BR * 0.6} ${x - BR * 0.4} ${y + BR * 0.25}`} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
        <path d={`M ${x + BR * 0.4} ${y + BR} Q ${x + BR * 0.3} ${y + BR * 0.6} ${x + BR * 0.4} ${y + BR * 0.25}`} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
      </g>

      <circle cx={x} cy={y} r={BR} fill="none" stroke="#64748b" strokeWidth={1} opacity={0.6} />
      
      {/* Invisible hit box to make it easier to grab the ball */}
      <circle cx={x} cy={y} r={BR + 10} fill="transparent" />
    </g>
  );
}