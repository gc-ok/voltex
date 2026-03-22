'use client';

import React, { useState } from 'react';
import { usePlaybookStore, resolvePlay } from '@/stores/usePlaybookStore';
import { useRallyStore } from '@/stores/useRallyStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { PLAYS } from '@/data/plays';

export function RallyBuilderPanel() {
  const tab = usePlaybookStore(s => s.tab);
  const activeRallyId = useRallyStore(s => s.activeRallyId);
  const rallies = useRallyStore(s => s.rallies);
  const setActiveRally = useRallyStore(s => s.setActiveRally);
  const addStep = useRallyStore(s => s.addStep);
  const removeStep = useRallyStore(s => s.removeStep);
  const moveStep = useRallyStore(s => s.moveStep);
  const createRally = useRallyStore(s => s.createRally);
  const deleteRally = useRallyStore(s => s.deleteRally);
  const flattenActiveRally = useRallyStore(s => s.flattenActiveRally);

  const [showAddPlay, setShowAddPlay] = useState(false);
  const [newRallyName, setNewRallyName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  if (tab !== 'strategies') return null;
  if (!activeRallyId) return null;

  const rally = rallies.find(r => r.id === activeRallyId);
  if (!rally) return null;

  const handlePlayRally = () => {
    flattenActiveRally();
    const { flatPhases } = useRallyStore.getState();
    if (!flatPhases || flatPhases.length === 0) return;
    useAnimationStore.getState().reset();
    useAnimationStore.getState().clearTrails();
    useAnimationStore.getState().setProg(0);
    useAnimationStore.getState().setPlaying(true);
  };

  const handleAddPlay = (playId: string) => {
    addStep(activeRallyId, playId);
    setShowAddPlay(false);
    // Re-flatten if this rally is active
    setTimeout(() => flattenActiveRally(), 0);
  };

  const handleRemoveStep = (idx: number) => {
    removeStep(activeRallyId, idx);
    setTimeout(() => flattenActiveRally(), 0);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    moveStep(activeRallyId, idx, idx - 1);
    setTimeout(() => flattenActiveRally(), 0);
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= rally.steps.length - 1) return;
    moveStep(activeRallyId, idx, idx + 1);
    setTimeout(() => flattenActiveRally(), 0);
  };

  // Group plays by category for the picker
  const playsByCat: Record<string, typeof PLAYS> = {};
  PLAYS.forEach(p => {
    if (!playsByCat[p.cat]) playsByCat[p.cat] = [];
    playsByCat[p.cat].push(p);
  });

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width: 290,
      maxHeight: 'calc(100% - 24px)',
      background: '#0a1428ee',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 14,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      zIndex: 110,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5 }}>
          RALLY BUILDER
        </div>
        <button
          onClick={() => setActiveRally(null)}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text-mid)', borderRadius: 6,
            padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          CLOSE
        </button>
      </div>

      {/* Rally name */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        {rally.name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 12, lineHeight: 1.4 }}>
        {rally.desc}
      </div>

      {/* Steps list */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          STEPS ({rally.steps.length})
        </div>
        {rally.steps.length === 0 && (
          <div style={{ fontSize: 12, color: '#ffffff40', padding: '8px 0' }}>
            No steps yet. Add plays to build a rally.
          </div>
        )}
        {rally.steps.map((step, i) => {
          const play = resolvePlay(step.playId);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#ffffff06', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 8px', marginBottom: 4,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: '#1e3055', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900, color: 'var(--text-mid)', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {play.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{play.cat}</div>
              </div>
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <button onClick={() => handleMoveUp(i)} style={{ background: 'none', border: 'none', color: '#ffffff50', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>▲</button>
                <button onClick={() => handleMoveDown(i)} style={{ background: 'none', border: 'none', color: '#ffffff50', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>▼</button>
                <button onClick={() => handleRemoveStep(i)} style={{ background: 'none', border: 'none', color: '#ef4444aa', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add play button / picker */}
      {!showAddPlay ? (
        <button
          onClick={() => setShowAddPlay(true)}
          style={{
            width: '100%', background: '#e8a83e10', border: '1px solid #e8a83e40',
            color: 'var(--accent)', borderRadius: 8, padding: '7px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
          }}
        >
          + Add Play
        </button>
      ) : (
        <div style={{
          background: '#0d1a2e', border: '1px solid var(--border)',
          borderRadius: 8, padding: 8, marginBottom: 10, maxHeight: 200, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, marginBottom: 4 }}>
            SELECT PLAY
          </div>
          {Object.entries(playsByCat).map(([cat, plays]) => (
            <div key={cat}>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, padding: '4px 0 2px', letterSpacing: 0.5 }}>
                {cat}
              </div>
              {plays.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleAddPlay(p.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    color: 'var(--text)', fontSize: 12, fontWeight: 600,
                    padding: '3px 6px', cursor: 'pointer',
                    borderRadius: 4,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#ffffff10')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {p.name}
                </button>
              ))}
            </div>
          ))}
          <button
            onClick={() => setShowAddPlay(false)}
            style={{
              width: '100%', background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-mid)', borderRadius: 6, padding: '4px',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4,
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Play rally button */}
      {rally.steps.length > 0 && (
        <button
          onClick={handlePlayRally}
          style={{
            width: '100%', background: 'var(--accent)', border: 'none',
            color: '#000', borderRadius: 9, padding: '9px',
            fontSize: 14, fontWeight: 900, cursor: 'pointer', letterSpacing: 0.5,
          }}
        >
          ▶ Play Rally
        </button>
      )}

      {/* Delete rally (only custom) */}
      {rally.id.startsWith('rally_custom') && (
        <button
          onClick={() => deleteRally(rally.id)}
          style={{
            width: '100%', background: 'none', border: '1px solid #ef444440',
            color: '#ef4444aa', borderRadius: 8, padding: '6px',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 8,
          }}
        >
          Delete Rally
        </button>
      )}
    </div>
  );
}
