'use client';

import React from 'react';
import { usePlaybookStore, getPlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { phIdxFromProg } from '@/utils/lerp';

export function BottomTimeline() {
  const tab = usePlaybookStore(s => s.tab);
  const pid = usePlaybookStore(s => s.pid);
  const prog = useAnimationStore(s => s.prog);
  const playing = useAnimationStore(s => s.playing);
  const setProg = useAnimationStore(s => s.setProg);

  if (tab !== 'main' || (!playing && prog === 0)) return null;

  const play = getPlay(pid);
  const n = play.phases.length;
  const currentLabel = play.phases[phIdxFromProg(prog, n)]?.label?.toUpperCase() || '';

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProg(Number(e.target.value));
  };

  return (
    <div style={{
      height: 36,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      background: 'var(--bg-panel)',
      borderTop: '1px solid var(--border)',
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Phase dots */}
      {n > 1 && play.phases.map((_, i) => {
        const t = i * (100 / (n - 1));
        const active = Math.abs(t - prog) < (100 / (n * 2));
        return (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: active ? 'var(--accent)' : '#1e3055',
              flexShrink: 0,
              transition: 'background .15s',
            }}
          />
        );
      })}

      {/* Label */}
      <span style={{
        fontSize: 10, fontWeight: 700, color: 'var(--accent)',
        letterSpacing: 1, minWidth: 80,
      }}>
        {currentLabel}
      </span>

      {/* Scrubber */}
      <input
        type="range"
        min={0} max={100} step={0.5}
        value={prog}
        onChange={handleScrub}
        style={{ flex: 1 }}
      />

      {/* Percentage */}
      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
        {Math.round(prog)}%
      </span>
    </div>
  );
}
