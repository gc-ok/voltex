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

  const handleEditClick = () => {
    useEditorStore.getState().resetEdits(pid);
    usePlaybookStore.getState().setIsEditing(true);
  };

  const isAlreadyInTeamPlaybook = teamPlays.some(tp => tp.sourceId === pid);

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
      <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: 12 }}>
        {play.desc}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {tab === 'library' && !isAlreadyInTeamPlaybook && (
          <button
            onClick={() => addToTeamPlaybook(pid)}
            style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text)', borderRadius: 8, padding: '8px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Add to Team
          </button>
        )}
        
        {/* Edit button now shows for BOTH library plays and team plays! */}
        <button
          onClick={handleEditClick}
          style={{
            flex: 1, background: '#e8a83e15', border: '1px solid #e8a83e40',
            color: 'var(--accent)', borderRadius: 8, padding: '8px',
            fontSize: 12, fontWeight: 900, cursor: 'pointer',
          }}
        >
          Customize & Edit Play
        </button>
      </div>

      {tab === 'library' && isAlreadyInTeamPlaybook && (
        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 12, textAlign: 'center', background: '#10b98110', padding: '6px', borderRadius: 6 }}>
          ✓ Added to Team Playbook
        </div>
      )}

      {/* Phase list */}
      <div style={{ marginBottom: 12 }}>
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
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          PHASE {displayPhIdx + 1} COACHING NOTES
        </div>
        {PD.map(pl => {
          const note = currentPhase.notes[pl.id];
          if (!note) return null;
          return (
            <div key={pl.id} style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: pl.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900, color: '#000',
              }}>
                {pl.short}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, marginBottom: 2 }}>{playerNames[pl.id] || pl.role}</div>
                <div style={{ fontSize: 13, color: '#ffffffcc', lineHeight: 1.4 }}>{note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}