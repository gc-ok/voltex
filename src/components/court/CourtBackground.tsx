'use client';

import React from 'react';
import { CW, CH, NET_Y, ATK_LINE } from '@/data/constants';

function CourtBackgroundInner() {
  const NY = NET_Y;
  const AL = ATK_LINE;

  return (
    <>
      {/* Out of bounds area — matches the premium matte dark background */}
      <rect x="0" y="0" width={CW} height={CH} fill="#0f172a" />

      {/* Inbounds Hardwood Court — A professional, warm maple wood color */}
      <rect x={18} y={12} width={CW - 36} height={CH - 24} fill="#D4A373" />

      {/* Court Boundary Lines — Crisp solid white */}
      <rect x={18} y={12} width={CW - 36} height={CH - 24} fill="none" stroke="#FFFFFF" strokeWidth={3} rx={2} />

      {/* Vertical center bisecting line (Visual aid for coaches) */}
      <line x1={CW / 2} y1={12} x2={CW / 2} y2={CH - 12} stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="6,10" opacity={0.4} />

      {/* 3m / 10ft attack lines */}
      <line x1={18} y1={NY - AL} x2={CW - 18} y2={NY - AL} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.9} />
      <line x1={18} y1={NY + AL} x2={CW - 18} y2={NY + AL} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.9} />

      {/* 3m labels — Clean standard font, no neon glow */}
      <text x={26} y={NY + AL - 8} fontSize={16} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.9}>3m</text>
      <text x={26} y={NY - AL - 8} fontSize={16} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.9}>3m</text>

      {/* The Net — Thick orange/red tape line to separate the sides clearly */}
      <rect x={12} y={NY - 4} width={CW - 24} height={8} fill="#C53030" rx={2} />
      
      {/* Net shadow/depth to make it pop off the wood */}
      <line x1={14} y1={NY + 5} x2={CW - 14} y2={NY + 5} stroke="#000000" strokeWidth={2} opacity={0.2} />

      {/* Antenna poles */}
      <line x1={14} y1={NY - 28} x2={14} y2={NY + 28} stroke="#E53E3E" strokeWidth={4} strokeLinecap="round" />
      <line x1={CW - 14} y1={NY - 28} x2={CW - 14} y2={NY + 28} stroke="#E53E3E" strokeWidth={4} strokeLinecap="round" />

      {/* Opponent label — Faded white paint */}
      <text x={CW / 2} y={NY / 2} textAnchor="middle" dominantBaseline="middle" fontSize={22} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} letterSpacing={8} opacity={0.25}>OPPONENT</text>

      {/* Zone labels — front row */}
      <text x={CW * 0.17} y={NY + AL - 24} textAnchor="middle" fontSize={18} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.25}>Z4</text>
      <text x={CW * 0.5} y={NY + AL - 24} textAnchor="middle" fontSize={18} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.25}>Z3</text>
      <text x={CW * 0.83} y={NY + AL - 24} textAnchor="middle" fontSize={18} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.25}>Z2</text>

      {/* Zone labels — back row */}
      <text x={CW * 0.17} y={CH - 20} textAnchor="middle" fontSize={18} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.25}>Z5</text>
      <text x={CW * 0.5} y={CH - 20} textAnchor="middle" fontSize={18} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.25}>Z6</text>
      <text x={CW * 0.83} y={CH - 20} textAnchor="middle" fontSize={18} fill="#FFFFFF" fontFamily="inherit" fontWeight={700} opacity={0.25}>Z1</text>
    </>
  );
}

export const CourtBackground = React.memo(CourtBackgroundInner);