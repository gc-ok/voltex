'use client';

import React from 'react';
import { usePlaybookStore, Tab } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';

export function Header() {
  const tab = usePlaybookStore(s => s.tab);
  const setTab = usePlaybookStore(s => s.setTab);

  const toggleMode = (mode: Tab) => {
    if (tab === mode) {
      // Toggle back to main
      useAnimationStore.getState().reset();
      setTab('main');
    } else {
      useAnimationStore.getState().reset();
      setTab(mode);
    }
  };

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
          fontSize: 14, fontWeight: 900, color: '#000',
        }}>
          V
        </div>
        <span style={{
          fontSize: 16, fontWeight: 900, letterSpacing: 3,
          color: 'var(--text)',
        }}>
          VOLTEX
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Mode toggles */}
      <button
        onClick={() => toggleMode('edit')}
        style={{
          background: tab === 'edit' ? '#e8a83e22' : 'transparent',
          border: `1px solid ${tab === 'edit' ? '#e8a83e70' : 'transparent'}`,
          color: tab === 'edit' ? 'var(--accent)' : 'var(--text-dim)',
          borderRadius: 20,
          padding: '5px 16px',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          transition: 'all .15s',
        }}
      >
        ✎ EDIT
      </button>
      <button
        onClick={() => toggleMode('quiz')}
        style={{
          background: tab === 'quiz' ? '#e8a83e22' : 'transparent',
          border: `1px solid ${tab === 'quiz' ? '#e8a83e70' : 'transparent'}`,
          color: tab === 'quiz' ? 'var(--accent)' : 'var(--text-dim)',
          borderRadius: 20,
          padding: '5px 16px',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          transition: 'all .15s',
        }}
      >
        QUIZ
      </button>
    </header>
  );
}
