'use client';

import React, { useState } from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { PD } from '@/data/players';
import { System, Rotation, FormationContext, PlayerId, AttackDirection, DefenseType } from '@/data/types';

const SYSTEMS: System[] = ['5-1', '6-2', '4-2'];
const ROTATIONS: Rotation[] = [1, 2, 3, 4, 5, 6];
const CONTEXTS: { key: FormationContext; label: string }[] = [
  { key: 'serveReceive', label: 'Serve Receive' },
  { key: 'baseDefense', label: 'Base Defense' },
  { key: 'baseOffense', label: 'Base Offense' },
];
const DEFENSE_TYPES: { key: DefenseType; label: string }[] = [
  { key: 'perimeter', label: 'Perimeter' },
  { key: 'rotational', label: 'Rotational' },
  { key: 'man-up', label: 'Man-Up' },
];
const DIRECTIONS: { key: AttackDirection; label: string }[] = [
  { key: 'left', label: 'Left' },
  { key: 'center', label: 'Center' },
  { key: 'right', label: 'Right' },
];

export function TeamDefaultsPanel() {
  const tab = usePlaybookStore(s => s.tab);
  const system = useTeamStore(s => s.system);
  const rotation = useTeamStore(s => s.rotation);
  const formationCtx = useTeamStore(s => s.formationCtx);
  const setSystem = useTeamStore(s => s.setSystem);
  const setRotation = useTeamStore(s => s.setRotation);
  const setFormationCtx = useTeamStore(s => s.setFormationCtx);
  const resetRotation = useTeamStore(s => s.resetRotation);
  const playerNames = useTeamStore(s => s.playerNames);
  const setPlayerName = useTeamStore(s => s.setPlayerName);
  const teamName = useTeamStore(s => s.teamName);
  const setTeamName = useTeamStore(s => s.setTeamName);
  const defenseType = useTeamStore(s => s.defenseType);
  const setDefenseType = useTeamStore(s => s.setDefenseType);
  const profiles = useTeamStore(s => s.profiles);
  const activeProfileId = useTeamStore(s => s.activeProfileId);
  const saveProfile = useTeamStore(s => s.saveProfile);
  const loadProfile = useTeamStore(s => s.loadProfile);
  const deleteProfile = useTeamStore(s => s.deleteProfile);
  const coverageStrategy = useTeamStore(s => s.coverageStrategy);
  const setCoverageBlockerCount = useTeamStore(s => s.setCoverageBlockerCount);

  const [showCoverage, setShowCoverage] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [coverageDir, setCoverageDir] = useState<AttackDirection>('left');

  if (tab !== 'myteam') return null;

  const pillStyle = (active: boolean) => ({
    background: active ? 'var(--accent)' : 'var(--bg-card)',
    color: active ? '#000' : 'var(--text-dim)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 700 as const,
    cursor: 'pointer' as const,
    transition: 'all .15s',
  });

  const rotBtnStyle = (active: boolean) => ({
    width: 34, height: 34,
    borderRadius: '50%',
    background: active ? 'var(--accent)' : '#1e3055',
    color: active ? '#000' : 'var(--text-mid)',
    border: `2px solid ${active ? 'var(--accent)' : '#ffffff18'}`,
    fontSize: 14,
    fontWeight: 900 as const,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transition: 'all .15s',
  });

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width: 280,
      maxHeight: 'calc(100% - 24px)',
      background: '#0a1428ee',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 14,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5, marginBottom: 12 }}>
        MY TEAM
      </div>

      {/* Strategy Profile Selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          STRATEGY PROFILE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
          {profiles.map(p => (
            <div key={p.id} style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                onClick={() => loadProfile(p.id)}
                style={{
                  ...pillStyle(activeProfileId === p.id),
                  paddingRight: activeProfileId !== p.id ? 24 : 12,
                }}
              >
                {p.name}
              </button>
              {activeProfileId !== p.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                  style={{
                    position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#ef444480',
                    fontSize: 10, cursor: 'pointer', padding: '0 2px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {!showProfileInput ? (
            <button
              onClick={() => setShowProfileInput(true)}
              style={{
                ...pillStyle(false),
                color: 'var(--accent)',
                borderStyle: 'dashed',
              }}
            >
              + Save Current
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                autoFocus
                type="text"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newProfileName.trim()) {
                    saveProfile(newProfileName.trim());
                    setNewProfileName('');
                    setShowProfileInput(false);
                  }
                  if (e.key === 'Escape') {
                    setNewProfileName('');
                    setShowProfileInput(false);
                  }
                }}
                placeholder="Profile name..."
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--accent)',
                  borderRadius: 6, padding: '4px 8px', fontSize: 12, fontWeight: 700,
                  color: 'var(--text)', outline: 'none', width: 120,
                }}
              />
              <button
                onClick={() => {
                  if (newProfileName.trim()) {
                    saveProfile(newProfileName.trim());
                    setNewProfileName('');
                    setShowProfileInput(false);
                  }
                }}
                style={{ ...pillStyle(true), padding: '4px 8px', fontSize: 11 }}
              >
                Save
              </button>
            </div>
          )}
        </div>
        {profiles.length === 0 && (
          <div style={{ fontSize: 10, color: '#ffffff40', marginTop: 4 }}>
            Save your current setup as a profile to quickly swap between strategies.
          </div>
        )}
      </div>

      {/* Team Name */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>
          TEAM NAME
        </label>
        <input
          type="text"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          style={{
            width: '100%',
            marginTop: 4,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '7px 10px',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>

      {/* System selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          SYSTEM
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {SYSTEMS.map(s => (
            <button key={s} onClick={() => setSystem(s)} style={pillStyle(system === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Defense Type */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          DEFENSE TYPE
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DEFENSE_TYPES.map(d => (
            <button key={d.key} onClick={() => setDefenseType(d.key)} style={pillStyle(defenseType === d.key)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rotation selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          ROTATION
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ROTATIONS.map(r => (
            <button key={r} onClick={() => setRotation(r)} style={rotBtnStyle(rotation === r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Formation context */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          FORMATION
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {CONTEXTS.map(c => (
            <button key={c.key} onClick={() => setFormationCtx(c.key)} style={pillStyle(formationCtx === c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={() => resetRotation(system, rotation)}
        style={{
          width: '100%',
          background: 'none',
          border: '1px solid #ef444450',
          color: '#ef4444',
          borderRadius: 9,
          padding: '7px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 14,
        }}
      >
        Reset Rotation {rotation} to Default
      </button>

      {/* Coverage Strategy */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginBottom: 14 }}>
        <button
          onClick={() => setShowCoverage(!showCoverage)}
          style={{
            width: '100%', textAlign: 'left',
            background: 'none', border: 'none',
            color: 'var(--text)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <span>COVERAGE</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
            {showCoverage ? '▾' : '▸'}
          </span>
        </button>

        {showCoverage && (
          <div style={{ marginTop: 8 }}>
            {/* Blocker count toggle */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                BLOCKERS
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([1, 2] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setCoverageBlockerCount(n)}
                    style={pillStyle(coverageStrategy.blockerCount === n)}
                  >
                    {n} Blocker{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Attack direction pills */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                ATTACK DIRECTION
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {DIRECTIONS.map(d => (
                  <button
                    key={d.key}
                    onClick={() => setCoverageDir(d.key)}
                    style={pillStyle(coverageDir === d.key)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage player positions */}
            <div style={{ fontSize: 10, color: '#ffffff50', lineHeight: 1.6 }}>
              Coverage positions for {coverageDir} attack shown on court.
              Drag players to adjust.
            </div>
          </div>
        )}
      </div>

      {/* Roster / Player Names */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          ROSTER
        </div>
        {PD.map(pl => (
          <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: pl.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 900, color: '#000',
            }}>
              {pl.short}
            </div>
            <input
              type="text"
              value={playerNames[pl.id]}
              onChange={e => setPlayerName(pl.id as PlayerId, e.target.value)}
              placeholder={pl.short}
              style={{
                flex: 1,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 11, color: '#ffffff50', whiteSpace: 'nowrap' }}>{pl.role}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8, fontSize: 12, color: '#e8a83e80', lineHeight: 1.8 }}>
        Drag players on court to set defaults
      </div>
    </div>
  );
}
