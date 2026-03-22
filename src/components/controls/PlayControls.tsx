'use client';

import React from 'react';
import { usePlaybookStore, resolvePlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useRallyStore } from '@/stores/useRallyStore';

const SPEEDS = [0.5, 1, 1.5, 2];

export function PlayControls() {
  const tab = usePlaybookStore(s => s.tab);
  const pid = usePlaybookStore(s => s.pid);
  const prog = useAnimationStore(s => s.prog);
  const playing = useAnimationStore(s => s.playing);
  const speed = useAnimationStore(s => s.speed);
  const trails = useAnimationStore(s => s.trails);
  const setPlaying = useAnimationStore(s => s.setPlaying);
  const setProg = useAnimationStore(s => s.setProg);
  const setSpeed = useAnimationStore(s => s.setSpeed);
  const setTrails = useAnimationStore(s => s.setTrails);
  const clearTrails = useAnimationStore(s => s.clearTrails);
  const reset = useAnimationStore(s => s.reset);

  if (tab !== 'library' && tab !== 'strategies') return null;

  const play = resolvePlay(pid);

  const togglePlay = () => {
    // Ensure rally is flattened if active
    const { activeRallyId } = useRallyStore.getState();
    if (activeRallyId) {
      useRallyStore.getState().flattenActiveRally();
    }
    if (prog >= 100) setProg(0);
    setPlaying(!playing);
  };

  const handleReset = () => {
    reset();
    clearTrails();
    usePlaybookStore.getState().setPhIdx(0);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '10px 16px',
      background: 'var(--bg-panel)',
      borderTop: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: playing ? '#e8a83e20' : 'var(--accent)',
          border: 'none',
          color: playing ? 'var(--accent)' : '#000',
          fontSize: 16, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      {/* Reset */}
      <button
        onClick={handleReset}
        style={{
          background: 'none', border: '1px solid var(--border)',
          color: 'var(--text-mid)', borderRadius: 6,
          padding: '5px 10px', fontSize: 13, fontWeight: 700,
          flexShrink: 0,
        }}
      >
        ⏮
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

      {/* Speed buttons */}
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => setSpeed(s)}
          style={{
            background: speed === s ? '#e8a83e20' : 'none',
            border: `1px solid ${speed === s ? '#e8a83e70' : 'var(--border)'}`,
            color: speed === s ? 'var(--accent)' : 'var(--text-mid)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {s}x
        </button>
      ))}

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

      {/* Trails toggle */}
      <div
        onClick={() => { setTrails(!trails); if (trails) clearTrails(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: 34, height: 20, borderRadius: 10,
          background: trails ? 'var(--accent)' : '#1e3055',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 4, left: trails ? 18 : 4,
            width: 12, height: 12, borderRadius: '50%',
            background: '#fff', transition: 'left .2s',
          }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 700, letterSpacing: 1 }}>
          TRAILS
        </span>
      </div>
    </div>
  );
}
