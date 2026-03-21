import { create } from 'zustand';
import { PLAYS } from '@/data/plays';

export type Tab = 'main' | 'edit' | 'quiz';

const CATS = [...new Set(PLAYS.map(p => p.cat))];

interface PlaybookState {
  tab: Tab;
  cat: string;
  pid: string;
  phIdx: number;
  cats: string[];
  setTab: (tab: Tab) => void;
  setCat: (cat: string) => void;
  setPid: (pid: string) => void;
  setPhIdx: (idx: number) => void;
}

export const usePlaybookStore = create<PlaybookState>((set) => ({
  tab: 'main',
  cat: CATS[0],
  pid: PLAYS[0].id,
  phIdx: 0,
  cats: CATS,
  setTab: (tab) => set({ tab }),
  setCat: (cat) => set({ cat }),
  setPid: (pid) => set({ pid, phIdx: 0 }),
  setPhIdx: (idx) => set({ phIdx: idx }),
}));

// Helper: get play by id
export function getPlay(id: string) {
  return PLAYS.find(p => p.id === id) || PLAYS[0];
}

export function getFiltered(cat: string) {
  return PLAYS.filter(p => p.cat === cat);
}
