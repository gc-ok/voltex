'use client';

import React, { useRef, useCallback } from 'react';
import { CW, CH, PR } from '@/data/constants';
import { PD } from '@/data/players';
import { PlayerId, PositionMap, XY } from '@/data/types';
import { usePlaybookStore, getPlay } from '@/stores/usePlaybookStore';
import { useAnimationStore } from '@/stores/useAnimationStore';
import { lerp, phIdxFromProg } from '@/utils/lerp';
import { CourtBackground } from './CourtBackground';
import { PlayerToken } from './PlayerToken';
import { BallToken } from './BallToken';
import { GhostTrails } from './GhostTrails';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';
import { PlayerTooltip } from './PlayerTooltip';

export function Court() {
  useAnimationLoop();

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
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

  const play = getPlay(pid);
  const isAnimating = tab === 'main' && (playing || prog > 0);

  // Compute positions
  let positions: PositionMap;
  let ball: XY;

  if (isAnimating) {
    const result = lerp(prog, play.phases);
    positions = result.pos;
    ball = result.ball;
  } else {
    const phase = play.phases[phIdx] || play.phases[0];
    positions = phase.pos;
    ball = phase.ball;
  }

  // Tooltip: get note for hovered player
  const getNote = useCallback((hoveredPid: PlayerId): string => {
    if (isAnimating) {
      const n = play.phases.length;
      const ph = play.phases[phIdxFromProg(prog, n)] || play.phases[0];
      return ph?.notes?.[hoveredPid] || '';
    }
    const phase = play.phases[phIdx] || play.phases[0];
    return phase?.notes?.[hoveredPid] || '';
  }, [play, phIdx, prog, isAnimating]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width * CW;
    const my = (e.clientY - r.top) / r.height * CH;

    const { pid: curPid, phIdx: curPhIdx } = usePlaybookStore.getState();
    const { prog: curProg, playing: curPlaying } = useAnimationStore.getState();
    const curPlay = getPlay(curPid);
    const curIsAnimating = curPlaying || curProg > 0;

    let curPos: PositionMap;
    if (curIsAnimating) {
      curPos = lerp(curProg, curPlay.phases).pos;
    } else {
      curPos = (curPlay.phases[curPhIdx] || curPlay.phases[0]).pos;
    }

    let found: PlayerId | null = null;
    let best = 999;
    PD.forEach(pl => {
      const p = curPos[pl.id];
      if (!p) return;
      const d = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
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
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CW} ${CH}`}
        style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: 8 }}
        onMouseMove={handleMouseMove}
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
              isAnimating={isAnimating}
            />
          );
        })}
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
