import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Rally, Phase } from '@/data/types';
import { DEFAULT_RALLIES } from '@/data/rallies';
import { flattenRally } from '@/utils/transitions';
import { resolvePlay } from './usePlaybookStore';

// ═══════════════════════════════════════════════════════════════
// Rally Store — manage rally sequences and their flattened phases
// ═══════════════════════════════════════════════════════════════

interface RallyState {
  rallies: Rally[];
  activeRallyId: string | null;
  flatPhases: Phase[] | null;
  stepBoundaries: number[];

  // Actions
  setActiveRally: (id: string | null) => void;
  flattenActiveRally: () => void;
  createRally: (name: string) => void;
  addStep: (rallyId: string, playId: string) => void;
  removeStep: (rallyId: string, stepIdx: number) => void;
  moveStep: (rallyId: string, fromIdx: number, toIdx: number) => void;
  deleteRally: (id: string) => void;
}

let nextId = 1;

export const useRallyStore = create<RallyState>()(
  persist(
    (set, get) => ({
      rallies: [...DEFAULT_RALLIES],
      activeRallyId: null,
      flatPhases: null,
      stepBoundaries: [],

      setActiveRally: (id) => {
        set({ activeRallyId: id, flatPhases: null, stepBoundaries: [] });
        if (id) {
          get().flattenActiveRally();
        }
      },

      flattenActiveRally: () => {
        const { rallies, activeRallyId } = get();
        const rally = rallies.find(r => r.id === activeRallyId);
        if (!rally) {
          set({ flatPhases: null, stepBoundaries: [] });
          return;
        }
        const { phases, boundaries } = flattenRally(rally, resolvePlay);
        set({ flatPhases: phases, stepBoundaries: boundaries });
      },

      createRally: (name) => {
        const id = `rally_custom_${nextId++}`;
        set(s => ({
          rallies: [...s.rallies, { id, name, desc: 'Custom rally', steps: [] }],
        }));
      },

      addStep: (rallyId, playId) => set(s => ({
        rallies: s.rallies.map(r =>
          r.id === rallyId
            ? { ...r, steps: [...r.steps, { playId }] }
            : r
        ),
      })),

      removeStep: (rallyId, stepIdx) => set(s => ({
        rallies: s.rallies.map(r =>
          r.id === rallyId
            ? { ...r, steps: r.steps.filter((_, i) => i !== stepIdx) }
            : r
        ),
      })),

      moveStep: (rallyId, fromIdx, toIdx) => set(s => ({
        rallies: s.rallies.map(r => {
          if (r.id !== rallyId) return r;
          const steps = [...r.steps];
          const [moved] = steps.splice(fromIdx, 1);
          steps.splice(toIdx, 0, moved);
          return { ...r, steps };
        }),
      })),

      deleteRally: (id) => set(s => ({
        rallies: s.rallies.filter(r => r.id !== id),
        activeRallyId: s.activeRallyId === id ? null : s.activeRallyId,
        flatPhases: s.activeRallyId === id ? null : s.flatPhases,
        stepBoundaries: s.activeRallyId === id ? [] : s.stepBoundaries,
      })),
    }),
    {
      name: 'voltex-rallies',
      partialize: (state) => ({
        rallies: state.rallies,
      }),
    }
  )
);
