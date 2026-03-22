'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { PD } from '@/data/players';
import { System, Rotation, PlayerId, DefenseType } from '@/data/types';
import { rotKey } from '@/data/defaults';
import { phIdxFromProg } from '@/utils/lerp';

const SYSTEMS: { key: System; name: string; desc: string; detail: string }[] = [
  {
    key: '5-1',
    name: '5-1',
    desc: 'One setter runs all rotations',
    detail: 'The most common system at competitive levels. One setter handles all setting duties from every rotation, allowing 5 hitters to specialize in attacking. Best when you have a dominant setter.',
  },
  {
    key: '6-2',
    name: '6-2',
    desc: 'Two setters, each sets from back row',
    detail: 'Uses two setters who only set when in the back row, giving you 3 front-row attackers at all times. Good when you have two capable setters and want maximum front-row firepower.',
  },
  {
    key: '4-2',
    name: '4-2',
    desc: 'Two setters, each sets from front row',
    detail: 'The simplest system — setters set from the front row, giving only 2 front-row hitters. Great for beginners, younger teams, or recreational play where setting consistency matters most.',
  },
];

const DEFENSE_TYPES: { key: DefenseType; name: string; desc: string; detail: string }[] = [
  {
    key: 'perimeter',
    name: 'Perimeter',
    desc: 'Back row stays near sidelines and baseline',
    detail: 'The standard defense. Back-row players hold their sideline positions, libero stays deep center. Simple and reliable — best for teams that want consistent reads. Common at all levels.',
  },
  {
    key: 'rotational',
    name: 'Rotational',
    desc: 'Zone 6 rotates toward the line',
    detail: 'Instead of staying straight back, the zone 6 player rotates toward the line to improve line dig coverage. Off-blocker drops to cover cross-court tips. More aggressive than perimeter.',
  },
  {
    key: 'man-up',
    name: 'Man-Up (Rover)',
    desc: 'Libero cheats forward for tips and rolls',
    detail: 'The libero pushes well forward behind the block to cover tips and roll shots. Back-row players must cover deeper areas without libero support. High risk, high reward.',
  },
];

const ROTATIONS: Rotation[] = [1, 2, 3, 4, 5, 6];

type Scenario = 'serve' | 'receive';

// Track which rotation+scenario combos the coach has confirmed
type RotConfirm = Record<Rotation, { serve: boolean; receive: boolean }>;

const initialConfirm = (): RotConfirm => ({
  1: { serve: false, receive: false },
  2: { serve: false, receive: false },
  3: { serve: false, receive: false },
  4: { serve: false, receive: false },
  5: { serve: false, receive: false },
  6: { serve: false, receive: false },
});

// Phase labels for display
const SERVE_PHASE_LABELS = ['Pre-Serve', 'Ball Crosses Net', 'Base Defense'];
const RECEIVE_PHASE_LABELS = ['Serve Receive', 'Pass Contact', 'Set Contact', 'Attack', 'Ball Over Net'];

export function SetupWizardPanel() {
  const tab = usePlaybookStore(s => s.tab);
  const setTab = usePlaybookStore(s => s.setTab);

  const setupStep = useTeamStore(s => s.setupStep);
  const setSetupStep = useTeamStore(s => s.setSetupStep);
  const completeSetup = useTeamStore(s => s.completeSetup);
  const hasCompletedSetup = useTeamStore(s => s.hasCompletedSetup);

  const teamName = useTeamStore(s => s.teamName);
  const setTeamName = useTeamStore(s => s.setTeamName);
  const system = useTeamStore(s => s.system);
  const setSystem = useTeamStore(s => s.setSystem);
  const rotation = useTeamStore(s => s.rotation);
  const setRotation = useTeamStore(s => s.setRotation);
  const defenseType = useTeamStore(s => s.defenseType);
  const setDefenseType = useTeamStore(s => s.setDefenseType);
  const playerNames = useTeamStore(s => s.playerNames);
  const setPlayerName = useTeamStore(s => s.setPlayerName);
  const rotationDefaults = useTeamStore(s => s.rotationDefaults);
  const resetRotationPhases = useTeamStore(s => s.resetRotationPhases);

  // Team animation state
  const teamAnimPlaying = usePlaybookStore(s => s.teamAnimPlaying);
  const teamAnimProg = usePlaybookStore(s => s.teamAnimProg);
  const teamAnimScenario = usePlaybookStore(s => s.teamAnimScenario);
  const setTeamAnimPlaying = usePlaybookStore(s => s.setTeamAnimPlaying);
  const setTeamAnimProg = usePlaybookStore(s => s.setTeamAnimProg);
  const setTeamAnimScenario = usePlaybookStore(s => s.setTeamAnimScenario);

  const [expandedSystem, setExpandedSystem] = useState<System | null>(null);
  const [expandedDefense, setExpandedDefense] = useState<DefenseType | null>(null);
  const [confirmations, setConfirmations] = useState<RotConfirm>(initialConfirm);
  const [scenario, setScenario] = useState<Scenario>('serve');
  const [isEditingPhase, setIsEditingPhase] = useState(false);

  if (tab !== 'setup') return null;

  // Sync scenario to playbook store
  const changeScenario = (s: Scenario) => {
    setScenario(s);
    setTeamAnimScenario(s);
    setTeamAnimProg(0);
    setTeamAnimPlaying(false);
    setIsEditingPhase(false);
  };

  // Get current phases for display
  const key = rotKey(system, rotation);
  const rd = rotationDefaults[key];
  const currentPhases = rd ? (scenario === 'serve' ? rd.servePhases : rd.receivePhases) : [];
  const phaseLabels = scenario === 'serve' ? SERVE_PHASE_LABELS : RECEIVE_PHASE_LABELS;
  const currentPhaseIdx = currentPhases.length > 0 ? phIdxFromProg(teamAnimProg, currentPhases.length) : 0;

  // Play animation
  const playAnimation = () => {
    setTeamAnimProg(0);
    setTeamAnimScenario(scenario);
    setTeamAnimPlaying(true);
    setIsEditingPhase(false);
  };

  // Pause at current position
  const pauseAnimation = () => {
    setTeamAnimPlaying(false);
  };

  // Jump to specific phase
  const jumpToPhase = (idx: number) => {
    if (currentPhases.length === 0) return;
    const n = currentPhases.length;
    const prog = n <= 1 ? 0 : (idx / (n - 1)) * 100;
    setTeamAnimProg(prog);
    setTeamAnimPlaying(false);
    setTeamAnimScenario(scenario);
  };

  // Confirm current rotation+scenario and auto-advance
  const confirmAndAdvance = () => {
    setConfirmations(prev => ({
      ...prev,
      [rotation]: { ...prev[rotation], [scenario]: true },
    }));
    setTeamAnimPlaying(false);
    setTeamAnimProg(0);
    setIsEditingPhase(false);

    // Auto-advance: serve→receive, then next rotation serve
    if (scenario === 'serve') {
      changeScenario('receive');
      // Auto-play receive
      setTimeout(() => {
        usePlaybookStore.getState().setTeamAnimScenario('receive');
        usePlaybookStore.getState().setTeamAnimProg(0);
        usePlaybookStore.getState().setTeamAnimPlaying(true);
      }, 300);
    } else {
      // Move to next rotation
      const nextRot = rotation < 6 ? (rotation + 1) as Rotation : null;
      if (nextRot) {
        setRotation(nextRot);
        changeScenario('serve');
        setTimeout(() => {
          usePlaybookStore.getState().setTeamAnimScenario('serve');
          usePlaybookStore.getState().setTeamAnimProg(0);
          usePlaybookStore.getState().setTeamAnimPlaying(true);
        }, 300);
      }
    }
  };

  // Count confirmed
  const confirmedCount = ROTATIONS.reduce((acc, r) =>
    acc + (confirmations[r].serve ? 1 : 0) + (confirmations[r].receive ? 1 : 0), 0);
  const totalScenarios = 12;

  // Stop animation when leaving step 3
  const stopAnim = () => {
    setTeamAnimPlaying(false);
    setTeamAnimProg(0);
  };

  // After setup is done, show summary
  if (hasCompletedSetup) {
    return (
      <div style={{
        position: 'absolute', top: 12, right: 12, width: 280,
        maxHeight: 'calc(100% - 24px)', background: '#0a1428ee',
        border: '1px solid var(--border)', borderRadius: 12,
        padding: 14, overflowY: 'auto', backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5, marginBottom: 12 }}>
          SETUP
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>TEAM:</span> {teamName}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>SYSTEM:</span> {system}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>DEFENSE:</span>{' '}
          {DEFENSE_TYPES.find(d => d.key === defenseType)?.name || defenseType}
        </div>
        <button
          onClick={() => { setSetupStep(0); useTeamStore.setState({ hasCompletedSetup: false }); setConfirmations(initialConfirm()); }}
          style={{
            width: '100%', background: '#e8a83e10', border: '1px solid #e8a83e40',
            color: 'var(--accent)', borderRadius: 8, padding: '7px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 6,
          }}
        >
          Re-run Setup Wizard
        </button>
        <button
          onClick={() => setTab('myteam')}
          style={{
            width: '100%', background: 'none', border: '1px solid var(--border)',
            color: 'var(--text-mid)', borderRadius: 8, padding: '7px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Go to My Team
        </button>
      </div>
    );
  }

  const handleFinish = () => {
    stopAnim();
    completeSetup();
    setTab('myteam');
  };

  // Progress dots: steps 0-4
  const dots = [0, 1, 2, 3, 4];
  const dotIndex = dots.indexOf(setupStep);

  // Shared pill style
  const pill = (active: boolean) => ({
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

  const rotBtn = (r: Rotation, active: boolean) => {
    const isConfirmed = confirmations[r].serve && confirmations[r].receive;
    const isPartial = confirmations[r].serve || confirmations[r].receive;
    return {
      width: 34, height: 34,
      borderRadius: '50%',
      background: active ? 'var(--accent)' : isConfirmed ? '#1a4a2e' : '#1e3055',
      color: active ? '#000' : isConfirmed ? '#4ade80' : 'var(--text-mid)',
      border: `2px solid ${active ? 'var(--accent)' : isConfirmed ? '#4ade80' : isPartial ? '#e8a83e60' : '#ffffff18'}`,
      fontSize: 14,
      fontWeight: 900 as const,
      cursor: 'pointer' as const,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      transition: 'all .15s',
      position: 'relative' as const,
    };
  };

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, width: 280,
      maxHeight: 'calc(100% - 24px)', background: '#0a1428ee',
      border: '1px solid var(--border)', borderRadius: 12,
      padding: 14, overflowY: 'auto', backdropFilter: 'blur(12px)', zIndex: 100,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5 }}>
          TEAM SETUP
        </div>
        <button
          onClick={handleFinish}
          style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {dots.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= dotIndex ? 'var(--accent)' : '#1e3055',
            transition: 'background .2s',
          }} />
        ))}
      </div>

      {/* Step 0: Team Name */}
      {setupStep === 0 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
            What's your team name?
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14, lineHeight: 1.5 }}>
            You can always change this later.
          </div>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="e.g. Eagles Volleyball"
            autoFocus
            style={{
              width: '100%', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '10px 12px', fontSize: 15, fontWeight: 700,
              color: 'var(--text)', outline: 'none', marginBottom: 14,
            }}
          />
          <button
            onClick={() => setSetupStep(1)}
            disabled={!teamName.trim()}
            style={{
              width: '100%', background: teamName.trim() ? 'var(--accent)' : '#1e3055',
              border: 'none', color: teamName.trim() ? '#000' : '#ffffff40',
              borderRadius: 9, padding: '10px',
              fontSize: 14, fontWeight: 900, cursor: teamName.trim() ? 'pointer' : 'default',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 1: System */}
      {setupStep === 1 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
            What system do you run?
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.5 }}>
            This determines your rotation structure for serve and serve receive.
          </div>

          {SYSTEMS.map(s => (
            <div key={s.key} style={{ marginBottom: 6 }}>
              <button
                onClick={() => setSystem(s.key)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: system === s.key ? '#e8a83e10' : 'var(--bg-card)',
                  border: `2px solid ${system === s.key ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 12px',
                  cursor: 'pointer', transition: 'all .12s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      fontSize: 16, fontWeight: 900, letterSpacing: 0.5,
                      color: system === s.key ? 'var(--accent)' : 'var(--text)',
                    }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2, lineHeight: 1.4 }}>
                      {s.desc}
                    </div>
                  </div>
                  {system === s.key && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--accent)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0,
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setExpandedSystem(expandedSystem === s.key ? null : s.key)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--accent)', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', padding: '3px 12px',
                }}
              >
                {expandedSystem === s.key ? '▾ Hide details' : '▸ Learn more'}
              </button>
              {expandedSystem === s.key && (
                <div style={{
                  background: '#0d1e3a', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 10px', marginBottom: 4,
                  fontSize: 11, color: '#ffffffb0', lineHeight: 1.6,
                }}>
                  {s.detail}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setSetupStep(0)}
              style={{
                flex: 1, background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-mid)', borderRadius: 9, padding: '9px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={() => setSetupStep(2)}
              style={{
                flex: 2, background: 'var(--accent)', border: 'none',
                color: '#000', borderRadius: 9, padding: '9px',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Defense Type */}
      {setupStep === 2 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
            What defense do you run?
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.5 }}>
            This seeds your base defensive positions for all rotations. You'll fine-tune in the next step.
          </div>

          {DEFENSE_TYPES.map(d => (
            <div key={d.key} style={{ marginBottom: 6 }}>
              <button
                onClick={() => setDefenseType(d.key)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: defenseType === d.key ? '#e8a83e10' : 'var(--bg-card)',
                  border: `2px solid ${defenseType === d.key ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 12px',
                  cursor: 'pointer', transition: 'all .12s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      fontSize: 15, fontWeight: 900, letterSpacing: 0.5,
                      color: defenseType === d.key ? 'var(--accent)' : 'var(--text)',
                    }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2, lineHeight: 1.4 }}>
                      {d.desc}
                    </div>
                  </div>
                  {defenseType === d.key && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--accent)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0,
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setExpandedDefense(expandedDefense === d.key ? null : d.key)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--accent)', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', padding: '3px 12px',
                }}
              >
                {expandedDefense === d.key ? '▾ Hide details' : '▸ Learn more'}
              </button>
              {expandedDefense === d.key && (
                <div style={{
                  background: '#0d1e3a', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 10px', marginBottom: 4,
                  fontSize: 11, color: '#ffffffb0', lineHeight: 1.6,
                }}>
                  {d.detail}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setSetupStep(1)}
              style={{
                flex: 1, background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-mid)', borderRadius: 9, padding: '9px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                setRotation(1 as Rotation);
                changeScenario('serve');
                setSetupStep(3);
                // Auto-play serve animation for rotation 1
                setTimeout(() => {
                  usePlaybookStore.getState().setTeamAnimScenario('serve');
                  usePlaybookStore.getState().setTeamAnimProg(0);
                  usePlaybookStore.getState().setTeamAnimPlaying(true);
                }, 300);
              }}
              style={{
                flex: 2, background: 'var(--accent)', border: 'none',
                color: '#000', borderRadius: 9, padding: '9px',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Per-Rotation Walkthrough */}
      {setupStep === 3 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginBottom: 2, lineHeight: 1.3 }}>
            Review Each Rotation
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.5 }}>
            Watch the animation for each rotation. Confirm or drag players to adjust.
          </div>

          {/* Progress bar */}
          <div style={{
            background: '#0d1e3a', borderRadius: 6, padding: '6px 10px',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {confirmedCount}/{totalScenarios}
            </div>
            <div style={{ flex: 1, height: 4, background: '#1e3055', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${(confirmedCount / totalScenarios) * 100}%`,
                height: '100%',
                background: confirmedCount === totalScenarios ? '#4ade80' : 'var(--accent)',
                borderRadius: 2,
                transition: 'width .3s',
              }} />
            </div>
          </div>

          {/* Rotation pills */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>
              ROTATION
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {ROTATIONS.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setRotation(r);
                    stopAnim();
                    setIsEditingPhase(false);
                  }}
                  style={rotBtn(r, rotation === r)}
                >
                  {confirmations[r].serve && confirmations[r].receive ? '✓' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario toggle */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>
              SCENARIO
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {(['serve', 'receive'] as Scenario[]).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    changeScenario(s);
                    // Auto-play after switching
                    setTimeout(() => {
                      usePlaybookStore.getState().setTeamAnimScenario(s);
                      usePlaybookStore.getState().setTeamAnimProg(0);
                      usePlaybookStore.getState().setTeamAnimPlaying(true);
                    }, 200);
                  }}
                  style={{
                    ...pill(scenario === s),
                    flex: 1,
                    textAlign: 'center' as const,
                    position: 'relative' as const,
                  }}
                >
                  {s === 'serve' ? 'Serve' : 'Serve Receive'}
                  {confirmations[rotation][s] && (
                    <span style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 12, height: 12, borderRadius: '50%',
                      background: '#4ade80', color: '#000',
                      fontSize: 8, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Phase dots + label */}
          <div style={{
            background: '#0d1e3a', borderRadius: 8, padding: '8px 10px',
            marginBottom: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
              {phaseLabels[currentPhaseIdx] || 'Ready'}
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {phaseLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => jumpToPhase(i)}
                  title={label}
                  style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: i <= currentPhaseIdx ? 'var(--accent)' : '#1e3055',
                    border: 'none', cursor: 'pointer',
                    transition: 'background .2s',
                  }}
                />
              ))}
            </div>

            {/* Play/Pause + Replay */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={teamAnimPlaying ? pauseAnimation : playAnimation}
                style={{
                  flex: 1, background: 'var(--accent)', border: 'none',
                  color: '#000', borderRadius: 6, padding: '6px',
                  fontSize: 12, fontWeight: 900, cursor: 'pointer',
                }}
              >
                {teamAnimPlaying ? '⏸ Pause' : teamAnimProg >= 99 ? '↺ Replay' : '▶ Play'}
              </button>
            </div>
          </div>

          {/* Edit tip */}
          {!isEditingPhase ? (
            <div style={{
              fontSize: 11, color: '#ffffff60', lineHeight: 1.5, marginBottom: 8,
            }}>
              Pause animation and drag players on the court to adjust positions for this phase.
            </div>
          ) : (
            <div style={{
              background: '#e8a83e10', border: '1px solid #e8a83e30',
              borderRadius: 7, padding: '6px 10px', marginBottom: 8,
              fontSize: 11, fontWeight: 700, color: 'var(--accent)',
            }}>
              EDITING — Drag players on court. Changes save automatically.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button
              onClick={confirmAndAdvance}
              style={{
                flex: 2, background: 'var(--accent)', border: 'none',
                color: '#000', borderRadius: 8, padding: '9px',
                fontSize: 13, fontWeight: 900, cursor: 'pointer',
              }}
            >
              Looks Good
            </button>
            <button
              onClick={() => {
                resetRotationPhases(system, rotation, scenario);
                jumpToPhase(0);
              }}
              style={{
                flex: 1, background: 'none', border: '1px solid #ef444450',
                color: '#ef4444', borderRadius: 8, padding: '9px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                stopAnim();
                setSetupStep(2);
              }}
              style={{
                flex: 1, background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-mid)', borderRadius: 9, padding: '9px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                stopAnim();
                setSetupStep(4);
              }}
              style={{
                flex: 2, background: confirmedCount > 0 ? 'var(--accent)' : '#1e3055',
                border: 'none',
                color: confirmedCount > 0 ? '#000' : '#ffffff60',
                borderRadius: 9, padding: '9px',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
              }}
            >
              {confirmedCount === totalScenarios ? 'All Confirmed — Continue' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Roster */}
      {setupStep === 4 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
            Name your players
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
            Optional — you can use position abbreviations or real names.
          </div>

          {PD.map(pl => (
            <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: pl.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900, color: '#000',
              }}>
                {pl.short}
              </div>
              <input
                type="text"
                value={playerNames[pl.id]}
                onChange={e => setPlayerName(pl.id as PlayerId, e.target.value)}
                placeholder={pl.short}
                style={{
                  flex: 1, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 7,
                  padding: '6px 9px', fontSize: 13, fontWeight: 700,
                  color: 'var(--text)', outline: 'none',
                }}
              />
              <span style={{ fontSize: 10, color: '#ffffff50', whiteSpace: 'nowrap', minWidth: 46 }}>
                {pl.role}
              </span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => {
                setRotation(1 as Rotation);
                changeScenario('serve');
                setSetupStep(3);
              }}
              style={{
                flex: 1, background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-mid)', borderRadius: 9, padding: '9px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              style={{
                flex: 2, background: 'var(--accent)', border: 'none',
                color: '#000', borderRadius: 9, padding: '9px',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
