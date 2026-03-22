'use client';

import React from 'react';
import { PD } from '@/data/players';
import { PlayerId } from '@/data/types';
import { useTeamStore } from '@/stores/useTeamStore';

interface PlayerTooltipProps {
  pid: PlayerId;
  x: number;
  y: number;
  note: string;
}

export function PlayerTooltip({ pid, x, y, note }: PlayerTooltipProps) {
  const playerNames = useTeamStore(s => s.playerNames);
  if (!note) return null;
  const pl = PD.find(p => p.id === pid);
  if (!pl) return null;
  const customName = playerNames[pid];
  const hasCustomName = customName && customName !== pl.short;

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
          fontSize: 12, fontWeight: 900, color: '#000',
          fontFamily: "'Barlow Condensed',sans-serif",
        }}>
          {pl.short}
        </div>
        <span style={{
          fontSize: 14, color: pl.color,
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 700,
        }}>
          {hasCustomName ? `${customName} — ${pl.role}` : pl.role}
        </span>
      </div>
      <div style={{
        fontSize: 13, color: '#ffffffcc',
        fontFamily: "'Barlow Condensed',sans-serif",
        lineHeight: 1.6,
      }}>
        {note}
      </div>
    </div>
  );
}
