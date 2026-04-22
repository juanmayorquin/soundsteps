import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { Level, ModuleId } from '../constants/Modules';

// ==================== TYPES ====================

export type { Level, ModuleId };

export interface TrialLog {
  stimulusId: string;
  level: Level;
  noiseVolume: number;
  response: string;
  correct: boolean;
  timestamp: number;
}

export interface DailyProgress {
  date: string;
  minutesTrained: number;
  accuracy: number;
}

export interface ModuleProgress {
  currentLevel: Level;
  trials: TrialLog[];
  levelStats: {
    [L in Level]?: { correct: number; total: number; sessions: number };
  };
}

export interface AppProgress {
  schemaVersion: 2;
  userName: string;
  totalMinutes: number;
  currentStreak: number;
  lastTrainedDate: string | null;
  weeklyData: DailyProgress[];
  modules: Record<ModuleId, ModuleProgress>;
  achievements: string[];
}

// ==================== CONSTANTS ====================

const STORAGE_KEY = '@soundsteps_progress';
const TRIAL_RING_CAPACITY = 200;

const DEFAULT_MODULE_PROGRESS: ModuleProgress = {
  currentLevel: 1,
  trials: [],
  levelStats: {},
};

const DEFAULT_PROGRESS: AppProgress = {
  schemaVersion: 2,
  userName: 'Alex',
  totalMinutes: 0,
  currentStreak: 0,
  lastTrainedDate: null,
  weeklyData: [],
  modules: {
    detection: { ...DEFAULT_MODULE_PROGRESS },
    discrimination: { ...DEFAULT_MODULE_PROGRESS },
    words: { ...DEFAULT_MODULE_PROGRESS },
  },
  achievements: [],
};

// ==================== MIGRATION ====================

function cloneDefault(): AppProgress {
  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
}

function migrateModule(v1: { correctAttempts?: number; totalAttempts?: number } | undefined): ModuleProgress {
  const correct = v1?.correctAttempts ?? 0;
  const total = v1?.totalAttempts ?? 0;
  return {
    currentLevel: 1,
    trials: [],
    levelStats: total > 0 ? { 1: { correct, total, sessions: 0 } } : {},
  };
}

function normalise(p: AppProgress): AppProgress {
  const safeModule = (m: Partial<ModuleProgress> | undefined): ModuleProgress => ({
    currentLevel: (m?.currentLevel as Level) ?? 1,
    trials: Array.isArray(m?.trials) ? (m!.trials as TrialLog[]).slice(-TRIAL_RING_CAPACITY) : [],
    levelStats: m?.levelStats ?? {},
  });
  return {
    ...p,
    modules: {
      detection: safeModule(p.modules?.detection),
      discrimination: safeModule(p.modules?.discrimination),
      words: safeModule(p.modules?.words),
    },
  };
}

function migrate(raw: unknown): AppProgress {
  try {
    if (!raw || typeof raw !== 'object') return cloneDefault();
    const obj = raw as Record<string, unknown>;

    // Already v2
    if (obj.schemaVersion === 2) {
      return normalise(obj as AppProgress);
    }

    // v1 payload — coerce
    const v1Modules = (obj.modules ?? {}) as Record<string, {
      correctAttempts?: number; totalAttempts?: number; lastPlayed?: string | null;
    }>;

    const migrated: AppProgress = {
      schemaVersion: 2,
      userName: (obj.userName as string) ?? DEFAULT_PROGRESS.userName,
      totalMinutes: (obj.totalMinutes as number) ?? 0,
      currentStreak: (obj.currentStreak as number) ?? 0,
      lastTrainedDate: (obj.lastTrainedDate as string | null) ?? null,
      weeklyData: Array.isArray(obj.weeklyData) ? (obj.weeklyData as DailyProgress[]) : [],
      modules: {
        detection: migrateModule(v1Modules.detection),
        discrimination: migrateModule(v1Modules.discrimination),
        words: migrateModule(v1Modules.words),
      },
      achievements: Array.isArray(obj.achievements) ? (obj.achievements as string[]) : [],
    };
    return migrated;
  } catch {
    return cloneDefault();
  }
}

// ==================== SHARED STATE (module-level singleton) ====================

let _sharedProgress: AppProgress | null = null;
let _sharedLoading = true;
const _listeners = new Set<(p: AppProgress) => void>();
const _loadingListeners = new Set<(v: boolean) => void>();

function broadcastProgress(p: AppProgress) {
  _sharedProgress = p;
  _listeners.forEach((fn) => fn(p));
}

function broadcastLoading(v: boolean) {
  _sharedLoading = v;
  _loadingListeners.forEach((fn) => fn(v));
}

// ==================== HOOK ====================

export function useProgress() {
  const [progress, setProgress] = useState<AppProgress>(() => _sharedProgress ?? cloneDefault());
  const [loading, setLoading] = useState(() => _sharedLoading);

  useEffect(() => {
    _listeners.add(setProgress);
    _loadingListeners.add(setLoading);
    // If another instance already loaded, adopt its state immediately
    if (_sharedProgress !== null) {
      setProgress(_sharedProgress);
      setLoading(false);
    } else {
      loadProgress();
    }
    return () => {
      _listeners.delete(setProgress);
      _loadingListeners.delete(setLoading);
    };
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const raw = stored ? JSON.parse(stored) : null;
      const migrated = migrate(raw);
      if (!stored || !raw || (raw as any).schemaVersion !== 2) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
      broadcastProgress(migrated);
    } catch {
      broadcastProgress(cloneDefault());
    } finally {
      broadcastLoading(false);
    }
  };

  const saveProgress = useCallback(async (updated: AppProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastProgress(updated);
    } catch {
      // silently fail
    }
  }, []);

  // ==================== V1 API (backward compatible) ====================

  const recordSession = useCallback(async (
    module: ModuleId,
    correct: number,
    total: number,
    minutes: number,
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...(_sharedProgress ?? progress) };

    // Update legacy levelStats for backward compat (aggregates for home screen)
    const mod = { ...updated.modules[module] };
    const s = { ...(mod.levelStats[mod.currentLevel] ?? { correct: 0, total: 0, sessions: 0 }) };
    // Note: levelStats is already updated via logTrial during the session
    // recordSession is called at end just for streak/minutes/weeklyData
    mod.levelStats = { ...mod.levelStats };
    updated.modules = { ...updated.modules, [module]: mod };

    updated.totalMinutes = (updated.totalMinutes ?? 0) + minutes;

    // Update streak
    if (updated.lastTrainedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      if (updated.lastTrainedDate === yStr) {
        updated.currentStreak = (updated.currentStreak ?? 0) + 1;
      } else {
        updated.currentStreak = 1;
      }
      updated.lastTrainedDate = today;
    }

    // Update weekly data
    const weeklyData = [...(updated.weeklyData ?? [])];
    const todayEntry = weeklyData.find((d) => d.date === today);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    if (todayEntry) {
      todayEntry.minutesTrained += minutes;
      todayEntry.accuracy = Math.round((todayEntry.accuracy + accuracy) / 2);
    } else {
      weeklyData.push({ date: today, minutesTrained: minutes, accuracy });
      if (weeklyData.length > 7) {
        weeklyData.splice(0, weeklyData.length - 7);
      }
    }
    updated.weeklyData = weeklyData;

    // Check achievements
    const achievements = [...(updated.achievements ?? [])];
    if (!achievements.includes('first_session')) {
      achievements.push('first_session');
    }
    if ((updated.currentStreak ?? 0) >= 7 && !achievements.includes('first_week')) {
      achievements.push('first_week');
    }
    updated.achievements = achievements;

    await saveProgress(updated);
  }, [progress, saveProgress]);

  const getWeeklyAccuracy = useCallback(() => {
    const allModules = Object.values(progress.modules);
    let totalTrials = 0;
    let correctTrials = 0;
    allModules.forEach((m) => {
      m.trials.forEach((t) => {
        totalTrials += 1;
        if (t.correct) correctTrials += 1;
      });
    });
    return totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
  }, [progress]);

  const getModuleAccuracy = useCallback((module: ModuleId) => {
    const m = progress.modules[module];
    const allTrials = m.trials;
    if (allTrials.length === 0) return 0;
    const correct = allTrials.filter((t) => t.correct).length;
    return Math.round((correct / allTrials.length) * 100);
  }, [progress]);

  const getTodayMinutes = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const entry = progress.weeklyData.find((d) => d.date === today);
    return entry?.minutesTrained ?? 0;
  }, [progress]);

  // ==================== V2 API ====================

  const logTrial = useCallback(async (moduleId: ModuleId, trial: TrialLog) => {
    const base = _sharedProgress ?? progress;
    const updated = { ...base };
    const mod = { ...updated.modules[moduleId] };

    // Ring buffer
    const trials = mod.trials.length >= TRIAL_RING_CAPACITY
      ? mod.trials.slice(1)
      : mod.trials.slice();
    trials.push(trial);

    // Update levelStats
    const s = { ...(mod.levelStats[trial.level] ?? { correct: 0, total: 0, sessions: 0 }) };
    s.total += 1;
    if (trial.correct) s.correct += 1;

    mod.trials = trials;
    mod.levelStats = { ...mod.levelStats, [trial.level]: s };
    updated.modules = { ...updated.modules, [moduleId]: mod };

    await saveProgress(updated);
  }, [progress, saveProgress]);

  const updateLevel = useCallback(async (moduleId: ModuleId, newLevel: Level) => {
    const base = _sharedProgress ?? progress;
    const updated = { ...base };
    const mod = { ...updated.modules[moduleId] };

    mod.currentLevel = newLevel;
    const s = { ...(mod.levelStats[newLevel] ?? { correct: 0, total: 0, sessions: 0 }) };
    s.sessions += 1;
    mod.levelStats = { ...mod.levelStats, [newLevel]: s };
    updated.modules = { ...updated.modules, [moduleId]: mod };

    await saveProgress(updated);
  }, [progress, saveProgress]);

  const getRecentAccuracy = useCallback((moduleId: ModuleId, level: Level, lastN?: number): number => {
    const filtered = progress.modules[moduleId].trials.filter((t) => t.level === level);
    const slice = lastN !== undefined ? filtered.slice(-lastN) : filtered;
    if (slice.length === 0) return 0;
    const correct = slice.filter((t) => t.correct).length;
    return Math.round((correct / slice.length) * 100);
  }, [progress]);

  const isUnlocked = useCallback((moduleId: ModuleId): boolean => {
    if (moduleId === 'detection') return true;
    const prereq: ModuleId = moduleId === 'discrimination' ? 'detection' : 'discrimination';
    const l1Trials = progress.modules[prereq].trials.filter((t) => t.level === 1);
    if (l1Trials.length < 10) return false;
    // Use last 10 trials (= last session) to match computeNextLevel's per-session criteria
    return getRecentAccuracy(prereq, 1, 10) >= 80;
  }, [progress, getRecentAccuracy]);

  return {
    progress,
    loading,
    reload: loadProgress,
    // v1 API
    recordSession,
    getWeeklyAccuracy,
    getModuleAccuracy,
    getTodayMinutes,
    // v2 API
    logTrial,
    updateLevel,
    isUnlocked,
    getRecentAccuracy,
  };
}
