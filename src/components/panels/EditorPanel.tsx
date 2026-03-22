'use client';

import React from 'react';
import { usePlaybookStore, getPlay } from '@/stores/usePlaybookStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { PD } from '@/data/players';

export function EditorPanel() {
  const tab = usePlaybookStore(s => s.tab);
  const pid = usePlaybookStore(s => s.pid);
  const phIdx = usePlaybookStore(s => s.phIdx);
  const setPhIdx = usePlaybookStore(s => s.setPhIdx);
  const violations = useEditorStore(s => s.violations);
  const mods = useEditorStore(s => s.mods);
  const resetEdits = useEditorStore(s => s.resetEdits);

  const isEditing = usePlaybookStore(s => s.isEditing);
  if (!isEditing) return null;

  const play = getPlay(pid);
  const phase = play.phases[phIdx] || play.phases[0];
  const isModified = mods[pid];
  const isSR = phase.label.includes('Serve Receive') && play.cat.includes('Serve Receive');
  const isTeamPlay = pid.startsWith('team_');

  const handleSave = () => {
    const editedPlay = useEditorStore.getState().getPlay(pid);
    useTeamStore.getState().updateTeamPlay(pid, {
      phases: editedPlay.phases,
    });
    useEditorStore.getState().resetEdits(pid);
    usePlaybookStore.getState().setIsEditing(false);
  };

  const handleDiscard = () => {
    useEditorStore.getState().resetEdits(pid);
    usePlaybookStore.getState().setIsEditing(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 12,
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
      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1, marginBottom: 8 }}>
        EDIT MODE
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>
        {play.name}
      </div>

      {/* Save / Discard (for team plays) */}
      {isTeamPlay && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, background: 'var(--accent)', border: 'none',
              color: '#000', borderRadius: 8, padding: '8px',
              fontSize: 13, fontWeight: 900, cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            onClick={handleDiscard}
            style={{
              flex: 1, background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-mid)', borderRadius: 8, padding: '8px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Discard
          </button>
        </div>
      )}

      {/* Phase selector pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {play.phases.map((ph, i) => (
          <button
            key={i}
            onClick={() => setPhIdx(i)}
            style={{
              background: i === phIdx ? 'var(--accent)' : 'var(--bg-card)',
              color: i === phIdx ? '#000' : 'var(--text-dim)',
              border: `1px solid ${i === phIdx ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {i + 1}. {ph.label}
          </button>
        ))}
      </div>

      {/* Validator */}
      <div style={{ marginBottom: 12 }}>
        {violations.length === 0 ? (
          isSR ? (
            <div style={{
              background: '#10b98110',
              border: '1px solid #10b98150',
              borderRadius: 8,
              padding: '9px 12px',
              fontSize: 12,
              color: '#10b981',
              fontWeight: 700,
            }}>
              Valid formation
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#ffffff35' }}>
              Validation active on serve receive phases.
            </div>
          )
        ) : (
          violations.map((v, i) => (
            <div key={i} style={{
              background: '#ef444410',
              border: '1px solid #ef444450',
              borderRadius: 8,
              padding: '8px 11px',
              fontSize: 12,
              color: '#ef4444',
              fontWeight: 700,
              marginBottom: 5,
            }}>
              {v.msg}
            </div>
          ))
        )}
      </div>

      {/* Reset button */}
      {isModified && (
        <button
          onClick={() => resetEdits(pid)}
          style={{
            width: '100%',
            background: 'none',
            border: '1px solid #ef444450',
            color: '#ef4444',
            borderRadius: 9,
            padding: '8px',
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12,
            cursor: 'pointer',
          }}
        >
          Reset to Original
        </button>
      )}

      {/* Player legend */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          PLAYERS
        </div>
        {PD.map(pl => (
          <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: pl.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 900, color: '#000', flexShrink: 0,
            }}>
              {pl.short}
            </div>
            <span style={{ fontSize: 13, color: '#ffffffcc' }}>{pl.role}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8, fontSize: 12, color: '#e8a83e80', lineHeight: 1.8 }}>
        Drag players on court
      </div>
    </div>
  );
}
