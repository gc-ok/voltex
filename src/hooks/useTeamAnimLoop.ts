'use client';

import { useEffect, useRef } from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';

export function useTeamAnimLoop() {
  const rafRef = useRef<number | null>(null);
  const tsRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(ts: number) {
      const { teamAnimPlaying, teamAnimProg, setTeamAnimProg, setTeamAnimPlaying } =
        usePlaybookStore.getState();

      if (!teamAnimPlaying) {
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      if (tsRef.current === null) tsRef.current = ts;
      const dt = ts - tsRef.current;
      tsRef.current = ts;

      // Speed: ~0.018 per ms → full animation in ~5.5 seconds
      let newProg = teamAnimProg + dt * 0.018;

      if (newProg >= 100) {
        newProg = 100;
        setTeamAnimProg(100);
        setTeamAnimPlaying(false);
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      setTeamAnimProg(newProg);
      rafRef.current = requestAnimationFrame(tick);
    }

    const unsub = usePlaybookStore.subscribe(
      (state) => {
        if (state.teamAnimPlaying && !rafRef.current) {
          tsRef.current = null;
          rafRef.current = requestAnimationFrame(tick);
        }
      }
    );

    return () => {
      unsub();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);
}
