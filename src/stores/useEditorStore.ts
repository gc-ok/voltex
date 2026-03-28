import { create } from 'zustand';
import { Play, PlayerId, PositionMap } from '@/data/types';
import { PLAYS } from '@/data/plays';
import { CW, CH, PR, BR } from '@/data/constants'; 
import { validate, Violation } from '@/utils/validate';
import { usePlaybookStore, resolvePlay } from './usePlaybookStore';

type DragTarget = PlayerId | 'BALL';

interface EditorState {
  edits: Record<string, Play>;
  mods: Record<string, boolean>;
  violations: Violation[];
  dragId: DragTarget | null; 
  dragOff: { x: number; y: number };
  getPlay: (id: string) => Play;
  startDrag: (pid: DragTarget, offsetX: number, offsetY: number) => void; 
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
    if (get().edits[id]) return get().edits[id];
    return resolvePlay(id);
  },

  startDrag: (pid, offsetX, offsetY) => {
    set({ dragId: pid, dragOff: { x: offsetX, y: offsetY } });
  },

  doDrag: (x, y, playId, phIdx) => {
    const { edits, dragId, dragOff } = get();
    if (!dragId) return;

    let editPlay = edits[playId];
    if (!editPlay) {
      const original = resolvePlay(playId);
      if (!original) return;
      editPlay = JSON.parse(JSON.stringify(original));
    } else {
      // 🚨 FIX: Shallow clone the play and phases so React detects the change instantly
      editPlay = { ...editPlay };
      editPlay.phases = [...editPlay.phases];
      editPlay.phases[phIdx] = { ...editPlay.phases[phIdx] };
    }

    const phase = editPlay.phases[phIdx];

    if (dragId === 'BALL') {
       phase.ball = {
         x: Math.max(BR, Math.min(CW - BR, x - dragOff.x)),
         y: Math.max(BR, Math.min(CH - BR, y - dragOff.y)),
       };
    } else {
      if (!phase.pos[dragId]) return;
      phase.pos = { ...phase.pos };
      phase.pos[dragId] = {
        x: Math.max(PR + 4, Math.min(CW - PR - 4, x - dragOff.x)),
        y: Math.max(PR + 4, Math.min(CH - PR - 4, y - dragOff.y)),
      };
    }

    const violations = dragId === 'BALL' ? get().violations : validate(phase.pos, phase.label, editPlay.cat);

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