'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Court } from '@/components/court/Court';
import { PlayInfoDrawer } from '@/components/panels/PlayInfoDrawer';
import { EditorPanel } from '@/components/panels/EditorPanel';
import { QuizPanel } from '@/components/panels/QuizPanel';
import { PlayControls } from '@/components/controls/PlayControls';
import { TeamDefaultsPanel } from '@/components/panels/TeamDefaultsPanel';
import { SetupWizardPanel } from '@/components/panels/SetupWizardPanel';
import { RallyBuilderPanel } from '@/components/panels/RallyBuilderPanel';
import { BottomTimeline } from '@/components/layout/BottomTimeline';
import { useTeamStore } from '@/stores/useTeamStore';
import { usePlaybookStore } from '@/stores/usePlaybookStore';

export default function AppPage() {
  const [hydrated, setHydrated] = useState(false);

  // Manually rehydrate team store (skipHydration: true) then render
  useEffect(() => {
    useTeamStore.persist.rehydrate();
    setHydrated(true);
    // Redirect first-time users to setup
    const hasSetup = useTeamStore.getState().hasCompletedSetup;
    if (!hasSetup) {
      usePlaybookStore.getState().setTab('setup');
    }
  }, []);

  if (!hydrated) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-deep)',
      }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)', letterSpacing: 3 }}>
          GC Volley
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <Court />
          <PlayInfoDrawer />
          <EditorPanel />
          <TeamDefaultsPanel />
          <SetupWizardPanel />
          <RallyBuilderPanel />
          <QuizPanel />
          <PlayControls />
          <BottomTimeline />
        </main>
      </div>
    </div>
  );
}
