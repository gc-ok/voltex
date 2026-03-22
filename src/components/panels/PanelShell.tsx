'use client';

import React from 'react';

interface PanelShellProps {
  children: React.ReactNode;
  visible: boolean;
  width?: number;
}

export function PanelShell({ children, visible, width = 280 }: PanelShellProps) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width,
      maxHeight: 'calc(100% - 24px)',
      background: '#0a1428ee',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 14,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      {children}
    </div>
  );
}
