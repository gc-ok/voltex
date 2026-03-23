'use client';

import { useEffect, useRef } from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { rotKey } from '@/data/defaults';

export function useTeamAnimLoop() {
  const rafRef = useRef<number | null>(null);
  const tsRef = useRef<number | null>(null);
  const pauseUntilRef = useRef<number>(0);
  const lastPhaseIdxRef = useRef<number>(0);

  useEffect(() => {
    function tick(ts: number) {
      const { teamAnimPlaying, teamAnimProg, teamAnimScenario, setTeamAnimProg, setTeamAnimPlaying } =
        usePlaybookStore.getState();
      const { system, rotation, rotationDefaults } = useTeamStore.getState();

      if (!teamAnimPlaying) {
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      // Initialization on first frame
      if (tsRef.current === null) {
        tsRef.current = ts;
        pauseUntilRef.current = 0; // Reset pauses
        
        // Figure out what phase index we are currently starting from
        const key = rotKey(system, rotation);
        const rd = rotationDefaults[key];
        const phases = rd ? (teamAnimScenario === 'serve' ? rd.servePhases : rd.receivePhases) : [];
        const totalTransitions = Math.max(1, (phases.length || 1) - 1);
        lastPhaseIdxRef.current = Math.min(totalTransitions, Math.floor((teamAnimProg / 100) * totalTransitions));
      }

      const dt = ts - tsRef.current;
      tsRef.current = ts;

      // 🛑 Pause Check: If we are in a pause window, skip updating progression
      if (ts < pauseUntilRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Fetch current play length dynamically
      const key = rotKey(system, rotation);
      const rd = rotationDefaults[key];
      const phases = rd ? (teamAnimScenario === 'serve' ? rd.servePhases : rd.receivePhases) : [];
      const totalTransitions = Math.max(1, (phases.length || 1) - 1);

      // ⏱️ Dynamic Speed: Force exactly 1.5 seconds per transition
      const totalTime = totalTransitions * 1500;
      const speed = 100 / totalTime;

      let newProg = teamAnimProg + dt * speed;

      if (newProg >= 100) {
        newProg = 100;
        setTeamAnimProg(100);
        setTeamAnimPlaying(false);
        rafRef.current = null;
        tsRef.current = null;
        return;
      }

      // ⏸️ Phase Boundary Check: Did we just hit the next phase?
      const nextBoundaryIdx = lastPhaseIdxRef.current + 1;
      const boundaryProg = (nextBoundaryIdx / totalTransitions) * 100;

      // If we crossed the threshold this frame, snap to it and pause!
      if (newProg >= boundaryProg && teamAnimProg < boundaryProg) {
        newProg = boundaryProg; // Snap exactly to the phase frame
        lastPhaseIdxRef.current = nextBoundaryIdx;
        pauseUntilRef.current = ts + 1000; // Pause for exactly 1000ms (1 second)
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