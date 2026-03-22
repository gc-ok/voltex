import { create } from 'zustand';
import { Play, PlayerId, PositionMap } from '@/data/types';
import { PLAYS } from '@/data/plays';
import { CW, CH, PR } from '@/data/constants';
import { validate, Violation } from '@/utils/validate';

interface EditorState {
  edits: Record<string, Play>;
  mods: Record<string, boolean>;
  violations: Violation[];
  dragId: PlayerId | null;
  dragOff: { x: number; y: number };
  getPlay: (id: string) => Play;
  startDrag: (pid: PlayerId, offsetX: number, offsetY: number) => void;
  doDrag: (x: number, y: number, playId: string, phIdx: number) => void;
  endDrag: () => void;
  resetEdits: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  edits: {},
  mods: {},
  violations: [],
  dragId: null,
  dragOff: { x: 0, y: 0 },

  getPlay: (id) => {
    return get().edits[id] || PLAYS.find(p => p.id === id) || PLAYS[0];
  },

  startDrag: (pid, offsetX, offsetY) => {
    set({ dragId: pid, dragOff: { x: offsetX, y: offsetY } });
  },

  doDrag: (x, y, playId, phIdx) => {
    const { edits, dragId, dragOff } = get();
    if (!dragId) return;

    // Create edit copy if needed
    let editPlay = edits[playId];
    if (!editPlay) {
      const original = PLAYS.find(p => p.id === playId);
      if (!original) return;
      editPlay = JSON.parse(JSON.stringify(original));
    }

    const phase = editPlay.phases[phIdx] || editPlay.phases[0];
    phase.pos[dragId] = {
      x: Math.max(PR + 4, Math.min(CW - PR - 4, x - dragOff.x)),
      y: Math.max(PR + 4, Math.min(CH - PR - 4, y - dragOff.y)),
    };

    const violations = validate(phase.pos, phase.label, editPlay.cat);

    set({
      edits: { ...edits, [playId]: editPlay },
      mods: { ...get().mods, [playId]: true },
      violations,
    });
  },

  endDrag: () => set({ dragId: null }),

  resetEdits: (id) => {
    const { edits, mods } = get();
    const newEdits = { ...edits };
    const newMods = { ...mods };
    delete newEdits[id];
    delete newMods[id];
    set({ edits: newEdits, mods: newMods, violations: [] });
  },
}));
