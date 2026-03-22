'use client';

import React from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { QUIZ } from '@/data/quiz';

export function QuizPanel() {
  const tab = usePlaybookStore(s => s.tab);
  const setTab = usePlaybookStore(s => s.setTab);

  const qIdx = useQuizStore(s => s.qIdx);
  const qAns = useQuizStore(s => s.qAns);
  const qScore = useQuizStore(s => s.qScore);
  const qDone = useQuizStore(s => s.qDone);
  const answer = useQuizStore(s => s.answer);
  const next = useQuizStore(s => s.next);
  const restart = useQuizStore(s => s.restart);

  if (tab !== 'quiz') return null;

  // Done screen
  if (qDone) {
    const pct = Math.round(qScore / QUIZ.length * 100);
    return (
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 280,
        background: '#0a1428e8',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: pct >= 70 ? '#10b981' : '#f43f5e', lineHeight: 1, marginBottom: 4 }}>
          {qScore}<span style={{ fontSize: 26, color: '#ffffff40' }}>/{QUIZ.length}</span>
        </div>
        <div style={{ fontSize: 14, color: '#ffffff60', fontWeight: 600, marginBottom: 6 }}>
          {pct}% correct
        </div>
        <div style={{ fontSize: 11, color: '#ffffff40', marginBottom: 20, lineHeight: 1.7 }}>
          {pct >= 80 ? 'Strong volleyball IQ.' : pct >= 60 ? 'Solid — review the plays.' : 'Keep at it.'}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={restart}
            style={{
              background: 'var(--accent)', border: 'none', color: '#000',
              borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 900, cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => setTab('library')}
            style={{
              background: 'none', border: '1px solid var(--border)', color: '#ffffff50',
              borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz question
  const q = QUIZ[qIdx];
  const answered = qAns !== null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 280,
      maxHeight: 'calc(100% - 24px)',
      background: '#0a1428e8',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 14,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffffaa' }}>
          {qIdx + 1} <span style={{ color: '#ffffff60' }}>of {QUIZ.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
            {qScore} pts
          </div>
          <button
            onClick={() => setTab('library')}
            style={{
              background: 'none', border: '1px solid var(--border)', color: '#ffffffaa',
              borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#162040', borderRadius: 4, height: 3, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: 'var(--accent)',
          width: `${(qIdx / QUIZ.length) * 100}%`,
          transition: 'width .3s', borderRadius: 4,
        }} />
      </div>

      {/* Question */}
      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, lineHeight: 1.4, marginBottom: 12 }}>
        {q.q}
      </div>

      {/* Options */}
      {q.opts.map((o, i) => {
        let bg = 'var(--bg-card)';
        let borderColor = 'var(--border)';
        let color = 'var(--text-mid)';

        if (answered) {
          if (i === q.ans) { bg = '#10b98115'; borderColor = '#10b981'; color = '#10b981'; }
          else if (i === qAns && i !== q.ans) { bg = '#ef444415'; borderColor = '#ef4444'; color = '#ef4444'; }
        }

        return (
          <button
            key={i}
            onClick={() => answer(i)}
            disabled={answered}
            style={{
              width: '100%', textAlign: 'left',
              background: bg,
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              padding: '9px 11px',
              marginBottom: 5,
              fontSize: 12,
              fontWeight: 700,
              color,
              lineHeight: 1.3,
              cursor: answered ? 'default' : 'pointer',
              transition: 'all .15s',
            }}
          >
            {o}
          </button>
        );
      })}

      {/* Explanation + Next */}
      {answered && (
        <>
          <div style={{
            marginTop: 10,
            background: '#e8a83e08',
            border: '1px solid #e8a83e25',
            borderRadius: 8,
            padding: '9px 11px',
            fontSize: 10,
            color: '#ffffffb0',
            lineHeight: 1.6,
          }}>
            {q.exp}
          </div>
          <button
            onClick={next}
            style={{
              width: '100%', marginTop: 8,
              background: 'var(--accent)', border: 'none', color: '#000',
              borderRadius: 9, padding: '9px',
              fontSize: 12, fontWeight: 900, letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            {qIdx + 1 < QUIZ.length ? 'Next →' : 'See Results'}
          </button>
        </>
      )}
    </div>
  );
}
