'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { CW, CH, PR, NET_Y } from '@/data/constants';
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

export function Court() {
  useAnimationLoop();
  useQuizLoop();
  useTeamAnimLoop();

  const svgRef = useRef<SVGSVGElement>(null);
  const teamDrag = useRef<{ pid: PlayerId; ox: number; oy: number } | null>(null);
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

  // Get the right play data (editor may have overrides) — skip in team/setup modes for performance
  const play = isTeam ? null : (isEditing ? useEditorStore.getState().getPlay(pid) : resolvePlay(pid));

  // Compute positions + ball + active phase label
  let positions: PositionMap;
  let ball: XY;
  let violatedIds = new Set<PlayerId>();
  let currentPhaseLabel = '';

  if (isTeam) {
    const key = rotKey(teamSystem, teamRotation);
    const rd = rotationDefaults[key];
    
    if (tab === 'setup' && teamAnimScenario && rd) {
      const phases = teamAnimScenario === 'serve' ? rd.servePhases : rd.receivePhases;
      if (phases?.length) {
        const result = lerp(teamAnimProg, phases);
        positions = result.pos;
        ball = result.ball;
        
        // Safely determine which phase label to show based on progress
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
    // Fallback (should not happen)
    const fallbackPlay = getPlay(pid);
    positions = fallbackPlay.phases[0].pos;
    ball = fallbackPlay.phases[0].ball;
    currentPhaseLabel = fallbackPlay.phases[0].label || '';
  }

  // Tooltip note
  const getNote = useCallback((hoveredPid: PlayerId): string => {
    const st = usePlaybookStore.getState();
    const an = useAnimationStore.getState();
    const curPlay = getPlay(st.pid);
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

  // SVG coordinate helper
  const toSvg = useCallback((e: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * CW,
      y: (e.clientY - r.top) / r.height * CH,
    };
  }, []);

  // Mouse down on player to start drag (edit or team mode)
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const curTab = usePlaybookStore.getState().tab;
    const curIsEditing = usePlaybookStore.getState().isEditing;
    if (!curIsEditing && curTab !== 'myteam' && curTab !== 'setup') return;
    const pt = toSvg(e);
    if (!pt) return;

    // Get positions depending on mode
    let curPos: PositionMap;
    if (curTab === 'myteam' || curTab === 'setup') {
      const pbState = usePlaybookStore.getState();
      if (curTab === 'setup' && pbState.teamAnimScenario) {
        const tKey = rotKey(useTeamStore.getState().system, useTeamStore.getState().rotation);
        const tRd = useTeamStore.getState().rotationDefaults[tKey];
        const tPhases = tRd ? (pbState.teamAnimScenario === 'serve' ? tRd.servePhases : tRd.receivePhases) : [];
        if (tPhases.length > 0) {
          const tResult = lerp(pbState.teamAnimProg, tPhases);
          curPos = tResult.pos;
        } else {
          curPos = useTeamStore.getState().getCurrentPositions();
        }
      } else if (pbState.teamAnimProg > 0 || pbState.teamAnimPlaying) {
        const tKey = rotKey(useTeamStore.getState().system, useTeamStore.getState().rotation);
        const tRd = useTeamStore.getState().rotationDefaults[tKey];
        const tPhases = tRd ? (pbState.teamAnimScenario === 'serve' ? tRd.servePhases : tRd.receivePhases) : [];
        if (tPhases.length > 0) {
          const tResult = lerp(pbState.teamAnimProg, tPhases);
          curPos = tResult.pos;
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
    }

    // Find closest player
    let found: PlayerId | null = null;
    let best = 999;
    PD.forEach(pl => {
      const p = curPos[pl.id];
      if (!p) return;
      const d = Math.sqrt((pt.x - p.x) ** 2 + (pt.y - p.y) ** 2);
      if (d < PR + 10 && d < best) { best = d; found = pl.id; }
    });

    if (found) {
      const p = curPos[found as PlayerId];
      if (p) {
        if (curTab === 'myteam' || curTab === 'setup') {
          teamDrag.current = { pid: found, ox: pt.x - p.x, oy: pt.y - p.y };
        } else {
          useEditorStore.getState().startDrag(found, pt.x - p.x, pt.y - p.y);
        }
        e.preventDefault();
      }
    }
  }, [toSvg]);

  // Mouse move: drag or tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    // Handle team drag
    const curTab = usePlaybookStore.getState().tab;
    if (teamDrag.current && (curTab === 'myteam' || curTab === 'setup')) {
      const pt = toSvg(e);
      if (pt) {
        const nx = Math.max(PR, Math.min(CW - PR, pt.x - teamDrag.current.ox));
        const ny = Math.max(NET_Y + PR, Math.min(CH - PR, pt.y - teamDrag.current.oy));

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
              teamDrag.current.pid,
              nx, ny
            );
            setTooltip(null);
            return;
          }
        }

        useTeamStore.getState().updatePosition(teamDrag.current.pid, nx, ny);
      }
      setTooltip(null);
      return;
    }

    // Handle editor drag
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

    // Handle tooltip
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
      curPos = (useEditorStore.getState().getPlay(curPid).phases[curPhIdx] || getPlay(curPid).phases[0]).pos;
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
  }, [toSvg]);

  const handleMouseUp = useCallback(() => {
    teamDrag.current = null;
    useEditorStore.getState().endDrag();
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    teamDrag.current = null;
    useEditorStore.getState().endDrag();
  }, []);

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12, minHeight: 0 }}>
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

        {/* Ball */}
        {ball && <BallToken x={ball.x} y={ball.y} />}

        {/* Players */}
        {PD.map(pl => {
          const p = positions[pl.id];
          if (!p) return null;
          return (
            <PlayerToken
              key={pl.id}
              player={pl}
              x={p.x}
              y={p.y}
              isAnimating={isAnimating || isQuizAnimating}
              violated={violatedIds.has(pl.id)}
              displayName={playerNames[pl.id]}
            />
          );
        })}

        {/* OFFENSIVE PLAY OVERLAY */}
        {currentPhaseLabel === 'OFFENSIVE PLAY' && (
          <g style={{ pointerEvents: 'none' }}>
            <rect 
              x="0" 
              y="0" 
              width={CW} 
              height={CH} 
              fill="#0a1428" 
            />
            <text 
              x={CW / 2} 
              y={CH / 2} 
              fill="var(--accent)" 
              fontSize="48" 
              fontWeight="900" 
              textAnchor="middle" 
              alignmentBaseline="middle"
              letterSpacing="2"
              style={{ 
                textShadow: '0px 4px 12px rgba(0,0,0,0.8)',
                animation: 'pulse 1.5s infinite alternate' 
              }}
            >
              OFFENSIVE PLAY
            </text>
            <text 
              x={CW / 2} 
              y={(CH / 2) + 40} 
              fill="#ffffff" 
              fontSize="16" 
              fontWeight="700" 
              textAnchor="middle" 
              alignmentBaseline="middle"
              style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.8)' }}
            >
              Ball crosses net → Transitioning to base
            </text>
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <PlayerTooltip
          pid={tooltip.pid}
          x={tooltip.x}
          y={tooltip.y}
          note={getNote(tooltip.pid)}
        />
      )}
    </div>
  );
}