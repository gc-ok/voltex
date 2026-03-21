'use client';

import { useEffect, useRef } from 'react';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { usePlaybookStore, getPlay } from '@/stores/usePlaybookStore';
import { lerp } from '@/utils/lerp';

export function useAnimationLoop() {
  const rafRef = useRef<number | null>(null);
  const tsRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(ts: number) {
      const { playing, speed, prog, trails, setProg, setPlaying, pushTrail } =
        useAnimationStore.getState();

      if (!playing) {
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      if (tsRef.current === null) tsRef.current = ts;
      const dt = ts - tsRef.current;
      tsRef.current = ts;

      let newProg = prog + dt * speed * 0.022;

      if (newProg >= 100) {
        newProg = 100;
        setProg(100);
        setPlaying(false);
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      setProg(newProg);

      if (trails) {
        const pid = usePlaybookStore.getState().pid;
        const play = getPlay(pid);
        const { pos } = lerp(newProg, play.phases);
        pushTrail(pos);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // Subscribe to playing changes
    const unsub = useAnimationStore.subscribe(
      (state) => {
        if (state.playing && !rafRef.current) {
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
