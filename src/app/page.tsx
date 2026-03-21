'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Court } from '@/components/court/Court';
import { PlayInfoDrawer } from '@/components/panels/PlayInfoDrawer';
import { BottomTimeline } from '@/components/layout/BottomTimeline';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <Court />
          <PlayInfoDrawer />
          <BottomTimeline />
        </main>
      </div>
    </div>
  );
}
