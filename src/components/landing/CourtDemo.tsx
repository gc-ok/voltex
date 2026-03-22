'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, PlayerId, XY, PositionMap } from '@/data/types';
import { PD } from '@/data/players';
import { CW, CH, NET_Y, PR, BR } from '@/data/constants';

// Inline ease function to keep this standalone
function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerpPos(prog: number, phases: Play['phases']): { pos: PositionMap; ball: XY } {
  const n = phases.length;
  if (n === 1) return { pos: { ...phases[0].pos }, ball: { ...phases[0].ball } };
  const seg = 100 / (n - 1);
  const fi = Math.min(n - 2, Math.floor(prog / seg));
  const t = ease((prog - fi * seg) / seg);
  const a = phases[fi];
  const b = phases[fi + 1];
  const pos = {} as PositionMap;
  PD.forEach(({ id }) => {
    if (a.pos[id] && b.pos[id]) {
      pos[id] = {
        x: a.pos[id].x + (b.pos[id].x - a.pos[id].x) * t,
        y: a.pos[id].y + (b.pos[id].y - a.pos[id].y) * t,
      };
    }
  });
  const ball: XY = {
    x: a.ball.x + (b.ball.x - a.ball.x) * t,
    y: a.ball.y + (b.ball.y - a.ball.y) * t,
  };
  return { pos, ball };
}

interface CourtDemoProps {
  play: Play;
  autoPlay?: boolean;
  speed?: number;
  style?: React.CSSProperties;
}

export function CourtDemo({ play, autoPlay = true, speed = 0.35, style }: CourtDemoProps) {
  const [prog, setProg] = useState(0);
  const [paused, setPaused] = useState(!autoPlay);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  const animate = useCallback((ts: number) => {
    if (!lastRef.current) lastRef.current = ts;
    const dt = ts - lastRef.current;
    lastRef.current = ts;
    setProg(p => {
      const next = p + speed * dt * 0.06;
      if (next >= 100) {
        // Pause briefly at end, then restart
        setTimeout(() => setProg(0), 1200);
        return 100;
      }
      return next;
    });
    rafRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    if (paused) return;
    lastRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, animate]);

  const { pos, ball } = lerpPos(Math.min(prog, 100), play.phases);

  return (
    <div
      style={{ position: 'relative', cursor: 'pointer', ...style }}
      onClick={() => setPaused(p => !p)}
    >
      <svg viewBox={`0 0 ${CW} ${CH}`} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }}>
        {/* Court background */}
        <rect width={CW} height={CH} rx={8} fill="#0f2847" />
        {/* Net */}
        <line x1={0} y1={NET_Y} x2={CW} y2={NET_Y} stroke="#ffffff30" strokeWidth={2} />
        {/* Attack line */}
        <line x1={0} y1={NET_Y + 110} x2={CW} y2={NET_Y + 110} stroke="#ffffff15" strokeWidth={1} strokeDasharray="8,6" />
        {/* Center line */}
        <line x1={CW / 2} y1={NET_Y} x2={CW / 2} y2={CH} stroke="#ffffff08" strokeWidth={1} />
        {/* Sidelines */}
        <rect x={2} y={NET_Y} width={CW - 4} height={CH - NET_Y - 2} fill="none" stroke="#ffffff15" strokeWidth={1} rx={2} />

        {/* Ball */}
        <circle cx={ball.x} cy={ball.y} r={BR} fill="#fbbf24" opacity={0.9}>
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Players */}
        {PD.map(pl => {
          const p = pos[pl.id];
          if (!p) return null;
          return (
            <g key={pl.id}>
              <circle cx={p.x} cy={p.y} r={PR} fill={pl.color} opacity={0.9} />
              <text
                x={p.x} y={p.y + 4}
                textAnchor="middle"
                fontSize={14}
                fontWeight={900}
                fill="#000"
                style={{ pointerEvents: 'none' }}
              >
                {pl.short}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Play label overlay */}
      <div style={{
        position: 'absolute', bottom: 8, left: 8, right: 8,
        background: '#0a1428dd', borderRadius: 6, padding: '6px 10px',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#e8a83e', letterSpacing: 0.5 }}>
          {play.name}
        </div>
        <div style={{ fontSize: 11, color: '#ffffffaa', marginTop: 2 }}>
          {paused ? 'Click to play' : play.phases[Math.min(Math.floor(prog / (100 / play.phases.length)), play.phases.length - 1)]?.label}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#1e3055', borderRadius: '0 0 8px 8px' }}>
        <div style={{ height: '100%', width: `${prog}%`, background: '#e8a83e', borderRadius: '0 0 8px 8px', transition: 'width 0.1s linear' }} />
      </div>
    </div>
  );
}
