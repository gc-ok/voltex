import { create } from 'zustand';
import { QUIZ } from '@/data/quiz';

interface QuizState {
  qIdx: number;
  qAns: number | null;
  qScore: number;
  qDone: boolean;
  quizProg: number;
  answer: (idx: number) => void;
  next: () => void;
  restart: () => void;
  setQuizProg: (p: number) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  qIdx: 0,
  qAns: null,
  qScore: 0,
  qDone: false,
  quizProg: 0,

  answer: (idx) => {
    const { qIdx, qAns, qScore } = get();
    if (qAns !== null) return; // already answered
    const q = QUIZ[qIdx];
    set({
      qAns: idx,
      qScore: idx === q.ans ? qScore + 1 : qScore,
    });
  },

  next: () => {
    const { qIdx } = get();
    if (qIdx + 1 >= QUIZ.length) {
      set({ qDone: true });
    } else {
      set({ qIdx: qIdx + 1, qAns: null });
    }
  },

  restart: () => set({ qIdx: 0, qAns: null, qScore: 0, qDone: false, quizProg: 0 }),

  setQuizProg: (p) => set({ quizProg: p }),
}));
