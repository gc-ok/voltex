'use client';

import React from 'react';
import { PD } from '@/data/players';
import { PlayerId } from '@/data/types';

interface PlayerTooltipProps {
  pid: PlayerId;
  x: number;
  y: number;
  note: string;
}

export function PlayerTooltip({ pid, x, y, note }: PlayerTooltipProps) {
  if (!note) return null;
  const pl = PD.find(p => p.id === pid);
  if (!pl) return null;

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      background: '#0a1428',
      border: `1px solid ${pl.color}50`,
      borderRadius: 10,
      padding: '10px 13px',
      pointerEvents: 'none',
      zIndex: 200,
      maxWidth: 220,
      boxShadow: '0 8px 32px rgba(0,0,0,.8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: pl.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color: '#000',
          fontFamily: "'Barlow Condensed',sans-serif",
        }}>
          {pl.short}
        </div>
        <span style={{
          fontSize: 13, color: pl.color,
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 700,
        }}>
          {pl.role}
        </span>
      </div>
      <div style={{
        fontSize: 12, color: '#ffffffb0',
        fontFamily: "'Barlow Condensed',sans-serif",
        lineHeight: 1.6,
      }}>
        {note}
      </div>
    </div>
  );
}
