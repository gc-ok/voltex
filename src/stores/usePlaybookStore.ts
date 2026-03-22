import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLAYS } from '@/data/plays';
import { useTeamStore } from './useTeamStore';
import { adaptPlay } from '@/utils/adaptPlay';

export type Tab = 'setup' | 'myteam' | 'library' | 'strategies' | 'quiz';

const CATS = [...new Set(PLAYS.map(p => p.cat))];

interface PlaybookState {
  tab: Tab;
  cat: string;
  pid: string;
  phIdx: number;
  cats: string[];
  isEditing: boolean;
  setTab: (tab: Tab) => void;
  setCat: (cat: string) => void;
  setPid: (pid: string) => void;
  setPhIdx: (idx: number) => void;
  setIsEditing: (v: boolean) => void;

  // Team animation (wizard walkthrough)
  teamAnimPlaying: boolean;
  teamAnimProg: number;
  teamAnimScenario: 'serve' | 'receive';
  teamAnimPhaseIndex: number;
  setTeamAnimPlaying: (playing: boolean) => void;
  setTeamAnimProg: (prog: number) => void;
  setTeamAnimScenario: (scenario: 'serve' | 'receive') => void;
  setTeamAnimPhaseIndex: (idx: number) => void;
}

export const usePlaybookStore = create<PlaybookState>()(
  persist(
    (set) => ({
      tab: 'library' as Tab,
      cat: CATS[0],
      pid: PLAYS[0].id,
      phIdx: 0,
      cats: CATS,
      isEditing: false,
      setTab: (tab) => set({ tab, isEditing: false }),
      setCat: (cat) => set({ cat }),
      setPid: (pid) => set({ pid, phIdx: 0 }),
      setPhIdx: (idx) => set({ phIdx: idx }),
      setIsEditing: (v) => set({ isEditing: v }),

      // Team animation
      teamAnimPlaying: false,
      teamAnimProg: 0,
      teamAnimScenario: 'serve' as const,
      teamAnimPhaseIndex: 0,
      setTeamAnimPlaying: (playing) => set({ teamAnimPlaying: playing }),
      setTeamAnimProg: (prog) => set({ teamAnimProg: prog }),
      setTeamAnimScenario: (scenario) => set({ teamAnimScenario: scenario, teamAnimProg: 0, teamAnimPhaseIndex: 0 }),
      setTeamAnimPhaseIndex: (idx) => set({ teamAnimPhaseIndex: idx }),
    }),
    {
      name: 'voltex-playbook',
      partialize: (state) => ({
        tab: state.tab,
        cat: state.cat,
      }),
    }
  )
);

// Helper: get play by id (system library only)
export function getPlay(id: string) {
  return PLAYS.find(p => p.id === id) || PLAYS[0];
}

// Resolve play: checks team plays first, then system library.
// System plays are adapted to start from the team's current base positions.
export function resolvePlay(id: string) {
  const teamState = useTeamStore.getState();

  // Team plays are already customized — return as-is
  const teamPlay = teamState.teamPlays.find(p => p.id === id);
  if (teamPlay) return teamPlay;

  // System play — adapt to team's base positions if setup is complete
  const play = PLAYS.find(p => p.id === id) || PLAYS[0];
  if (teamState.hasCompletedSetup) {
    const basePos = teamState.getCurrentPositions();
    return adaptPlay(play, basePos);
  }
  return play;
}

export function getFiltered(cat: string) {
  return PLAYS.filter(p => p.cat === cat);
}
