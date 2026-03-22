'use client';

import React from 'react';
import { usePlaybookStore, resolvePlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { PD } from '@/data/players';
import { useTeamStore } from '@/stores/useTeamStore';
import { useRallyStore } from '@/stores/useRallyStore';
import { phIdxFromProg } from '@/utils/lerp';

export function PlayInfoDrawer() {
  const pid = usePlaybookStore(s => s.pid);
  const phIdx = usePlaybookStore(s => s.phIdx);
  const setPhIdx = usePlaybookStore(s => s.setPhIdx);
  const tab = usePlaybookStore(s => s.tab);

  const prog = useAnimationStore(s => s.prog);
  const playing = useAnimationStore(s => s.playing);
  const setPlaying = useAnimationStore(s => s.setPlaying);
  const setProg = useAnimationStore(s => s.setProg);
  const clearTrails = useAnimationStore(s => s.clearTrails);

  const playerNames = useTeamStore(s => s.playerNames);
  const teamPlays = useTeamStore(s => s.teamPlays);
  const addToTeamPlaybook = useTeamStore(s => s.addToTeamPlaybook);
  const activeRallyId = useRallyStore(s => s.activeRallyId);

  // Show in library + strategies tabs (not when rally builder active or editing)
  const isEditing = usePlaybookStore(s => s.isEditing);
  if ((tab !== 'library' && tab !== 'strategies') || activeRallyId || isEditing) return null;

  const play = resolvePlay(pid);
  const isAnimating = playing || prog > 0;
  const displayPhIdx = isAnimating ? phIdxFromProg(prog, play.phases.length) : phIdx;
  const currentPhase = play.phases[displayPhIdx] || play.phases[0];

  const selectPhase = (i: number) => {
    if (playing) setPlaying(false);
    setProg(0);
    clearTrails();
    setPhIdx(i);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width: 280,
      maxHeight: 'calc(100% - 24px)',
      background: '#0a1428ee',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 14,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      {/* Play title */}
      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5, marginBottom: 4 }}>
        {play.name}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: 8 }}>
        {play.desc}
      </div>

      {/* Add to Team button (library only) */}
      {tab === 'library' && (
        !teamPlays.some(tp => tp.sourceId === pid) ? (
          <button
            onClick={() => addToTeamPlaybook(pid)}
            style={{
              width: '100%', background: '#e8a83e10', border: '1px solid #e8a83e40',
              color: 'var(--accent)', borderRadius: 8, padding: '6px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
            }}
          >
            + Add to Team Playbook
          </button>
        ) : (
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 10 }}>
            In Team Playbook
          </div>
        )
      )}

      {/* Edit button (strategies tab, team plays only) */}
      {tab === 'strategies' && teamPlays.some(tp => tp.id === pid) && (
        <button
          onClick={() => {
            useEditorStore.getState().resetEdits(pid);
            usePlaybookStore.getState().setIsEditing(true);
          }}
          style={{
            width: '100%', background: '#e8a83e10', border: '1px solid #e8a83e40',
            color: 'var(--accent)', borderRadius: 8, padding: '7px',
            fontSize: 13, fontWeight: 800, cursor: 'pointer', marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          Edit Play
        </button>
      )}

      {/* Phase list */}
      <div style={{ marginBottom: 8 }}>
        {play.phases.map((ph, i) => (
          <button
            key={i}
            onClick={() => selectPhase(i)}
            style={{
              width: '100%', textAlign: 'left',
              background: i === displayPhIdx ? '#e8a83e10' : 'transparent',
              border: `1px solid ${i === displayPhIdx ? '#e8a83e60' : 'var(--border)'}`,
              borderRadius: 7,
              padding: '8px 10px',
              marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: i === displayPhIdx ? 'var(--accent)' : '#1e3055',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: i === displayPhIdx ? '#000' : 'var(--text-mid)',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
              color: i === displayPhIdx ? 'var(--accent)' : 'var(--text)',
            }}>
              {ph.label}
            </span>
          </button>
        ))}
      </div>

      {/* Phase notes */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          PHASE NOTES
        </div>
        {PD.map(pl => {
          const note = currentPhase.notes[pl.id];
          if (!note) return null;
          return (
            <div key={pl.id} style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: pl.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900, color: '#000',
              }}>
                {playerNames[pl.id] || pl.short}
              </div>
              <div style={{ fontSize: 13, color: '#ffffffcc', lineHeight: 1.5 }}>
                {note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
