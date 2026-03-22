'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerId, System, Rotation, FormationContext, PositionMap, RotationDefaults, TeamPlay, Play, AttackDirection, CoverageStrategy, DefenseType, StrategyProfile } from '@/data/types';
import { FACTORY_DEFAULTS, generateDefensePositions, buildServePhases, buildReceivePhases, rotKey } from '@/data/defaults';
import { PLAYS } from '@/data/plays';

// ═══════════════════════════════════════════════════════════════
// Team Store — player names, rotation defaults, team playbook
// ═══════════════════════════════════════════════════════════════

interface TeamState {
  // Onboarding
  hasCompletedSetup: boolean;
  setupStep: number;
  setSetupStep: (step: number) => void;
  completeSetup: () => void;

  // Team info
  teamName: string;
  setTeamName: (name: string) => void;

  // Player names (global rename)
  playerNames: Record<PlayerId, string>;
  setPlayerName: (pid: PlayerId, name: string) => void;
  resetPlayerNames: () => void;

  // Rotation defaults
  system: System;
  rotation: Rotation;
  formationCtx: FormationContext;
  rotationDefaults: Record<string, RotationDefaults>;
  setSystem: (system: System) => void;
  setRotation: (rotation: Rotation) => void;
  setFormationCtx: (ctx: FormationContext) => void;
  getCurrentPositions: () => PositionMap;
  updatePosition: (pid: PlayerId, x: number, y: number) => void;
  updatePhasePosition: (rotation: Rotation, scenario: 'serve' | 'receive', phaseIndex: number, pid: PlayerId, x: number, y: number) => void;
  resetRotation: (system: System, rotation: Rotation) => void;
  resetRotationPhases: (system: System, rotation: Rotation, scenario: 'serve' | 'receive') => void;

  // Defense type
  defenseType: DefenseType;
  setDefenseType: (type: DefenseType) => void;

  // Coverage
  coverageStrategy: CoverageStrategy;
  setCoverageBlockerCount: (count: 1 | 2) => void;
  updateCoveragePosition: (dir: AttackDirection, pid: PlayerId, x: number, y: number) => void;

  // Strategy profiles
  profiles: StrategyProfile[];
  activeProfileId: string | null;
  saveProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;

  // Team playbook
  teamPlays: TeamPlay[];
  addToTeamPlaybook: (playId: string) => void;
  updateTeamPlay: (id: string, updates: Partial<Play>) => void;
  removeFromTeamPlaybook: (id: string) => void;
}

const DEFAULT_NAMES: Record<PlayerId, string> = {
  S: 'S', OP: 'OP', MB: 'MB', OH: 'OH', RS: 'RS', L: 'L',
};

function cloneDefaults(): Record<string, RotationDefaults> {
  return JSON.parse(JSON.stringify(FACTORY_DEFAULTS));
}

// Default perimeter coverage positions per attack direction
const DEFAULT_COVERAGE: CoverageStrategy = {
  blockerCount: 2,
  coverage: {
    left: {
      S: { x: 200, y: 460 }, OP: { x: 120, y: 340 }, MB: { x: 88, y: 342 },
      OH: { x: 88, y: 322 }, RS: { x: 340, y: 460 }, L: { x: 270, y: 580 },
    },
    center: {
      S: { x: 395, y: 380 }, OP: { x: 380, y: 340 }, MB: { x: 270, y: 318 },
      OH: { x: 160, y: 340 }, RS: { x: 160, y: 460 }, L: { x: 270, y: 580 },
    },
    right: {
      S: { x: 395, y: 340 }, OP: { x: 452, y: 342 }, MB: { x: 458, y: 322 },
      OH: { x: 340, y: 460 }, RS: { x: 200, y: 460 }, L: { x: 270, y: 580 },
    },
  },
};

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasCompletedSetup: false,
      setupStep: 0,
      setSetupStep: (step) => set({ setupStep: step }),
      completeSetup: () => set({ hasCompletedSetup: true, setupStep: 5 }),

      teamName: 'My Team',
      setTeamName: (name) => set({ teamName: name }),

      // Player names
      playerNames: { ...DEFAULT_NAMES },
      setPlayerName: (pid, name) => set((s) => ({
        playerNames: { ...s.playerNames, [pid]: name || DEFAULT_NAMES[pid] },
      })),
      resetPlayerNames: () => set({ playerNames: { ...DEFAULT_NAMES } }),

      // Rotation defaults
      system: '5-1',
      rotation: 1 as Rotation,
      formationCtx: 'serveReceive' as FormationContext,
      rotationDefaults: cloneDefaults(),

      setSystem: (system) => set({ system }),
      setRotation: (rotation) => set({ rotation }),
      setFormationCtx: (ctx) => set({ formationCtx: ctx }),

      getCurrentPositions: () => {
        const { system, rotation, formationCtx, rotationDefaults } = get();
        const key = rotKey(system, rotation);
        const rd = rotationDefaults[key];
        if (!rd) return FACTORY_DEFAULTS['5-1-1'].serveReceive;
        return rd[formationCtx];
      },

      updatePosition: (pid, x, y) => set((s) => {
        const key = rotKey(s.system, s.rotation);
        const rd = s.rotationDefaults[key];
        if (!rd) return s;
        const updated = { ...rd };
        updated[s.formationCtx] = {
          ...updated[s.formationCtx],
          [pid]: { x, y },
        };
        return {
          rotationDefaults: { ...s.rotationDefaults, [key]: updated },
        };
      }),

      updatePhasePosition: (rotation, scenario, phaseIndex, pid, x, y) => set((s) => {
        const key = rotKey(s.system, rotation);
        const rd = s.rotationDefaults[key];
        if (!rd) return s;
        const phasesKey = scenario === 'serve' ? 'servePhases' : 'receivePhases';
        const phases = [...rd[phasesKey]];
        if (!phases[phaseIndex]) return s;
        phases[phaseIndex] = {
          ...phases[phaseIndex],
          pos: { ...phases[phaseIndex].pos, [pid]: { x, y } },
        };
        return {
          rotationDefaults: {
            ...s.rotationDefaults,
            [key]: { ...rd, [phasesKey]: phases },
          },
        };
      }),

      resetRotation: (system, rotation) => set((s) => {
        const key = rotKey(system, rotation);
        const factory = FACTORY_DEFAULTS[key];
        if (!factory) return s;
        return {
          rotationDefaults: {
            ...s.rotationDefaults,
            [key]: JSON.parse(JSON.stringify(factory)),
          },
        };
      }),

      resetRotationPhases: (system, rotation, scenario) => set((s) => {
        const key = rotKey(system, rotation);
        const factory = FACTORY_DEFAULTS[key];
        if (!factory) return s;
        const rd = s.rotationDefaults[key];
        if (!rd) return s;
        const phasesKey = scenario === 'serve' ? 'servePhases' : 'receivePhases';
        return {
          rotationDefaults: {
            ...s.rotationDefaults,
            [key]: { ...rd, [phasesKey]: JSON.parse(JSON.stringify(factory[phasesKey])) },
          },
        };
      }),

      // Defense type
      defenseType: 'perimeter' as DefenseType,

      setDefenseType: (type) => set((s) => {
        const updated = { ...s.rotationDefaults };
        const systems: System[] = ['5-1', '6-2', '4-2'];
        const rotations: Rotation[] = [1, 2, 3, 4, 5, 6];
        for (const sys of systems) {
          for (const rot of rotations) {
            const key = rotKey(sys, rot);
            if (updated[key]) {
              updated[key] = {
                ...updated[key],
                baseDefense: generateDefensePositions(sys, rot, type),
                servePhases: buildServePhases(sys, rot, type),
              };
            }
          }
        }
        return { defenseType: type, rotationDefaults: updated };
      }),

      // Coverage
      coverageStrategy: JSON.parse(JSON.stringify(DEFAULT_COVERAGE)),

      setCoverageBlockerCount: (count) => set((s) => ({
        coverageStrategy: { ...s.coverageStrategy, blockerCount: count },
      })),

      updateCoveragePosition: (dir, pid, x, y) => set((s) => ({
        coverageStrategy: {
          ...s.coverageStrategy,
          coverage: {
            ...s.coverageStrategy.coverage,
            [dir]: {
              ...s.coverageStrategy.coverage[dir],
              [pid]: { x, y },
            },
          },
        },
      })),

      // Strategy profiles
      profiles: [],
      activeProfileId: null,

      saveProfile: (name) => set((s) => {
        const profile: StrategyProfile = {
          id: `profile_${Date.now()}`,
          name,
          createdAt: Date.now(),
          system: s.system,
          defenseType: s.defenseType,
          rotationDefaults: JSON.parse(JSON.stringify(s.rotationDefaults)),
          coverageStrategy: JSON.parse(JSON.stringify(s.coverageStrategy)),
        };
        return {
          profiles: [...s.profiles, profile],
          activeProfileId: profile.id,
        };
      }),

      loadProfile: (id) => set((s) => {
        const profile = s.profiles.find(p => p.id === id);
        if (!profile) return s;
        return {
          system: profile.system,
          defenseType: profile.defenseType,
          rotationDefaults: JSON.parse(JSON.stringify(profile.rotationDefaults)),
          coverageStrategy: JSON.parse(JSON.stringify(profile.coverageStrategy)),
          activeProfileId: id,
        };
      }),

      deleteProfile: (id) => set((s) => ({
        profiles: s.profiles.filter(p => p.id !== id),
        activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
      })),

      renameProfile: (id, name) => set((s) => ({
        profiles: s.profiles.map(p => p.id === id ? { ...p, name } : p),
      })),

      // Team playbook
      teamPlays: [],

      addToTeamPlaybook: (playId) => set((s) => {
        if (s.teamPlays.some(tp => tp.sourceId === playId)) return s;
        const source = PLAYS.find(p => p.id === playId);
        if (!source) return s;
        const clone: TeamPlay = {
          ...JSON.parse(JSON.stringify(source)),
          id: `team_${playId}`,
          sourceId: playId,
          isCustomized: false,
        };
        return { teamPlays: [...s.teamPlays, clone] };
      }),

      updateTeamPlay: (id, updates) => set((s) => ({
        teamPlays: s.teamPlays.map(tp =>
          tp.id === id ? { ...tp, ...updates, isCustomized: true } : tp
        ),
      })),

      removeFromTeamPlaybook: (id) => set((s) => ({
        teamPlays: s.teamPlays.filter(tp => tp.id !== id),
      })),
    }),
    {
      name: 'voltex-team',
      skipHydration: true,
      partialize: (state) => ({
        hasCompletedSetup: state.hasCompletedSetup,
        teamName: state.teamName,
        playerNames: state.playerNames,
        system: state.system,
        rotation: state.rotation,
        formationCtx: state.formationCtx,
        defenseType: state.defenseType,
        rotationDefaults: state.rotationDefaults,
        coverageStrategy: state.coverageStrategy,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        teamPlays: state.teamPlays,
      }),
    }
  )
);
