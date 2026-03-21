'use client';

import React from 'react';
import { usePlaybookStore, getPlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { PD } from '@/data/players';
import { phIdxFromProg } from '@/utils/lerp';

const SPEEDS = [0.5, 1, 1.5, 2];

export function PlayInfoDrawer() {
  const pid = usePlaybookStore(s => s.pid);
  const phIdx = usePlaybookStore(s => s.phIdx);
  const setPhIdx = usePlaybookStore(s => s.setPhIdx);
  const tab = usePlaybookStore(s => s.tab);

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

  if (tab !== 'main') return null;

  const play = getPlay(pid);
  const isAnimating = playing || prog > 0;
  const displayPhIdx = isAnimating ? phIdxFromProg(prog, play.phases.length) : phIdx;
  const currentPhase = play.phases[displayPhIdx] || play.phases[0];

  const togglePlay = () => {
    if (prog >= 100) setProg(0);
    setPlaying(!playing);
  };

  const handleReset = () => {
    reset();
    clearTrails();
    setPhIdx(0);
  };

  const selectPhase = (i: number) => {
    if (playing) setPlaying(false);
    setProg(0);
    clearTrails();
    setPhIdx(i);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 280,
      maxHeight: 'calc(100% - 24px)',
      background: '#0a1428e8',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 14,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      {/* Play title */}
      <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1, marginBottom: 2 }}>
        {play.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: 10 }}>
        {play.desc}
      </div>

      {/* Animation controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <button
          onClick={togglePlay}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: playing ? '#e8a83e20' : 'var(--accent)',
            border: 'none',
            color: playing ? 'var(--accent)' : '#000',
            fontSize: 14, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button
          onClick={handleReset}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text-dim)', borderRadius: 6,
            padding: '3px 8px', fontSize: 11, fontWeight: 700,
          }}
        >
          ⏮
        </button>

        {/* Speed buttons */}
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              background: speed === s ? '#e8a83e20' : 'none',
              border: `1px solid ${speed === s ? '#e8a83e70' : 'var(--border)'}`,
              color: speed === s ? 'var(--accent)' : 'var(--text-dim)',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Trails toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div
          onClick={() => { setTrails(!trails); if (trails) clearTrails(); }}
          style={{
            width: 32, height: 18, borderRadius: 9,
            background: trails ? 'var(--accent)' : '#1e3055',
            position: 'relative', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: 3, left: trails ? 17 : 3,
            width: 12, height: 12, borderRadius: '50%',
            background: '#fff', transition: 'left .2s',
          }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>
          TRAILS
        </span>
      </div>

      {/* Phase list */}
      <div style={{ marginBottom: 8 }}>
        {play.phases.map((ph, i) => (
          <button
            key={i}
            onClick={() => selectPhase(i)}
            style={{
              width: '100%', textAlign: 'left',
              background: i === displayPhIdx ? '#e8a83e08' : 'transparent',
              border: `1px solid ${i === displayPhIdx ? '#e8a83e50' : 'var(--border)'}`,
              borderRadius: 7,
              padding: '7px 10px',
              marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 7,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: i === displayPhIdx ? 'var(--accent)' : '#1e3055',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 900, color: i === displayPhIdx ? '#000' : 'var(--text-dim)',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
              color: i === displayPhIdx ? 'var(--accent)' : 'var(--text-mid)',
            }}>
              {ph.label}
            </span>
          </button>
        ))}
      </div>

      {/* Phase notes */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          PHASE NOTES
        </div>
        {PD.map(pl => {
          const note = currentPhase.notes[pl.id];
          if (!note) return null;
          return (
            <div key={pl.id} style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: pl.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 900, color: '#000',
              }}>
                {pl.short}
              </div>
              <div style={{ fontSize: 11, color: '#ffffffb0', lineHeight: 1.4 }}>
                {note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
