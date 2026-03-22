'use client';

import React from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useTeamStore } from '@/stores/useTeamStore';

export function Header() {
  const setTab = usePlaybookStore(s => s.setTab);
  const teamName = useTeamStore(s => s.teamName);

  return (
    <header style={{
      height: 'var(--header-h)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-panel)',
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 900, color: '#000',
        }}>
          V
        </div>
        <span style={{
          fontSize: 18, fontWeight: 900, letterSpacing: 3,
          color: 'var(--text)',
        }}>
          VOLTEX
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Team name (clickable → setup) */}
      <button
        onClick={() => setTab('setup')}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          color: 'var(--accent)',
          borderRadius: 8,
          padding: '5px 14px',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.5,
          cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        {teamName}
      </button>
    </header>
  );
}
