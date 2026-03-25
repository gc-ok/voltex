'use client';

import React from 'react';
import Image from 'next/image';
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
      {/* Left Side: Custom Logo + Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Image 
          src="/logo.png" // Ensure logo.png is in your public/ folder
          alt="GC Volley Logo" 
          width={32} 
          height={32} 
          style={{ objectFit: 'contain' }} 
        />
        <span style={{
          fontSize: 18, 
          fontWeight: 700, 
          letterSpacing: 1, 
          color: 'var(--text)',
        }}>
          GC Volley
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right Side: Team Button */}
      <button
        onClick={() => setTab('setup')}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          color: 'var(--accent)',
          borderRadius: 8,
          padding: '5px 14px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        {teamName}
      </button>
    </header>
  );
}