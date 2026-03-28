'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { CW, CH, PR, BR, NET_Y } from '@/data/constants'; // 👈 Added BR here
import { PD } from '@/data/players';
import { PlayerId, PositionMap, XY } from '@/data/types';
import { usePlaybookStore, getPlay, resolvePlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { useRallyStore } from '@/stores/useRallyStore';
import { QUIZ } from '@/data/quiz';
import { lerp, phIdxFromProg } from '@/utils/lerp';
import { rotKey } from '@/data/defaults';
import { FACTORY_DEFAULTS } from '@/data/defaults';
import { CourtBackground } from './CourtBackground';
import { PlayerToken } from './PlayerToken';
import { BallToken } from './BallToken';
import { GhostTrails } from './GhostTrails';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';
import { useQuizLoop } from '@/hooks/useQuizLoop';
import { useTeamAnimLoop } from '@/hooks/useTeamAnimLoop';
import { PlayerTooltip } from './PlayerTooltip';
import { validateRotation } from '@/utils/validate';

export function Court() {
  useAnimationLoop();
  useQuizLoop();
  useTeamAnimLoop();

  const svgRef = useRef<SVGSVGElement>(null);
  // 👈 Allow 'BALL' as a valid drag target
  const teamDrag = useRef<{ pid: PlayerId | 'BALL'; ox: number; oy: number } | null>(null);
  const [tooltip, setTooltip] = React.useState<{
    pid: PlayerId; x: number; y: number;
  } | null>(null);

  const pid = usePlaybookStore(s => s.pid);
  const phIdx = usePlaybookStore(s => s.phIdx);
  const tab = usePlaybookStore(s => s.tab);
  const prog = useAnimationStore(s => s.prog);
  const playing = useAnimationStore(s => s.playing);
  const trails = useAnimationStore(s => s.trails);
  const trailData = useAnimationStore(s => s.trailData);
  const editorViolations = useEditorStore(s => s.violations);
  const dragId = useEditorStore(s => s.dragId);
  const quizProg = useQuizStore(s => s.quizProg);
  const qIdx = useQuizStore(s => s.qIdx);
  const qDone = useQuizStore(s => s.qDone);
  
  // 👈 THE REACTIVITY FIX: Subscribing to edits directly ensures Court re-renders on every ball drag frame!
  const currentEditPlay = useEditorStore(s => s.edits[pid]);
  
  const setupStep = useTeamStore(s => s.setupStep);
  const playerNames = useTeamStore(s => s.playerNames);
  const rallyPhases = useRallyStore(s => s.flatPhases);

  const teamSystem = useTeamStore(s => s.system);
  const teamRotation = useTeamStore(s => s.rotation);
  const teamFormationCtx = useTeamStore(s => s.formationCtx);
  const rotationDefaults = useTeamStore(s => s.rotationDefaults);
  const updateTeamPos = useTeamStore(s => s.updatePosition);

  const teamAnimPlaying = usePlaybookStore(s => s.teamAnimPlaying);
  const teamAnimProg = usePlaybookStore(s => s.teamAnimProg);
  const teamAnimScenario = usePlaybookStore(s => s.teamAnimScenario);
  const teamAnimPhaseIndex = usePlaybookStore(s => s.teamAnimPhaseIndex);

  const teamPositions = useMemo(() => {
    const key = rotKey(teamSystem, teamRotation);
    const rd = rotationDefaults[key];
    return rd ? rd[teamFormationCtx] : FACTORY_DEFAULTS['5-1-1']?.serveReceive ?? {};
  }, [teamSystem, teamRotation, teamFormationCtx, rotationDefaults]);

  const isEditing = usePlaybookStore(s => s.isEditing);
  const isQuiz = tab === 'quiz';
  const isLibOrStrat = tab === 'library' || tab === 'strategies';
  const isTeam = tab === 'myteam' || tab === 'setup';
  const isAnimating = isLibOrStrat && (playing || prog > 0);
  const isQuizAnimating = isQuiz && !qDone;

  // 👈 Use currentEditPlay if we are editing so the state updates live
  const play = isTeam ? null : (isEditing ? (currentEditPlay || resolvePlay(pid)) : resolvePlay(pid));

  let positions: PositionMap;
  let ball: XY | null = null;
  let violatedIds = new Set<PlayerId>();
  let currentPhaseLabel = '';
  let activeViolations: string[] = [];

  if (isTeam) {
    const key = rotKey(teamSystem, teamRotation);
    const rd = rotationDefaults[key];
    
    if (tab === 'setup' && teamAnimScenario && rd) {
      const phases = teamAnimScenario === 'serve' ? rd.servePhases : rd.receivePhases;
      if (phases?.length) {
        const result = lerp(teamAnimProg, phases);
        positions = result.pos;
        ball = result.ball;
        
        const derivedIdx = phIdxFromProg(teamAnimProg, phases.length);
        const activeIdx = teamAnimPlaying ? derivedIdx : teamAnimPhaseIndex;
        currentPhaseLabel = phases[activeIdx]?.label || '';
      } else {
        positions = teamPositions;
        ball = { x: -100, y: -100 };
      }
    } else {
      positions = teamPositions;
      ball = { x: -100, y: -100 };
    }
  } else if (isAnimating && play) {
    const phases = rallyPhases || play.phases;
    const result = lerp(prog, phases);
    positions = result.pos;
    ball = result.ball;
    currentPhaseLabel = phases[phIdxFromProg(prog, phases.length)]?.label || '';
  } else if (isQuizAnimating) {
    const q = QUIZ[qIdx];
    const fallbackPlay = play || getPlay(pid);
    const qPlay = q ? getPlay(q.pid) : fallbackPlay;
    const result = lerp(quizProg, qPlay.phases);
    positions = result.pos;
    ball = result.ball;
    currentPhaseLabel = qPlay.phases[phIdxFromProg(quizProg, qPlay.phases.length)]?.label || '';
  } else if (play) {
    const phase = play.phases[phIdx] || play.phases[0];
    positions = phase.pos;
    ball = phase.ball;
    currentPhaseLabel = phase.label || '';
    if (isEditing) {
      violatedIds = new Set(editorViolations.flatMap(v => v.ids));
    }
  } else {
    const fallbackPlay = getPlay(pid);
    positions = fallbackPlay.phases[0].pos;
    ball = fallbackPlay.phases[0].ball;
    currentPhaseLabel = fallbackPlay.phases[0].label || '';
  }

  const isPhaseOne = currentPhaseLabel.toLowerCase().includes('serve receive') || 
                     currentPhaseLabel.toLowerCase().includes('pre-serve');
  const isAnimationStopped = !teamAnimPlaying && teamAnimProg === 0;

  if (tab === 'setup' && isPhaseOne && isAnimationStopped) {
    const isServing = teamAnimScenario === 'serve';
    const rotationViolations = validateRotation(positions, teamRotation, isServing);
    rotationViolations.forEach(v => {
      violatedIds.add(v.ids[0]);
      violatedIds.add(v.ids[1]);
      activeViolations.push(v.msg); 
    });
  } else if (isEditing) {
    violatedIds = new Set(editorViolations.flatMap(v => v.ids));
  }

  const getNote = useCallback((hoveredPid: PlayerId): string => {
    const st = usePlaybookStore.getState();
    const an = useAnimationStore.getState();
    
    // 👈 Read from edits if editing, else use saved play
    const isEd = st.isEditing;
    const curPlay = isEd ? (useEditorStore.getState().edits[st.pid] || getPlay(st.pid)) : getPlay(st.pid);
    
    const curIsAnimating = (st.tab === 'library' || st.tab === 'strategies') && (an.playing || an.prog > 0);

    if (curIsAnimating) {
      const n = curPlay.phases.length;
      const ph = curPlay.phases[phIdxFromProg(an.prog, n)] || curPlay.phases[0];
      return ph?.notes?.[hoveredPid] || '';
    }
    if (st.tab === 'quiz' && !useQuizStore.getState().qDone) {
      const q = QUIZ[useQuizStore.getState().qIdx];
      if (q) {
        const qPlay = getPlay(q.pid);
        const ph = qPlay.phases[phIdxFromProg(useQuizStore.getState().quizProg, qPlay.phases.length)] || qPlay.phases[0];
        return ph?.notes?.[hoveredPid] || '';
      }
    }
    const phase = curPlay.phases[st.phIdx] || curPlay.phases[0];
    return phase?.notes?.[hoveredPid] || '';
  }, []);

  const toSvg = useCallback((e: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * CW,
      y: (e.clientY - r.top) / r.height * CH,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const curTab = usePlaybookStore.getState().tab;
    const curIsEditing = usePlaybookStore.getState().isEditing;
    if (!curIsEditing && curTab !== 'myteam' && curTab !== 'setup') return;
    const pt = toSvg(e);
    if (!pt) return;

    let curPos: PositionMap;
    let curBall: XY | null = null; 

    if (curTab === 'myteam' || curTab === 'setup') {
      const pbState = usePlaybookStore.getState();
      const tKey = rotKey(useTeamStore.getState().system, useTeamStore.getState().rotation);
      const tRd = useTeamStore.getState().rotationDefaults[tKey];
      
      if (curTab === 'setup' && pbState.teamAnimScenario) {
        const tPhases = tRd ? (pbState.teamAnimScenario === 'serve' ? tRd.servePhases : tRd.receivePhases) : [];
        if (tPhases.length > 0) {
          const tResult = lerp(pbState.teamAnimProg, tPhases);
          curPos = tResult.pos;
          curBall = tResult.ball; // 👈 Extract ball state for setup wizard
        } else {
          curPos = useTeamStore.getState().getCurrentPositions();
        }
      } else if (pbState.teamAnimProg > 0 || pbState.teamAnimPlaying) {
        const tPhases = tRd ? (pbState.teamAnimScenario === 'serve' ? tRd.servePhases : tRd.receivePhases) : [];
        if (tPhases.length > 0) {
          const tResult = lerp(pbState.teamAnimProg, tPhases);
          curPos = tResult.pos;
          curBall = tResult.ball;
        } else {
          curPos = useTeamStore.getState().getCurrentPositions();
        }
      } else {
        curPos = useTeamStore.getState().getCurrentPositions();
      }
    } else {
      const { pid: curPid, phIdx: curPhIdx } = usePlaybookStore.getState();
      const curPlay = useEditorStore.getState().getPlay(curPid);
      const phase = curPlay.phases[curPhIdx] || curPlay.phases[0];
      curPos = phase.pos;
      curBall = phase.ball;
    }

    let found: PlayerId | 'BALL' | null = null;
    let best = 999;
    
    PD.forEach(pl => {
      const p = curPos[pl.id];
      if (!p) return;
      const d = Math.sqrt((pt.x - p.x) ** 2 + (pt.y - p.y) ** 2);
      if (d < PR + 10 && d < best) { best = d; found = pl.id; }
    });

    // 👈 Check for ball drag authorization
    const pbState = usePlaybookStore.getState();
    const canDragBall = curIsEditing || (curTab === 'setup' && pbState.teamAnimScenario);
    
    if (curBall && canDragBall) {
       const bd = Math.sqrt((pt.x - curBall.x) ** 2 + (pt.y - curBall.y) ** 2);
       if (bd < 25 && bd < best) {
           found = 'BALL';
       }
    }

    if (found) {
      if (curTab === 'myteam' || curTab === 'setup') {
        const isBall = found === 'BALL';
        // Add non-null assertions (!) just in case TS complains about these too
        const ox = pt.x - (isBall ? curBall!.x : curPos[found as PlayerId]!.x);
        const oy = pt.y - (isBall ? curBall!.y : curPos[found as PlayerId]!.y);
        teamDrag.current = { pid: found, ox, oy };
      } else {
        if (found === 'BALL') {
           useEditorStore.getState().startDrag('BALL', pt.x - curBall!.x, pt.y - curBall!.y);
        } else {
           const p = curPos[found as PlayerId];
           // ✅ FIX: Added a safety check for 'p'
           if (p) {
             useEditorStore.getState().startDrag(found as PlayerId, pt.x - p.x, pt.y - p.y);
           }
        }
      }
      e.preventDefault();
    }
  }, [toSvg, currentEditPlay]); // Added currentEditPlay to dependencies

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const curTab = usePlaybookStore.getState().tab;
    
    if (teamDrag.current && (curTab === 'myteam' || curTab === 'setup')) {
      const pt = toSvg(e);
      if (pt) {
        const dragPid = teamDrag.current.pid;
        const isBall = dragPid === 'BALL';
        const radius = isBall ? BR : PR;
        
        // 👈 Ball doesn't have the NET_Y constraint, allowing you to drag it across the net!
        const nx = Math.max(radius, Math.min(CW - radius, pt.x - teamDrag.current.ox));
        const ny = Math.max(isBall ? radius : NET_Y + PR, Math.min(CH - radius, pt.y - teamDrag.current.oy));

        const pbState = usePlaybookStore.getState();
        if (!pbState.teamAnimPlaying && (pbState.teamAnimProg > 0 || pbState.teamAnimProg === 0) && curTab === 'setup') {
          const tKey = rotKey(useTeamStore.getState().system, useTeamStore.getState().rotation);
          const tRd = useTeamStore.getState().rotationDefaults[tKey];
          const tPhases = tRd ? (pbState.teamAnimScenario === 'serve' ? tRd.servePhases : tRd.receivePhases) : [];
          if (tPhases.length > 0) {
            const phIdx = phIdxFromProg(pbState.teamAnimProg, tPhases.length);
            useTeamStore.getState().updatePhasePosition(
              useTeamStore.getState().rotation,
              pbState.teamAnimScenario,
              phIdx,
              dragPid, // Safely handles 'BALL' now
              nx, ny
            );
            setTooltip(null);
            return;
          }
        }

        if (!isBall) {
          useTeamStore.getState().updatePosition(dragPid as PlayerId, nx, ny);
        }
      }
      setTooltip(null);
      return;
    }

    const { dragId: dId } = useEditorStore.getState();
    if (dId && usePlaybookStore.getState().isEditing) {
      const pt = toSvg(e);
      if (pt) {
        const { pid: curPid, phIdx: curPhIdx } = usePlaybookStore.getState();
        useEditorStore.getState().doDrag(pt.x, pt.y, curPid, curPhIdx);
      }
      setTooltip(null);
      return;
    }

    const pt = toSvg(e);
    if (!pt) return;

    const { pid: curPid, phIdx: curPhIdx } = usePlaybookStore.getState();
    const { prog: curProg, playing: curPlaying } = useAnimationStore.getState();
    const curIsAnimating = (curTab === 'library' || curTab === 'strategies') && (curPlaying || curProg > 0);
    const isQuizAnim = curTab === 'quiz' && !useQuizStore.getState().qDone;

    let curPos: PositionMap;
    if (curIsAnimating) {
      curPos = lerp(curProg, getPlay(curPid).phases).pos;
    } else if (isQuizAnim) {
      const q = QUIZ[useQuizStore.getState().qIdx];
      curPos = q ? lerp(useQuizStore.getState().quizProg, getPlay(q.pid).phases).pos : (getPlay(curPid).phases[curPhIdx] || getPlay(curPid).phases[0]).pos;
    } else if (usePlaybookStore.getState().isEditing) {
      // 👈 Use the live editing copy if it exists for accurate tooltips
      curPos = (currentEditPlay?.phases[curPhIdx] || getPlay(curPid).phases[curPhIdx] || getPlay(curPid).phases[0]).pos;
    } else {
      curPos = (getPlay(curPid).phases[curPhIdx] || getPlay(curPid).phases[0]).pos;
    }

    let found: PlayerId | null = null;
    let best = 999;
    PD.forEach(pl => {
      const p = curPos[pl.id];
      if (!p) return;
      const d = Math.sqrt((pt.x - p.x) ** 2 + (pt.y - p.y) ** 2);
      if (d < PR + 12 && d < best) { best = d; found = pl.id; }
    });

    if (found) {
      const wrapRect = svg.parentElement?.getBoundingClientRect();
      if (wrapRect) {
        let lx = e.clientX - wrapRect.left + 14;
        let ly = e.clientY - wrapRect.top - 24;
        if (lx + 220 > wrapRect.width) lx = e.clientX - wrapRect.left - 230;
        if (ly < 0) ly = 6;
        setTooltip({ pid: found, x: lx, y: ly });
      }
    } else {
      setTooltip(null);
    }
  }, [toSvg, currentEditPlay]); // Added currentEditPlay to dependencies

  const handleMouseUp = useCallback(() => {
    teamDrag.current = null;
    useEditorStore.getState().endDrag();
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    teamDrag.current = null;
    useEditorStore.getState().endDrag();
  }, []);

  // 🌟 THE COURT HIDING LOGIC
  const isSetupEarly = tab === 'setup' && setupStep < 5;
  const hideCourt = isSetupEarly && !teamAnimPlaying;

  // 🌟 BALL DRAGGING UI LOGIC
  const canDragBall = isEditing || (tab === 'setup' && !!teamAnimScenario);
  const isDraggingBall = dragId === 'BALL' || teamDrag.current?.pid === 'BALL';

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12, minHeight: 0 }}>
      
      {/* INFORMATIVE OVERLAY FOR SETUP WIZARD PREVIEWS */}
      {tab === 'setup' && !hideCourt && (
        <div style={{
          position: 'absolute', top: '50%', left: '24px', zIndex: 10,
          transform: 'translateY(-50%)',
          pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 10,
          alignItems: 'flex-start',
          maxWidth: '320px' 
        }}>
          {/* Top Badge: Previewing Rotation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              background: 'var(--accent)', color: '#000', 
              padding: '6px 14px', borderRadius: 6, fontWeight: 800, fontSize: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              Previewing {teamRotation ? `Rotation ${teamRotation}` : 'Play'}
            </div>
          </div>

          {/* Phase Label */}
          <div style={{ 
            fontSize: 28, fontWeight: 900, color: '#f8fafc', 
            background: '#0f172a', 
            padding: '10px 20px', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            border: '1px solid #475569',
            letterSpacing: 0.5, lineHeight: 1.1
          }}>
            {currentPhaseLabel}
          </div>

          {/* ERROR ALERT BOX */}
          {activeViolations.length > 0 && (
            <div style={{
              marginTop: 8,
              background: '#7f1d1d',
              border: '1px solid #ef4444',
              borderRadius: 8,
              padding: '12px 16px',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              pointerEvents: 'auto'
            }}>
              <div style={{ 
                fontWeight: 800, fontSize: 14, textTransform: 'uppercase', 
                letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.2)', 
                paddingBottom: 6, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6
              }}>
                ⚠️ Rotation Fault
              </div>
              {activeViolations.map((msg, i) => (
                <div key={i} style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: '#fca5a5' }}>
                  • {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SVG WRAPPER WITH OPACITY FADE */}
      <div style={{ 
        height: '100%', width: '100%', 
        display: 'flex', justifyContent: 'center', 
        opacity: hideCourt ? 0 : 1, 
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
      }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CW} ${CH}`}
          style={{ display: 'block', height: '100%', width: 'auto', maxWidth: '100%', aspectRatio: `${CW} / ${CH}`, borderRadius: 8, margin: '0 auto', flexShrink: 0 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <CourtBackground />

          {/* Ghost trails */}
          {trails && <GhostTrails trailData={trailData} />}

          {/* 1. Render Players FIRST so they are in the background */}
          {PD.map(pl => {
            const p = positions[pl.id];
            if (!p) return null;
            
            // 👈 Read the play-specific name override, fallback to the Team Roster name
            const currentPlayObj = isEditing ? (currentEditPlay || getPlay(pid)) : getPlay(pid);
            const displayName = currentPlayObj?.playerNames?.[pl.id] || playerNames[pl.id];

            return (
              <PlayerToken
                key={pl.id}
                player={pl}
                x={p.x}
                y={p.y}
                isAnimating={isAnimating || isQuizAnimating}
                violated={violatedIds.has(pl.id)}
                displayName={displayName}
              />
            );
          })}

          {/* 2. Render the Ball AFTER the players so it stays on top! */}
          {ball && <BallToken x={ball.x} y={ball.y} isDraggable={canDragBall} isDragging={isDraggingBall} />}

          {/* OFFENSIVE PLAY OVERLAY */}
          {currentPhaseLabel === 'OFFENSIVE PLAY' && tab !== 'setup' && (
            <g style={{ pointerEvents: 'none' }}>
              <rect x="0" y="0" width={CW} height={CH} fill="rgba(15, 23, 42, 0.85)" />
              <text x={CW / 2} y={CH / 2} fill="#d4af37" fontSize="48" fontWeight="900" textAnchor="middle" alignmentBaseline="middle" letterSpacing="2" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>
                OFFENSIVE PLAY
              </text>
              <text x={CW / 2} y={(CH / 2) + 40} fill="#f8fafc" fontSize="18" fontWeight="600" textAnchor="middle" alignmentBaseline="middle" style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.5)' }}>
                Ball crosses net → Transitioning to base
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && !hideCourt && (
        <PlayerTooltip pid={tooltip.pid} x={tooltip.x} y={tooltip.y} note={getNote(tooltip.pid)} />
      )}
    </div>
  );
}