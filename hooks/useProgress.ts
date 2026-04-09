import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface ModuleProgress {
  totalAttempts: number;
  correctAttempts: number;
  lastPlayed: string | null;
}

export interface DailyProgress {
  date: string;
  minutesTrained: number;
  accuracy: number;
}

export interface AppProgress {
  userName: string;
  totalMinutes: number;
  currentStreak: number;
  lastTrainedDate: string | null;
  weeklyData: DailyProgress[];
  modules: {
    detection: ModuleProgress;
    discrimination: ModuleProgress;
    words: ModuleProgress;
  };
  achievements: string[];
}

const DEFAULT_PROGRESS: AppProgress = {
  userName: 'Alex',
  totalMinutes: 0,
  currentStreak: 0,
  lastTrainedDate: null,
  weeklyData: [],
  modules: {
    detection: { totalAttempts: 0, correctAttempts: 0, lastPlayed: null },
    discrimination: { totalAttempts: 0, correctAttempts: 0, lastPlayed: null },
    words: { totalAttempts: 0, correctAttempts: 0, lastPlayed: null },
  },
  achievements: [],
};

const STORAGE_KEY = '@soundsteps_progress';

export function useProgress() {
  const [progress, setProgress] = useState<AppProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (e) {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async (updated: AppProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProgress(updated);
    } catch (e) {
      // silently fail
    }
  }, []);

  const recordSession = useCallback(async (
    module: 'detection' | 'discrimination' | 'words',
    correct: number,
    total: number,
    minutes: number,
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...progress };

    updated.modules[module] = {
      totalAttempts: updated.modules[module].totalAttempts + total,
      correctAttempts: updated.modules[module].correctAttempts + correct,
      lastPlayed: today,
    };

    updated.totalMinutes += minutes;

    // Update streak
    if (updated.lastTrainedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      if (updated.lastTrainedDate === yStr) {
        updated.currentStreak += 1;
      } else {
        updated.currentStreak = 1;
      }
      updated.lastTrainedDate = today;
    }

    // Update weekly data
    const todayEntry = updated.weeklyData.find((d) => d.date === today);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    if (todayEntry) {
      todayEntry.minutesTrained += minutes;
      todayEntry.accuracy = Math.round((todayEntry.accuracy + accuracy) / 2);
    } else {
      updated.weeklyData.push({ date: today, minutesTrained: minutes, accuracy });
      if (updated.weeklyData.length > 7) {
        updated.weeklyData = updated.weeklyData.slice(-7);
      }
    }

    // Check achievements
    if (!updated.achievements.includes('first_session')) {
      updated.achievements.push('first_session');
    }
    if (updated.currentStreak >= 7 && !updated.achievements.includes('first_week')) {
      updated.achievements.push('first_week');
    }
    const overallAccuracy = Object.values(updated.modules).reduce(
      (acc, m) => acc + (m.totalAttempts > 0 ? m.correctAttempts / m.totalAttempts : 0),
      0
    ) / 3;
    if (overallAccuracy >= 0.8 && !updated.achievements.includes('accuracy_80')) {
      updated.achievements.push('accuracy_80');
    }

    await saveProgress(updated);
  }, [progress, saveProgress]);

  const getWeeklyAccuracy = useCallback(() => {
    const allModules = Object.values(progress.modules);
    const total = allModules.reduce((a, m) => a + m.totalAttempts, 0);
    const correct = allModules.reduce((a, m) => a + m.correctAttempts, 0);
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [progress]);

  const getModuleAccuracy = useCallback((module: 'detection' | 'discrimination' | 'words') => {
    const m = progress.modules[module];
    return m.totalAttempts > 0 ? Math.round((m.correctAttempts / m.totalAttempts) * 100) : 0;
  }, [progress]);

  const getTodayMinutes = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const entry = progress.weeklyData.find((d) => d.date === today);
    return entry?.minutesTrained ?? 0;
  }, [progress]);

  return { progress, loading, recordSession, getWeeklyAccuracy, getModuleAccuracy, getTodayMinutes };
}
