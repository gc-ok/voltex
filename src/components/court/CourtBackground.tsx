'use client';

import React from 'react';
import { CW, CH, NET_Y, ATK_LINE } from '@/data/constants';

function CourtBackgroundInner() {
  const NY = NET_Y;
  const AL = ATK_LINE;

  return (
    <>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1f10" />
          <stop offset="100%" stopColor="#081309" />
        </linearGradient>
        <linearGradient id="opp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060d07" />
          <stop offset="100%" stopColor="#0c1a0e" />
        </linearGradient>
      </defs>

      {/* Court halves */}
      <rect width={CW} height={NY} fill="url(#opp)" />
      <rect y={NY} width={CW} height={CH - NY} fill="url(#cg)" />

      {/* Boundary */}
      <rect x={18} y={12} width={CW - 36} height={CH - 24} fill="none" stroke="#ffffff20" strokeWidth={1.5} rx={2} />

      {/* Center line */}
      <line x1={CW / 2} y1={12} x2={CW / 2} y2={CH - 12} stroke="#ffffff08" strokeWidth={1} strokeDasharray="6,10" />

      {/* 3m attack lines */}
      <line x1={18} y1={NY - AL} x2={CW - 18} y2={NY - AL} stroke="#ffffff18" strokeWidth={1.5} strokeDasharray="8,5" />
      <line x1={18} y1={NY + AL} x2={CW - 18} y2={NY + AL} stroke="#ffffff28" strokeWidth={1.5} strokeDasharray="8,5" />

      {/* 3m labels */}
      <text x={26} y={NY + AL - 6} fontSize={10} fill="#e8a83e35" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>3m</text>
      <text x={26} y={NY - AL - 6} fontSize={10} fill="#e8a83e20" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>3m</text>

      {/* Net shadow lines */}
      <line x1={18} y1={NY - 16} x2={CW - 18} y2={NY - 16} stroke="#ffffff06" strokeWidth={1} />
      <line x1={18} y1={NY + 16} x2={CW - 18} y2={NY + 16} stroke="#ffffff06" strokeWidth={1} />

      {/* Net glow + line */}
      <rect x={14} y={NY - 5} width={CW - 28} height={10} fill="#ffffff06" rx={4} />
      <line x1={14} y1={NY} x2={CW - 14} y2={NY} stroke="#ffffffcc" strokeWidth={3.5} />

      {/* Antenna poles */}
      <line x1={14} y1={NY - 28} x2={14} y2={NY + 28} stroke="#e63946" strokeWidth={5} strokeLinecap="round" />
      <line x1={CW - 14} y1={NY - 28} x2={CW - 14} y2={NY + 28} stroke="#e63946" strokeWidth={5} strokeLinecap="round" />

      {/* Opponent label */}
      <text x={CW / 2} y={NY / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#ffffff10" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700} letterSpacing={10}>OPPONENT</text>

      {/* Zone labels */}
      <text x={CW * 0.17} y={CH - 18} textAnchor="middle" fontSize={10} fill="#ffffff20" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>Z5</text>
      <text x={CW * 0.5} y={CH - 18} textAnchor="middle" fontSize={10} fill="#ffffff20" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>Z6</text>
      <text x={CW * 0.83} y={CH - 18} textAnchor="middle" fontSize={10} fill="#ffffff20" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>Z1</text>
    </>
  );
}

export const CourtBackground = React.memo(CourtBackgroundInner);
