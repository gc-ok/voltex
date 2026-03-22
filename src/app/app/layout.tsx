import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VOLTEX — Volleyball Playbook',
  description: 'Interactive volleyball playbook and rotation simulator. Build animated plays, validate formations, and quiz your team.',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
