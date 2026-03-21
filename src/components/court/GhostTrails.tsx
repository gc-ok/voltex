'use client';

import React from 'react';
import { PD } from '@/data/players';
import { PositionMap } from '@/data/types';

interface GhostTrailsProps {
  trailData: PositionMap[];
}

function GhostTrailsInner({ trailData }: GhostTrailsProps) {
  if (trailData.length < 3) return null;

  return (
    <>
      {PD.map((pl) => {
        const pts = trailData.map(f => f[pl.id]).filter(Boolean);
        return pts.map((_, i) => {
          if (i === 0) return null;
          const op = ((i / pts.length) * 0.18).toFixed(3);
          return (
            <line
              key={`${pl.id}-${i}`}
              x1={pts[i - 1].x} y1={pts[i - 1].y}
              x2={pts[i].x} y2={pts[i].y}
              stroke={pl.color} strokeWidth={3}
              opacity={op} strokeLinecap="round"
            />
          );
        });
      })}
    </>
  );
}

export const GhostTrails = React.memo(GhostTrailsInner);
