'use client';

import React from 'react';
import { usePlaybookStore, getFiltered } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';

export function Sidebar() {
  const cat = usePlaybookStore(s => s.cat);
  const pid = usePlaybookStore(s => s.pid);
  const cats = usePlaybookStore(s => s.cats);
  const setCat = usePlaybookStore(s => s.setCat);
  const setPid = usePlaybookStore(s => s.setPid);

  const filtered = getFiltered(cat);

  const selectPlay = (id: string) => {
    useAnimationStore.getState().reset();
    setPid(id);
  };

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Category pills */}
      <div style={{
        padding: '10px 10px 6px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
      }}>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              background: c === cat ? '#e8a83e18' : 'var(--bg-card)',
              border: `1px solid ${c === cat ? '#e8a83e60' : 'var(--border)'}`,
              color: c === cat ? 'var(--accent)' : 'var(--text-dim)',
              borderRadius: 14,
              padding: '3px 9px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Play list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 10px 10px',
      }}>
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => selectPlay(p.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: p.id === pid ? '#e8a83e08' : 'var(--bg-card)',
              border: `1px solid ${p.id === pid ? '#e8a83e60' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 4,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: p.id === pid ? 'var(--accent)' : 'var(--text)',
              letterSpacing: 0.5,
            }}>
              {p.name}
            </div>
            <div style={{
              fontSize: 10,
              color: 'var(--text-dim)',
              marginTop: 2,
              lineHeight: 1.3,
            }}>
              {p.desc.length > 60 ? p.desc.slice(0, 60) + '...' : p.desc}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
