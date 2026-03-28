'use client';

import React, { useState } from 'react'; // 👈 Added useState
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { PD } from '@/data/players';
import { PlayerId } from '@/data/types'; // 👈 Imported PlayerId

export function EditorPanel() {
  const tab = usePlaybookStore(s => s.tab);
  const pid = usePlaybookStore(s => s.pid);
  const phIdx = usePlaybookStore(s => s.phIdx);
  const setPhIdx = usePlaybookStore(s => s.setPhIdx);
  const violations = useEditorStore(s => s.violations);
  const mods = useEditorStore(s => s.mods);
  const resetEdits = useEditorStore(s => s.resetEdits);
  
  // 👈 NEW Editor Mutators
  const updatePhaseLabel = useEditorStore(s => s.updatePhaseLabel);
  const updateNote = useEditorStore(s => s.updateNote);
  const updatePlayerName = useEditorStore(s => s.updatePlayerName);

  const isEditing = usePlaybookStore(s => s.isEditing);
  const getEditorPlay = useEditorStore(s => s.getPlay);
  
  // 👈 NEW Local state for the selected player to edit text
  const [selPid, setSelPid] = useState<PlayerId | null>(null);

  // 2. NOW WE CAN SAFELY RETURN EARLY
  if (!isEditing) return null;

  // 3. REGULAR VARIABLES & DERIVED STATE (No hooks down here)
  const play = getEditorPlay(pid);
  if (!play) return null; // Safety fallback just in case the ID is invalid
  
  const phase = play.phases[phIdx] || play.phases[0];
  const isModified = mods[pid];
  const isSR = phase.label.includes('Serve Receive') && play.cat.includes('Serve Receive');
  const isTeamPlay = pid.startsWith('team_');

  const handleSave = () => {
    const editedPlay = getEditorPlay(pid);
    
    if (isTeamPlay) {
      // If it's already in the team playbook, just update it.
      useTeamStore.getState().updateTeamPlay(pid, {
        phases: editedPlay.phases,
        playerNames: editedPlay.playerNames,
      });
    } else {
      // If it's a library play, add it to the team playbook WITH the new edits!
      // 1. Add it to the store first to generate the `team_` ID.
      useTeamStore.getState().addToTeamPlaybook(pid);
      // 2. Immediately update that newly created team play with the dragged coordinates.
      useTeamStore.getState().updateTeamPlay(`team_${pid}`, {
        phases: editedPlay.phases,
        playerNames: editedPlay.playerNames,
      });
      // 3. Switch the user over to their team playbook to see it.
      usePlaybookStore.getState().setTab('strategies');
      usePlaybookStore.getState().setPid(`team_${pid}`);
    }

    resetEdits(pid);
    usePlaybookStore.getState().setIsEditing(false);
  };

  const handleDiscard = () => {
    resetEdits(pid);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>
          EDIT MODE
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12, lineHeight: 1.4 }}>
        {play.name}
      </div>

      {/* Save / Discard */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          onClick={handleSave}
          style={{
            flex: 2, background: 'var(--accent)', border: 'none',
            color: '#000', borderRadius: 8, padding: '9px',
            fontSize: 14, fontWeight: 900, cursor: 'pointer',
          }}
        >
          {isTeamPlay ? 'Save Changes' : 'Save to My Playbook'}
        </button>
        <button
          onClick={handleDiscard}
          style={{
            flex: 1, background: 'none', border: '1px solid var(--border)',
            color: 'var(--text-mid)', borderRadius: 8, padding: '9px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Discard
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 0.5, fontWeight: 700 }}>
        SELECT PHASE TO EDIT:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
        {play.phases.map((ph, i) => (
          <button
            key={i}
            onClick={() => { setPhIdx(i); setSelPid(null); }}
            style={{
              background: i === phIdx ? 'var(--accent)' : 'var(--bg-card)',
              color: i === phIdx ? '#000' : 'var(--text-dim)',
              border: `1px solid ${i === phIdx ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {i + 1}. {ph.label}
          </button>
        ))}
      </div>

      {/* Validator */}
      <div style={{ marginBottom: 16 }}>
        {violations.length === 0 ? (
          isSR ? (
            <div style={{ background: '#10b98110', border: '1px solid #10b98150', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#10b981', fontWeight: 700 }}>
              ✓ Valid formation
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#ffffff35', fontStyle: 'italic' }}>
              Validation active on serve receive phases.
            </div>
          )
        ) : (
          violations.map((v, i) => (
            <div key={i} style={{ background: '#ef444410', border: '1px solid #ef444450', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: '#ef4444', fontWeight: 700, marginBottom: 5 }}>
              ⚠ {v.msg}
            </div>
          ))
        )}
      </div>

      {/* Reset button */}
      {isModified && (
        <button
          onClick={() => resetEdits(pid)}
          style={{ width: '100%', background: 'none', border: '1px solid #ef444450', color: '#ef4444', borderRadius: 9, padding: '8px', fontSize: 12, fontWeight: 700, marginBottom: 16, cursor: 'pointer' }}
        >
          Reset to Original
        </button>
      )}

      {/* Player legend - NOW CLICKABLE */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          PLAYERS ON COURT (CLICK TO EDIT)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PD.map(pl => {
            if (!phase.pos[pl.id] || (phase.pos[pl.id]?.x === -1000)) return null;
            const isSel = selPid === pl.id;
            return (
              <div key={pl.id} onClick={() => setSelPid(isSel ? null : pl.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: isSel ? '#ffffff10' : 'transparent', padding: '4px', borderRadius: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: pl.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#000', flexShrink: 0 }}>
                  {pl.short}
                </div>
                <span style={{ fontSize: 12, color: isSel ? 'var(--accent)' : '#ffffffcc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isSel ? 700 : 400 }}>
                  {play.playerNames?.[pl.id] || pl.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 👈 NEW: Player Name & Tooltip Edit Form */}
      {selPid && (
        <div style={{ marginTop: 12, background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, marginBottom: 4 }}>RENAME PLAYER:</div>
          <input 
            type="text" 
            value={play.playerNames?.[selPid] || ''} 
            onChange={e => updatePlayerName(selPid, e.target.value, pid)}
            placeholder={`e.g. Sarah`}
            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 6, fontSize: 13, marginBottom: 10, outline: 'none' }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, marginBottom: 4 }}>TOOLTIP NOTE (PHASE {phIdx + 1}):</div>
          <textarea 
            value={phase.notes?.[selPid] || ''} 
            onChange={e => updateNote(selPid, e.target.value, pid, phIdx)}
            placeholder="What should this player do?"
            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 6, fontSize: 12, outline: 'none', minHeight: 60, resize: 'vertical' }}
          />
        </div>
      )}

      <div style={{ background: '#e8a83e10', border: '1px solid #e8a83e30', borderRadius: 8, padding: '8px 10px', marginTop: 16, fontSize: 11, color: 'var(--accent)', fontWeight: 700, lineHeight: 1.5 }}>
        Drag players on the court to edit their positions for Phase {phIdx + 1}.
      </div>
    </div>
  );
}