'use client';

import React, { useState } from 'react';
import { usePlaybookStore, getFiltered, type Tab } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useRallyStore } from '@/stores/useRallyStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { Rotation, FormationContext } from '@/data/types';

const NAV_ITEMS: { tab: Tab; icon: React.ReactNode; label: string }[] = [
  { 
    tab: 'setup', 
    label: 'Setup',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  },
  { 
    tab: 'myteam', 
    label: 'My Team',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  },
  { 
    tab: 'library', 
    label: 'Library',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
  },
  { 
    tab: 'strategies', 
    label: 'Strategies',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>
  },
];

const QUIZ_NAV = { 
  tab: 'quiz' as Tab, 
  label: 'Quiz',
  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
};

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
  // NEW: State to control sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      width: isCollapsed ? '64px' : 'var(--sidebar-w)',
      transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-panel)',
      display: 'flex',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Icon Rail */}
      <div style={{
        width: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: isCollapsed ? 'none' : '1px solid var(--border)',
        paddingTop: 8,
        flexShrink: 0,
      }}>
        {NAV_ITEMS.map(item => (
          <NavButton key={item.tab} item={item} active={tab === item.tab} onClick={() => {
            setTab(item.tab);
            if (isCollapsed) setIsCollapsed(false); // Auto-open when a tab is clicked
          }} />
        ))}

        <div style={{ flex: 1 }} />

        <NavButton item={QUIZ_NAV} active={tab === 'quiz'} onClick={() => {
          setTab('quiz');
          if (isCollapsed) setIsCollapsed(false);
        }} />
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: '100%', height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none',
            color: 'var(--text-dim)', cursor: 'pointer',
            marginTop: 4, marginBottom: 8,
          }}
        >
          <svg 
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ 
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease' 
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Contextual List Area - Fades out when collapsed */}
      <div style={{
        width: 'calc(var(--sidebar-w) - 64px)',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'auto',
        transition: 'opacity 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Setup: empty list area */}
        {tab === 'setup' && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>
              SETUP
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.6 }}>
              Configure your team in the right panel
            </div>
          </div>
        )}

        {/* My Team: rotation pills + formation context */}
        {tab === 'myteam' && (
          <div style={{ padding: '12px 10px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              ROTATION
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {ROTATIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRotation(r)}
                  style={{
                    width: 32, height: 32, borderRadius: '6px',
                    background: rotation === r ? 'var(--accent)' : 'var(--bg-card)',
                    color: rotation === r ? '#0f172a' : 'var(--text)',
                    border: `1px solid ${rotation === r ? 'var(--accent)' : 'var(--border)'}`,
                    fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              FORMATION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CONTEXTS.map(c => (
                <button
                  key={c.key}
                  onClick={() => setFormationCtx(c.key)}
                  style={{
                    width: '100%',
                    background: formationCtx === c.key ? 'var(--accent)' : 'var(--bg-card)',
                    color: formationCtx === c.key ? '#0f172a' : 'var(--text)',
                    border: `1px solid ${formationCtx === c.key ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6, padding: '8px 10px',
                    fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
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
            <div style={{ padding: '12px 10px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    background: c === cat ? 'var(--accent-dim)' : 'var(--bg-card)',
                    border: `1px solid ${c === cat ? 'var(--accent)' : 'var(--border)'}`,
                    color: c === cat ? 'var(--accent)' : 'var(--text-dim)',
                    borderRadius: 16, padding: '4px 10px',
                    fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPlay(p.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: p.id === pid ? 'var(--accent-dim)' : 'var(--bg-card)',
                    border: `1px solid ${p.id === pid ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6, padding: '8px 10px', marginBottom: 6,
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: p.id === pid ? 'var(--accent)' : 'var(--text)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.4 }}>
                    {p.desc.length > 45 ? p.desc.slice(0, 45) + '...' : p.desc}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Strategies: team plays + rallies */}
        {tab === 'strategies' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              MY PLAYS ({teamPlays.length})
            </div>
            {teamPlays.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-mid)', padding: '4px 0 16px', lineHeight: 1.5 }}>
                Add plays from the Library
              </div>
            ) : (
              teamPlays.map(tp => (
                <div key={tp.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <button
                    onClick={() => selectPlay(tp.id)}
                    style={{
                      flex: 1, textAlign: 'left',
                      background: tp.id === pid ? 'var(--accent-dim)' : 'var(--bg-card)',
                      border: `1px solid ${tp.id === pid ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 6, padding: '8px 10px',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: tp.id === pid ? 'var(--accent)' : 'var(--text)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {tp.name}
                      {tp.isCustomized && (
                        <span style={{ fontSize: 9, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 4px', borderRadius: 4, fontWeight: 700 }}>EDITED</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => removeFromTeamPlaybook(tp.id)}
                    style={{
                      background: 'none', border: 'none', color: '#ef4444',
                      fontSize: 14, padding: '4px', flexShrink: 0, opacity: 0.7,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}

            <div style={{
              fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1,
              marginTop: 16, marginBottom: 8,
              borderTop: '1px solid var(--border)', paddingTop: 16,
            }}>
              RALLIES ({rallies.length})
            </div>
            {rallies.map(r => (
              <button
                key={r.id}
                onClick={() => selectRally(r.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: r.id === activeRallyId ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${r.id === activeRallyId ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 6, padding: '8px 10px', marginBottom: 6,
                }}
              >
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: r.id === activeRallyId ? 'var(--accent)' : 'var(--text)',
                }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                  {r.steps.length} step{r.steps.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}

            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="New rally..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateRally()}
                style={{
                  flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCreateRally}
                style={{
                  background: 'var(--accent)', border: 'none', color: '#0f172a',
                  borderRadius: 6, padding: '6px 12px', fontSize: 14, fontWeight: 700,
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Quiz: question progress */}
        {tab === 'quiz' && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>
              QUIZ MODE
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.6 }}>
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
  item: { tab: Tab; icon: React.ReactNode; label: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', height: 68,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6,
        background: active ? 'var(--accent-dim)' : 'transparent',
        border: 'none',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-dim)',
        cursor: 'pointer',
        transition: 'all .15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.icon}
      </div>
      {/* 9px font size and 0 tracking stops the text from wrapping/overflowing */}
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0, lineHeight: 1 }}>
        {item.label.toUpperCase()}
      </span>
    </button>
  );
}