'use client';

import React, { useState, useMemo } from 'react';
import { usePlaybookStore } from '@/stores/usePlaybookStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { PD } from '@/data/players';
import { System, Rotation, PlayerId, DefenseType, ReceiveTransition, Play } from '@/data/types';
import { rotKey, buildReceivePhases, buildServePhases } from '@/data/defaults';
import { phIdxFromProg } from '@/utils/lerp';
import { CourtDemo } from '../landing/CourtDemo';

// ─── STYLED CSS FOR STAGGERED FADE-INS ──────────────────────────────────────────
const STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .wiz-anim-1 { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .wiz-anim-2 { opacity: 0; animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; }
  .wiz-anim-3 { opacity: 0; animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; }
`;

// ─── DATA CONSTANTS ───────────────────────────────────────────────────────────
const SYSTEMS: { key: System; name: string; desc: string; detail: string }[] = [
  { key: '5-1', name: '5-1 System', desc: 'One setter runs all rotations.', detail: 'The most common system at competitive levels. One setter handles all setting duties from every rotation, allowing 5 hitters to specialize in attacking. Best when you have a dominant setter.' },
  { key: '6-2', name: '6-2 System', desc: 'Two setters, each sets from back row.', detail: 'Uses two setters who only set when in the back row, giving you 3 front-row attackers at all times. Good when you have two capable setters and want maximum front-row firepower.' },
  { key: '4-2', name: '4-2 System', desc: 'Two setters, each sets from front row.', detail: 'The simplest system — setters set from the front row, giving only 2 front-row hitters. Great for beginners, younger teams, or recreational play where setting consistency matters most.' },
];

const DEFENSE_TYPES: { key: DefenseType; name: string; desc: string; detail: string }[] = [
  { key: 'perimeter', name: 'Perimeter', desc: 'Back row stays near sidelines and baseline', detail: 'The standard defense. Back-row players hold their sideline positions, libero stays deep center. Simple and reliable — best for teams that want consistent reads. Common at all levels.' },
  { key: 'rotational', name: 'Rotational', desc: 'Zone 6 rotates toward the line', detail: 'Instead of staying straight back, the zone 6 player rotates toward the line to improve line dig coverage. Off-blocker drops to cover cross-court tips. More aggressive than perimeter.' },
  { key: 'man-up', name: 'Man-Up (Rover)', desc: 'Libero cheats forward for tips and rolls', detail: 'The libero pushes well forward behind the block to cover tips and roll shots. Back-row players must cover deeper areas without libero support. High risk, high reward.' },
];

const ROTATIONS: Rotation[] = [1, 2, 3, 4, 5, 6];
type Scenario = 'serve' | 'receive';
type RotConfirm = Record<Rotation, { serve: boolean; receive: boolean }>;

const initialConfirm = (): RotConfirm => ({
  1: { serve: false, receive: false }, 2: { serve: false, receive: false },
  3: { serve: false, receive: false }, 4: { serve: false, receive: false },
  5: { serve: false, receive: false }, 6: { serve: false, receive: false },
});

const SERVE_PHASE_LABELS = ['Pre-Serve', 'Base Defense'];
const RECEIVE_PHASE_LABELS = ['Serve Receive', 'The Pass', 'The Set', 'OFFENSIVE PLAY', 'Transition', 'Base Defense'];

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

  // Playbook Animation state
  const teamAnimPlaying = usePlaybookStore(s => s.teamAnimPlaying);
  const teamAnimProg = usePlaybookStore(s => s.teamAnimProg);
  const teamAnimScenario = usePlaybookStore(s => s.teamAnimScenario);
  const teamAnimPhaseIndex = usePlaybookStore(s => s.teamAnimPhaseIndex);
  const setTeamAnimPlaying = usePlaybookStore(s => s.setTeamAnimPlaying);
  const setTeamAnimProg = usePlaybookStore(s => s.setTeamAnimProg);
  const setTeamAnimScenario = usePlaybookStore(s => s.setTeamAnimScenario);
  const setTeamAnimPhaseIndex = usePlaybookStore(s => s.setTeamAnimPhaseIndex);

  const [expandedSystem, setExpandedSystem] = useState<System | null>(null);
  const [expandedTransition, setExpandedTransition] = useState<ReceiveTransition | null>(null);
  const [expandedDefense, setExpandedDefense] = useState<DefenseType | null>(null);
  const [confirmations, setConfirmations] = useState<RotConfirm>(initialConfirm);
  const [scenario, setScenario] = useState<Scenario>('serve');
  
  // Missing state hook restored to fix the compiler error!
  const [isEditingPhase, setIsEditingPhase] = useState(false);

  // Dynamically generate standard demo plays using your powerful defaults engine
  const demoPlays = useMemo<Record<string, Play>>(() => ({
    '5-1': { id: 'd1', cat: '', name: '5-1 System Demo', desc: '', phases: buildReceivePhases('5-1', 1, 'perimeter', 'standard', 'switch-late') },
    '6-2': { id: 'd2', cat: '', name: '6-2 System Demo', desc: '', phases: buildReceivePhases('6-2', 1, 'perimeter', 'standard', 'switch-late') },
    '4-2': { id: 'd3', cat: '', name: '4-2 System Demo', desc: '', phases: buildReceivePhases('4-2', 1, 'perimeter', 'standard', 'switch-late') },
    'switch-late': { id: 'd4', cat: '', name: 'Late Switch Demo', desc: '', phases: buildReceivePhases('5-1', 4, 'perimeter', 'standard', 'switch-late') },
    'switch-early': { id: 'd5', cat: '', name: 'Early Switch Demo', desc: '', phases: buildReceivePhases('5-1', 4, 'perimeter', 'standard', 'switch-early') },
    'perimeter': { id: 'd6', cat: '', name: 'Perimeter Defense', desc: '', phases: buildServePhases('5-1', 1, 'perimeter', 'standard') },
    'rotational': { id: 'd7', cat: '', name: 'Rotational Defense', desc: '', phases: buildServePhases('5-1', 1, 'rotational', 'standard') },
    'man-up': { id: 'd8', cat: '', name: 'Man-Up Defense', desc: '', phases: buildServePhases('5-1', 1, 'man-up', 'standard') },
  }), []);

  if (tab !== 'setup') return null;

  // ─── HELPERS ────────────────────────────────────────────────────────────────
  const copyCoordinates = () => {
    if (currentPhases.length === 0) return;
    const pos = currentPhases[currentPhaseIdx].pos;
    const lines = Object.entries(pos)
      .filter(([_, coord]) => coord !== undefined)
      .map(([pid, coord]) => `      '${pid}': xy(${Math.round(coord!.x)}, ${Math.round(coord!.y)})`)
      .join(',\n');
    navigator.clipboard.writeText(`{\n${lines}\n    }`);
    alert('Copied to clipboard!');
  };

  const changeScenario = (s: Scenario) => {
    setScenario(s); setTeamAnimScenario(s); setTeamAnimProg(0);
    setTeamAnimPlaying(false); setIsEditingPhase(false);
  };

  const key = rotKey(system, rotation);
  const rd = rotationDefaults[key];
  const currentPhases = rd ? (scenario === 'serve' ? rd.servePhases : rd.receivePhases) : [];
  const phaseLabels = scenario === 'serve' ? SERVE_PHASE_LABELS : RECEIVE_PHASE_LABELS;
  
  const derivedIdx = currentPhases.length > 0 ? phIdxFromProg(teamAnimProg, currentPhases.length) : 0;
  const currentPhaseIdx = teamAnimPlaying ? derivedIdx : teamAnimPhaseIndex;

  const playAnimation = () => {
    if (teamAnimProg >= 99) setTeamAnimProg(0);
    setTeamAnimPlaying(true); setIsEditingPhase(false);
  };

  const pauseAnimation = () => {
    setTeamAnimPlaying(false); setTeamAnimPhaseIndex(derivedIdx); setIsEditingPhase(true);
  };

  const jumpToPhase = (idx: number) => {
    if (currentPhases.length === 0) return;
    const n = currentPhases.length;
    const prog = n <= 1 ? 0 : (idx / (n - 1)) * 100;
    setTeamAnimProg(prog); setTeamAnimPhaseIndex(idx);
    setTeamAnimPlaying(false); setIsEditingPhase(true);
  };

  const confirmAndAdvance = () => {
    setConfirmations(prev => ({ ...prev, [rotation]: { ...prev[rotation], [scenario]: true } }));
    setTeamAnimPlaying(false); setTeamAnimProg(0); setIsEditingPhase(false);

    if (scenario === 'serve') {
      changeScenario('receive');
      setTimeout(() => {
        usePlaybookStore.getState().setTeamAnimScenario('receive');
        usePlaybookStore.getState().setTeamAnimProg(0);
        usePlaybookStore.getState().setTeamAnimPlaying(true);
      }, 300);
    } else {
      const nextRot = rotation < 6 ? (rotation + 1) as Rotation : null;
      if (nextRot) {
        setRotation(nextRot); changeScenario('serve');
        setTimeout(() => {
          usePlaybookStore.getState().setTeamAnimScenario('serve');
          usePlaybookStore.getState().setTeamAnimProg(0);
          usePlaybookStore.getState().setTeamAnimPlaying(true);
        }, 300);
      }
    }
  };

  const stopAnim = () => { setTeamAnimPlaying(false); setTeamAnimProg(0); };
  const handleFinish = () => { stopAnim(); completeSetup(); setTab('myteam'); };

  const confirmedCount = ROTATIONS.reduce((acc, r) => acc + (confirmations[r].serve ? 1 : 0) + (confirmations[r].receive ? 1 : 0), 0);
  const totalScenarios = 12;

  // ─── DYNAMIC LAYOUT LOGIC (THE MAGIC MORPH) ──────────────────────────────────
  const isCentered = setupStep < 5 && !hasCompletedSetup;
  
  const containerStyle: React.CSSProperties = isCentered ? {
    position: 'absolute', top: '50%', right: '50%', transform: 'translate(50%, -50%)',
    width: 600, background: 'rgba(10, 20, 40, 0.75)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
    padding: 32, overflowY: 'auto', zIndex: 100, maxHeight: '90vh',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  } : {
    position: 'absolute', top: 12, right: 12, transform: 'translate(0, 0)',
    width: 280, maxHeight: 'calc(100% - 24px)', background: '#0a1428ee',
    border: '1px solid var(--border)', borderRadius: 12,
    padding: 14, overflowY: 'auto', backdropFilter: 'blur(12px)', zIndex: 100,
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  const dots = [0, 1, 2, 3, 4, 5, 6];
  const dotIndex = dots.indexOf(setupStep);

  const rotBtn = (r: Rotation, active: boolean) => {
    const isConfirmed = confirmations[r].serve && confirmations[r].receive;
    const isPartial = confirmations[r].serve || confirmations[r].receive;
    return {
      width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? 'var(--accent)' : isConfirmed ? '#1a4a2e' : '#1e3055',
      color: active ? '#000' : isConfirmed ? '#4ade80' : 'var(--text-mid)',
      border: `2px solid ${active ? 'var(--accent)' : isConfirmed ? '#4ade80' : isPartial ? '#e8a83e60' : '#ffffff18'}`,
      fontSize: 14, fontWeight: 900 as const, cursor: 'pointer' as const, transition: 'all .15s',
    };
  };

  const pill = (active: boolean) => ({
    background: active ? 'var(--accent)' : 'var(--bg-card)',
    color: active ? '#000' : 'var(--text-dim)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700 as const,
    cursor: 'pointer' as const, transition: 'all .15s', flex: 1, textAlign: 'center' as const, position: 'relative' as const
  });

  if (hasCompletedSetup) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5, marginBottom: 12 }}>SETUP COMPLETE</div>
        <button onClick={() => { setSetupStep(0); useTeamStore.setState({ hasCompletedSetup: false }); setConfirmations(initialConfirm()); }} style={{ width: '100%', background: '#e8a83e10', border: '1px solid #e8a83e40', color: 'var(--accent)', borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>Re-run Setup Wizard</button>
        <button onClick={() => setTab('myteam')} style={{ width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Go to My Team</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{STYLES}</style>
      
      {/* Header & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCentered ? 16 : 4 }}>
        <div style={{ fontSize: isCentered ? 18 : 16, fontWeight: 900, color: 'var(--accent)', letterSpacing: 0.5 }}>
          {isCentered ? 'TEAM SETUP' : 'REVIEW ROTATIONS'}
        </div>
        <button onClick={handleFinish} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          Skip Wizard
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: isCentered ? 24 : 16 }}>
        {dots.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= dotIndex ? 'var(--accent)' : '#1e3055', transition: 'background .3s' }} />
        ))}
      </div>

      {/* Step 0: Team Name */}
      {setupStep === 0 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            Welcome to GC Volley! Let's answer a couple questions.
          </div>
          <div className="wiz-anim-2" style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            First, what's your team name? (You can always change this later).
          </div>
          <div className="wiz-anim-3">
            <input
              type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Eagles Volleyball" autoFocus
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', fontSize: 18, fontWeight: 700, color: 'var(--text)', outline: 'none', marginBottom: 16 }}
            />
            <button
              onClick={() => setSetupStep(1)} disabled={!teamName.trim()}
              style={{ width: '100%', background: teamName.trim() ? 'var(--accent)' : '#1e3055', border: 'none', color: teamName.trim() ? '#000' : '#ffffff40', borderRadius: 9, padding: '14px', fontSize: 16, fontWeight: 900, cursor: teamName.trim() ? 'pointer' : 'default' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1: System */}
      {setupStep === 1 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            What offensive system do you run?
          </div>
          <div className="wiz-anim-2" style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            This will define the baseline structure for your serve and serve receive plays.
          </div>

          <div className="wiz-anim-3">
            {SYSTEMS.map(s => (
              <div key={s.key} style={{ marginBottom: 12, background: system === s.key ? '#e8a83e10' : 'var(--bg-card)', border: `2px solid ${system === s.key ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '16px', transition: 'all .12s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: system === s.key ? 'var(--accent)' : 'var(--text)' }}>{s.name}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 4, lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                  {system === s.key ? (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#000' }}>✓</div>
                  ) : (
                    <button onClick={() => setSystem(s.key)} style={{ background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 900, cursor: 'pointer', color: '#000' }}>Select</button>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
                  <button
                    onClick={() => setExpandedSystem(expandedSystem === s.key ? null : s.key)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 0' }}
                  >
                    {expandedSystem === s.key ? '▾ Hide details & animation' : '▸ Learn more & preview'}
                  </button>
                </div>
                {expandedSystem === s.key && (
                  <div style={{ background: '#0d1e3a', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', marginTop: 8 }}>
                    <div style={{ fontSize: 13, color: '#ffffffb0', lineHeight: 1.6, marginBottom: 12 }}>{s.detail}</div>
                    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', border: '1px solid #ffffff20', borderRadius: 8, overflow: 'hidden' }}>
                      <CourtDemo play={demoPlays[s.key]} autoPlay speed={0.4} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button onClick={() => setSetupStep(0)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Back</button>
              <button onClick={() => { stopAnim(); setSetupStep(2); }} style={{ flex: 2, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 9, padding: '12px', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Complexity Level */}
      {setupStep === 2 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            Now let's look at your rotations...
          </div>
          <div className="wiz-anim-2" style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            The purpose of this is to setup defaults of your serve and serve receive. (You can fully edit these by dragging and dropping later, but this builds your starting default transitions).<br/><br/>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>First, what level is your team?</span>
          </div>

          <div className="wiz-anim-3">
            {[
              { key: 'basic', name: 'Basic (Rec / Middle School)', desc: 'No complex overlapping. Simple W-formations.' },
              { key: 'standard', name: 'Standard (JV / Club)', desc: 'Classic 3-man serve receive. Setters hide legally but with spacing.' },
              { key: 'advanced', name: 'Advanced (Varsity / Pro)', desc: 'Extremely tight pixel-perfect stacking.' }
            ].map(lvl => (
              <button
                key={lvl.key} onClick={() => useTeamStore.getState().setComplexityLevel(lvl.key as any)}
                style={{ width: '100%', textAlign: 'left', marginBottom: 12, background: useTeamStore.getState().complexityLevel === lvl.key ? '#e8a83e10' : 'var(--bg-card)', border: `2px solid ${useTeamStore.getState().complexityLevel === lvl.key ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: '16px', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, color: useTeamStore.getState().complexityLevel === lvl.key ? 'var(--accent)' : 'var(--text)' }}>{lvl.name}</div>
                <div style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 4 }}>{lvl.desc}</div>
              </button>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button onClick={() => setSetupStep(1)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Back</button>
              <button onClick={() => setSetupStep(3)} style={{ flex: 2, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 9, padding: '12px', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Transition Timing */}
      {setupStep === 3 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            A more technical question:
          </div>
          <div className="wiz-anim-2" style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            Standard (Late Switch) or X-Plays (Early Switch)? When do your front-row players transition to their base offensive zones?
          </div>

          <div className="wiz-anim-3">
            {[
              { key: 'switch-late', name: 'Hit then Switch (Standard)', desc: 'Players attack straight forward from their current rotational zones (e.g. OP hits from the left if stuck there) and switch AFTER the ball crosses the net.' },
              { key: 'switch-early', name: 'Switch then Hit (X-Plays)', desc: 'Players run directly to their base offensive zones during the set so they can attack from their preferred positions.' }
            ].map(lvl => (
              <div key={lvl.key} style={{ marginBottom: 12, background: useTeamStore.getState().receiveTransition === lvl.key ? '#e8a83e10' : 'var(--bg-card)', border: `2px solid ${useTeamStore.getState().receiveTransition === lvl.key ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '16px', transition: 'all .12s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: useTeamStore.getState().receiveTransition === lvl.key ? 'var(--accent)' : 'var(--text)' }}>{lvl.name}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.4 }}>{lvl.desc}</div>
                  </div>
                  {useTeamStore.getState().receiveTransition === lvl.key ? (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#000' }}>✓</div>
                  ) : (
                    <button onClick={() => useTeamStore.getState().setReceiveTransition(lvl.key as any)} style={{ background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 900, cursor: 'pointer', color: '#000' }}>Select</button>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
                  <button
                    onClick={() => setExpandedTransition(expandedTransition === lvl.key ? null : lvl.key as ReceiveTransition)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 0' }}
                  >
                    {expandedTransition === lvl.key ? '▾ Hide animation' : '▸ See animated example'}
                  </button>
                </div>
                {expandedTransition === lvl.key && (
                  <div style={{ background: '#0d1e3a', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', marginTop: 8 }}>
                    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', border: '1px solid #ffffff20', borderRadius: 8, overflow: 'hidden' }}>
                      <CourtDemo play={demoPlays[lvl.key]} autoPlay speed={0.4} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button onClick={() => setSetupStep(2)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Back</button>
              <button onClick={() => { stopAnim(); setSetupStep(4); }} style={{ flex: 2, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 9, padding: '12px', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Defense Type */}
      {setupStep === 4 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            What base defense do you run?
          </div>
          <div className="wiz-anim-2" style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            This sets your defensive positions for the future. Almost done... next we get to review each rotation on the court!
          </div>

          <div className="wiz-anim-3">
            {DEFENSE_TYPES.map(d => (
              <div key={d.key} style={{ marginBottom: 12, background: defenseType === d.key ? '#e8a83e10' : 'var(--bg-card)', border: `2px solid ${defenseType === d.key ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '16px', transition: 'all .12s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: defenseType === d.key ? 'var(--accent)' : 'var(--text)' }}>{d.name}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.4 }}>{d.desc}</div>
                  </div>
                  {defenseType === d.key ? (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#000' }}>✓</div>
                  ) : (
                    <button onClick={() => setDefenseType(d.key)} style={{ background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 900, cursor: 'pointer', color: '#000' }}>Select</button>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
                  <button
                    onClick={() => setExpandedDefense(expandedDefense === d.key ? null : d.key)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 0' }}
                  >
                    {expandedDefense === d.key ? '▾ Hide details & animation' : '▸ Learn more & preview'}
                  </button>
                </div>
                {expandedDefense === d.key && (
                  <div style={{ background: '#0d1e3a', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', marginTop: 8 }}>
                    <div style={{ fontSize: 13, color: '#ffffffb0', lineHeight: 1.6, marginBottom: 12 }}>{d.detail}</div>
                    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', border: '1px solid #ffffff20', borderRadius: 8, overflow: 'hidden' }}>
                      <CourtDemo play={demoPlays[d.key]} autoPlay speed={0.4} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button onClick={() => setSetupStep(3)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Back</button>
              <button
                onClick={() => {
                  setRotation(1 as Rotation);
                  changeScenario('serve');
                  setSetupStep(5); // Morphs to Side Panel!
                  setTimeout(() => {
                    usePlaybookStore.getState().setTeamAnimScenario('serve');
                    usePlaybookStore.getState().setTeamAnimProg(0);
                    usePlaybookStore.getState().setTeamAnimPlaying(true);
                  }, 500); // Wait for morph to finish before playing
                }}
                style={{ flex: 2, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 9, padding: '12px', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}
              >
                Review Rotations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Per-Rotation Walkthrough (SIDE PANEL MODE) */}
      {setupStep === 5 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.5 }}>
            Watch the animation for each rotation. Confirm or drag players to adjust.
          </div>

          <div style={{ background: '#0d1e3a', borderRadius: 6, padding: '6px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>{confirmedCount}/{totalScenarios}</div>
            <div style={{ flex: 1, height: 4, background: '#1e3055', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(confirmedCount / totalScenarios) * 100}%`, height: '100%', background: confirmedCount === totalScenarios ? '#4ade80' : 'var(--accent)', transition: 'width .3s' }} />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>ROTATION</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {ROTATIONS.map(r => (
                <button key={r} onClick={() => { setRotation(r); stopAnim(); setIsEditingPhase(false); }} style={rotBtn(r, rotation === r)}>
                  {confirmations[r].serve && confirmations[r].receive ? '✓' : r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>SCENARIO</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {(['serve', 'receive'] as Scenario[]).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    changeScenario(s);
                    setTimeout(() => { usePlaybookStore.getState().setTeamAnimScenario(s); usePlaybookStore.getState().setTeamAnimProg(0); usePlaybookStore.getState().setTeamAnimPlaying(true); }, 200);
                  }}
                  style={pill(scenario === s)}
                >
                  {s === 'serve' ? 'Serve' : 'Receive'}
                  {confirmations[rotation][s] && <span style={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, borderRadius: '50%', background: '#4ade80', color: '#000', fontSize: 8, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#0d1e3a', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
              Phase {currentPhaseIdx + 1}/{phaseLabels.length}: {phaseLabels[currentPhaseIdx] || 'Ready'}
            </div>

            <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
              {phaseLabels.map((label, i) => (
                <button
                  key={i} onClick={() => jumpToPhase(i)} title={label}
                  style={{
                    flex: 1, height: 22, borderRadius: 4, cursor: 'pointer', fontSize: 8, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', padding: '0 2px',
                    background: i === currentPhaseIdx ? 'var(--accent)' : i < currentPhaseIdx ? '#e8a83e50' : '#1e3055',
                    color: i === currentPhaseIdx ? '#000' : i < currentPhaseIdx ? 'var(--accent)' : '#ffffff50',
                    border: i === currentPhaseIdx ? '2px solid var(--accent)' : '1px solid #ffffff10',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => jumpToPhase(Math.max(0, currentPhaseIdx - 1))} disabled={currentPhaseIdx <= 0} style={{ width: 36, background: currentPhaseIdx > 0 ? '#1e3055' : '#0d1a2e', border: '1px solid #ffffff18', color: currentPhaseIdx > 0 ? 'var(--text)' : '#ffffff30', borderRadius: 6, padding: '6px', fontSize: 14, fontWeight: 900, cursor: currentPhaseIdx > 0 ? 'pointer' : 'default' }}>◀</button>
              <button onClick={teamAnimPlaying ? pauseAnimation : playAnimation} style={{ flex: 1, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 6, padding: '6px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>{teamAnimPlaying ? '⏸ Pause' : teamAnimProg >= 99 ? '↺ Replay' : '▶ Play'}</button>
              <button onClick={() => jumpToPhase(Math.min(phaseLabels.length - 1, currentPhaseIdx + 1))} disabled={currentPhaseIdx >= phaseLabels.length - 1} style={{ width: 36, background: currentPhaseIdx < phaseLabels.length - 1 ? '#1e3055' : '#0d1a2e', border: '1px solid #ffffff18', color: currentPhaseIdx < phaseLabels.length - 1 ? 'var(--text)' : '#ffffff30', borderRadius: 6, padding: '6px', fontSize: 14, fontWeight: 900, cursor: currentPhaseIdx < phaseLabels.length - 1 ? 'pointer' : 'default' }}>▶</button>
            </div>
          </div>

          {teamAnimPlaying ? (
            <div style={{ fontSize: 11, color: '#ffffff60', lineHeight: 1.5, marginBottom: 8 }}>Pause or click a phase to edit positions.</div>
          ) : (
            <div style={{ background: '#e8a83e10', border: '1px solid #e8a83e30', borderRadius: 7, padding: '6px 10px', marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.5 }}>EDITING PHASE {currentPhaseIdx + 1} — Drag players to adjust.</div>
          )}

          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button onClick={confirmAndAdvance} style={{ flex: 2, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>Looks Good</button>
            <button onClick={() => { resetRotationPhases(system, rotation, scenario); jumpToPhase(0); }} style={{ flex: 1, background: 'none', border: '1px solid #ef444450', color: '#ef4444', borderRadius: 8, padding: '9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Reset</button>
            <button onClick={copyCoordinates} style={{ flex: 1, background: '#10b98120', border: '1px solid #10b98150', color: '#10b981', borderRadius: 8, padding: '9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }} title="Dev Export">Exp</button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { stopAnim(); setSetupStep(4); }} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 9, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Back</button>
            <button onClick={() => { stopAnim(); setSetupStep(6); }} style={{ flex: 2, background: confirmedCount > 0 ? 'var(--accent)' : '#1e3055', border: 'none', color: confirmedCount > 0 ? '#000' : '#ffffff60', borderRadius: 9, padding: '9px', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>{confirmedCount === totalScenarios ? 'Continue' : 'Continue Anyway'}</button>
          </div>
        </div>
      )}

      {/* Step 6: Roster (SIDE PANEL MODE) */}
      {setupStep === 6 && (
        <div className="wiz-anim-1">
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
            Finally, put names to the positions. You can use abbreviations or real names.
          </div>

          {PD.map(pl => (
            <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: pl.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#000' }}>
                {pl.short}
              </div>
              <input
                type="text" value={playerNames[pl.id] || ''} onChange={e => setPlayerName(pl.id as PlayerId, e.target.value)} placeholder={pl.short}
                style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 9px', fontSize: 13, fontWeight: 700, color: 'var(--text)', outline: 'none' }}
              />
              <span style={{ fontSize: 10, color: '#ffffff50', whiteSpace: 'nowrap', minWidth: 46 }}>{pl.role}</span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => { setRotation(1 as Rotation); changeScenario('serve'); setSetupStep(5); }} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: 9, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Back</button>
            <button onClick={handleFinish} style={{ flex: 2, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 9, padding: '9px', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>Finish Setup</button>
          </div>
        </div>
      )}
    </div>
  );
}