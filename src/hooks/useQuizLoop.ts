'use client';

import { useEffect, useRef } from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useQuizStore } from '@/stores/useQuizStore';

export function useQuizLoop() {
  const rafRef = useRef<number | null>(null);
  const tsRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(ts: number) {
      const { tab } = usePlaybookStore.getState();
      const { qDone, quizProg, setQuizProg } = useQuizStore.getState();

      if (tab !== 'quiz' || qDone) {
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      if (tsRef.current === null) tsRef.current = ts;
      const dt = ts - tsRef.current;
      tsRef.current = ts;

      let newProg = quizProg + dt * 0.018;
      if (newProg >= 100) newProg = 0; // loop

      setQuizProg(newProg);
      rafRef.current = requestAnimationFrame(tick);
    }

    // Subscribe to tab changes to start/stop
    const unsub1 = usePlaybookStore.subscribe((state) => {
      if (state.tab === 'quiz' && !useQuizStore.getState().qDone && !rafRef.current) {
        tsRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
      }
      if (state.tab !== 'quiz' && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        tsRef.current = null;
      }
    });

    const unsub2 = useQuizStore.subscribe((state) => {
      if (state.qDone && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        tsRef.current = null;
      }
      // Restart loop on new question
      if (!state.qDone && usePlaybookStore.getState().tab === 'quiz' && !rafRef.current) {
        tsRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
      }
    });

    return () => {
      unsub1();
      unsub2();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);
}
