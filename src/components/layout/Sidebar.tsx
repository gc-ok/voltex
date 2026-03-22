'use client';

import React, { useState } from 'react';
import { usePlaybookStore, getFiltered, type Tab } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useRallyStore } from '@/stores/useRallyStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { Rotation, FormationContext } from '@/data/types';

const NAV_ITEMS: { tab: Tab; icon: string; label: string }[] = [
  { tab: 'setup',      icon: '⚙',  label: 'Setup' },
  { tab: 'myteam',     icon: '👥', label: 'My Team' },
  { tab: 'library',    icon: '📖', label: 'Library' },
  { tab: 'strategies', icon: '📋', label: 'Strategies' },
];

const QUIZ_NAV = { tab: 'quiz' as Tab, icon: '🧠', label: 'Quiz' };

const ROTATIONS: Rotation[] = [1, 2, 3, 4, 5, 6];
const CONTEXTS: { key: FormationContext; label: string }[] = [
  { key: 'serveReceive', label: 'SR' },
  { key: 'baseDefense', label: 'DEF' },
  { key: 'baseOffense', label: 'OFF' },
];

export function Sidebar() {
  const tab = usePlaybookStore(s => s.tab);
  const setTab = usePlaybookStore(s => s.setTab);
  const cat = usePlaybookStore(s => s.cat);
  const pid = usePlaybookStore(s => s.pid);
  const cats = usePlaybookStore(s => s.cats);
  const setCat = usePlaybookStore(s => s.setCat);
  const setPid = usePlaybookStore(s => s.setPid);

  const rallies = useRallyStore(s => s.rallies);
  const activeRallyId = useRallyStore(s => s.activeRallyId);
  const setActiveRally = useRallyStore(s => s.setActiveRally);
  const createRally = useRallyStore(s => s.createRally);

  const teamPlays = useTeamStore(s => s.teamPlays);
  const removeFromTeamPlaybook = useTeamStore(s => s.removeFromTeamPlaybook);
  const rotation = useTeamStore(s => s.rotation);
  const formationCtx = useTeamStore(s => s.formationCtx);
  const setRotation = useTeamStore(s => s.setRotation);
  const setFormationCtx = useTeamStore(s => s.setFormationCtx);

  const [newName, setNewName] = useState('');

  const filtered = getFiltered(cat);

  const selectPlay = (id: string) => {
    useAnimationStore.getState().reset();
    useRallyStore.getState().setActiveRally(null);
    setPid(id);
  };

  const selectRally = (id: string) => {
    useAnimationStore.getState().reset();
    setActiveRally(id);
    if (tab !== 'strategies') setTab('strategies');
  };

  const handleCreateRally = () => {
    if (!newName.trim()) return;
    createRally(newName.trim());
    setNewName('');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-panel)',
      display: 'flex',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Icon Rail */}
      <div style={{
        width: 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: '1px solid var(--border)',
        paddingTop: 8,
        flexShrink: 0,
      }}>
        {NAV_ITEMS.map(item => (
          <NavButton key={item.tab} item={item} active={tab === item.tab} onClick={() => setTab(item.tab)} />
        ))}

        {/* Spacer pushes quiz to bottom */}
        <div style={{ flex: 1 }} />

        <NavButton item={QUIZ_NAV} active={tab === 'quiz'} onClick={() => setTab('quiz')} />
        <div style={{ height: 12 }} />
      </div>

      {/* Contextual List Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {/* Setup: empty list area */}
        {tab === 'setup' && (
          <div style={{ padding: '20px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>
              SETUP
            </div>
            <div style={{ fontSize: 11, color: '#ffffff30', marginTop: 8, lineHeight: 1.6 }}>
              Configure your team in the right panel
            </div>
          </div>
        )}

        {/* My Team: rotation pills + formation context */}
        {tab === 'myteam' && (
          <div style={{ padding: '8px 8px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              ROTATION
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {ROTATIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRotation(r)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: rotation === r ? 'var(--accent)' : '#1e3055',
                    color: rotation === r ? '#000' : 'var(--text-mid)',
                    border: `2px solid ${rotation === r ? 'var(--accent)' : '#ffffff18'}`,
                    fontSize: 13, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              FORMATION
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {CONTEXTS.map(c => (
                <button
                  key={c.key}
                  onClick={() => setFormationCtx(c.key)}
                  style={{
                    flex: 1,
                    background: formationCtx === c.key ? 'var(--accent)' : 'var(--bg-card)',
                    color: formationCtx === c.key ? '#000' : 'var(--text-dim)',
                    border: `1px solid ${formationCtx === c.key ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 7, padding: '4px 6px',
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Library: category pills + system play list */}
        {tab === 'library' && (
          <>
            <div style={{ padding: '8px 8px 4px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    background: c === cat ? '#e8a83e18' : 'var(--bg-card)',
                    border: `1px solid ${c === cat ? '#e8a83e60' : 'var(--border)'}`,
                    color: c === cat ? 'var(--accent)' : 'var(--text-dim)',
                    borderRadius: 12, padding: '3px 8px',
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPlay(p.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: p.id === pid ? '#e8a83e08' : 'var(--bg-card)',
                    border: `1px solid ${p.id === pid ? '#e8a83e60' : 'var(--border)'}`,
                    borderRadius: 7, padding: '6px 8px', marginBottom: 3,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.id === pid ? 'var(--accent)' : 'var(--text)', letterSpacing: 0.2 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-mid)', marginTop: 1, lineHeight: 1.3 }}>
                    {p.desc.length > 45 ? p.desc.slice(0, 45) + '...' : p.desc}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Strategies: team plays + rallies */}
        {tab === 'strategies' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {/* Team Plays section */}
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              MY PLAYS ({teamPlays.length})
            </div>
            {teamPlays.length === 0 ? (
              <div style={{ fontSize: 10, color: '#ffffff30', padding: '4px 0 10px', lineHeight: 1.5 }}>
                Add plays from Library
              </div>
            ) : (
              teamPlays.map(tp => (
                <div key={tp.id} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
                  <button
                    onClick={() => selectPlay(tp.id)}
                    style={{
                      flex: 1, textAlign: 'left',
                      background: tp.id === pid ? '#e8a83e08' : 'var(--bg-card)',
                      border: `1px solid ${tp.id === pid ? '#e8a83e60' : 'var(--border)'}`,
                      borderRadius: 7, padding: '5px 8px',
                    }}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
                      color: tp.id === pid ? 'var(--accent)' : 'var(--text)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {tp.name}
                      {tp.isCustomized && (
                        <span style={{ fontSize: 8, color: '#10b981', fontWeight: 600 }}>EDITED</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => removeFromTeamPlaybook(tp.id)}
                    style={{
                      background: 'none', border: 'none', color: '#ef4444aa',
                      fontSize: 12, padding: '2px 4px', flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}

            {/* Rallies section */}
            <div style={{
              fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1,
              marginTop: 10, marginBottom: 4,
              borderTop: '1px solid var(--border)', paddingTop: 8,
            }}>
              RALLIES ({rallies.length})
            </div>
            {rallies.map(r => (
              <button
                key={r.id}
                onClick={() => selectRally(r.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: r.id === activeRallyId ? '#e8a83e08' : 'var(--bg-card)',
                  border: `1px solid ${r.id === activeRallyId ? '#e8a83e60' : 'var(--border)'}`,
                  borderRadius: 7, padding: '5px 8px', marginBottom: 3,
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
                  color: r.id === activeRallyId ? 'var(--accent)' : 'var(--text)',
                }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-mid)', marginTop: 1 }}>
                  {r.steps.length} step{r.steps.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}

            {/* Create new rally */}
            <div style={{ marginTop: 6, display: 'flex', gap: 3 }}>
              <input
                type="text"
                placeholder="New rally..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateRally()}
                style={{
                  flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '4px 7px', fontSize: 11, color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCreateRally}
                style={{
                  background: 'var(--accent)', border: 'none', color: '#000',
                  borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700,
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Quiz: question progress */}
        {tab === 'quiz' && (
          <div style={{ padding: '20px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>
              QUIZ MODE
            </div>
            <div style={{ fontSize: 11, color: '#ffffff30', marginTop: 8, lineHeight: 1.6 }}>
              Answer questions in the right panel
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* Icon rail button */
function NavButton({ item, active, onClick }: {
  item: { tab: Tab; icon: string; label: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 48, height: 48,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
        background: active ? '#e8a83e12' : 'transparent',
        border: 'none',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-dim)',
        cursor: 'pointer',
        transition: 'all .12s',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1 }}>
        {item.label.toUpperCase()}
      </span>
    </button>
  );
}
