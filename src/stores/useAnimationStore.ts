import { create } from 'zustand';
import { PositionMap } from '@/data/types';

interface AnimationState {
  prog: number;
  playing: boolean;
  speed: number;
  trails: boolean;
  trailData: PositionMap[];
  setProg: (prog: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setTrails: (trails: boolean) => void;
  pushTrail: (pos: PositionMap) => void;
  clearTrails: () => void;
  reset: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  prog: 0,
  playing: false,
  speed: 1,
  trails: false,
  trailData: [],
  setProg: (prog) => set({ prog }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setTrails: (trails) => set({ trails }),
  pushTrail: (pos) => set((s) => ({ trailData: [...s.trailData.slice(-60), pos] })),
  clearTrails: () => set({ trailData: [] }),
  reset: () => set({ prog: 0, playing: false, trailData: [] }),
}));
