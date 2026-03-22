'use client';

import React from 'react';
import { usePlaybookStore, getPlay, resolvePlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useRallyStore } from '@/stores/useRallyStore';
import { QUIZ } from '@/data/quiz';
import { phIdxFromProg } from '@/utils/lerp';

export function BottomTimeline() {
  const tab = usePlaybookStore(s => s.tab);
  const pid = usePlaybookStore(s => s.pid);
  const phIdx = usePlaybookStore(s => s.phIdx);
  const setPhIdx = usePlaybookStore(s => s.setPhIdx);
  const prog = useAnimationStore(s => s.prog);
  const playing = useAnimationStore(s => s.playing);
  const setProg = useAnimationStore(s => s.setProg);
  const quizProg = useQuizStore(s => s.quizProg);
  const qIdx = useQuizStore(s => s.qIdx);
  const qDone = useQuizStore(s => s.qDone);

  const isEditing = usePlaybookStore(s => s.isEditing);
  const isLibOrStrat = tab === 'library' || tab === 'strategies';
  const isQuiz = tab === 'quiz';

  // Main animation timeline
  if (isLibOrStrat && (playing || prog > 0)) {
    const rallyPhases = useRallyStore.getState().flatPhases;
    const stepBoundaries = useRallyStore.getState().stepBoundaries;
    const play = resolvePlay(pid);
    const phases = rallyPhases || play.phases;
    const n = phases.length;
    const currentLabel = phases[phIdxFromProg(prog, n)]?.label?.toUpperCase() || '';
    const isRally = !!rallyPhases;

    return (
      <div style={{
        height: 36, display: 'flex', alignItems: 'center',
        padding: '0 16px', background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border)', gap: 12, flexShrink: 0,
      }}>
        {/* Phase dots — for regular plays, or step boundary markers for rallies */}
        {isRally ? (
          stepBoundaries.map((bIdx, i) => {
            const t = n > 1 ? bIdx * (100 / (n - 1)) : 0;
            const active = Math.abs(t - prog) < (100 / (n * 2));
            return (
              <div key={i} style={{
                width: active ? 10 : 8, height: active ? 10 : 8, borderRadius: '50%',
                background: active ? 'var(--accent)' : '#2a4a6e',
                border: '1px solid var(--accent)',
                flexShrink: 0, transition: 'all .15s',
              }} />
            );
          })
        ) : (
          n > 1 && phases.map((_, i) => {
            const t = i * (100 / (n - 1));
            const active = Math.abs(t - prog) < (100 / (n * 2));
            return (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: active ? 'var(--accent)' : '#1e3055',
                flexShrink: 0, transition: 'background .15s',
              }} />
            );
          })
        )}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1, minWidth: 80 }}>
          {currentLabel}
        </span>
        <input
          type="range" min={0} max={100} step={0.5}
          value={prog} onChange={e => setProg(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
          {Math.round(prog)}%
        </span>
      </div>
    );
  }

  // Editor phase pills
  if (isEditing) {
    const play = getPlay(pid);
    return (
      <div style={{
        borderTop: '1px solid var(--border)', background: 'var(--bg-deep)',
        padding: '8px 20px', flexShrink: 0, overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 'max-content' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginRight: 6 }}>
            Phases
          </span>
          {play.phases.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: '#ffffff20', padding: '0 2px' }}>›</span>}
              <button
                onClick={() => setPhIdx(i)}
                style={{
                  background: i === phIdx ? 'var(--accent)' : 'var(--bg-card)',
                  color: i === phIdx ? '#000' : 'var(--text-mid)',
                  border: `1px solid ${i === phIdx ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                }}
              >
                {i + 1}. {p.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Quiz looping timeline
  if (isQuiz && !qDone) {
    const q = QUIZ[qIdx];
    const qPlay = q ? getPlay(q.pid) : getPlay(pid);
    const qn = qPlay.phases.length;
    const qPh = phIdxFromProg(quizProg, qn);

    return (
      <div style={{
        borderTop: '1px solid var(--border)', background: 'var(--bg-deep)',
        padding: '7px 20px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
            {qPlay.phases[qPh]?.label || ''}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
            Looping
          </span>
        </div>
        <div style={{ position: 'relative', height: 12, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: '#162040', borderRadius: 2 }} />
          <div style={{
            position: 'absolute', left: 0, height: 3,
            background: 'linear-gradient(to right,#1a4a9e,#e8a83e)',
            borderRadius: 2, width: `${quizProg}%`,
          }} />
        </div>
      </div>
    );
  }

  return null;
}
