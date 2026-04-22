import {
  DETECTION_STIMULI,
  DETECTION_LEVELS,
  DISCRIMINATION_PAIRS,
  DISCRIMINATION_LEVELS,
  WORDS,
  WORDS_LEVELS,
  DetectionStimulus,
  Word,
} from '../constants/AudioContent';
import type { Level } from '../constants/Modules';

// ==================== TRIAL TYPES ====================

export type DetectionTrial = {
  stimulusId: string;
  label: string;
  file: ReturnType<typeof require>;
  isSilence: boolean;
};

export type DiscriminationTrial = {
  pairId: string;
  labelA: string;
  labelB: string;
  soundA: ReturnType<typeof require>;
  soundB: ReturnType<typeof require>;
  correctAnswer: 'same' | 'different';
};

export type WordCard = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export type WordTrial = {
  targetId: string;
  targetLabel: string;
  targetFile: ReturnType<typeof require>;
  cards: WordCard[];
};

// ==================== RNG HELPERS ====================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleN<T>(pool: readonly T[], n: number): T[] {
  if (pool.length >= n) return shuffle(pool).slice(0, n);
  // With replacement when pool too small
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}

// ==================== MODULE 1 — DETECTION ====================

export function generateDetectionTrials(level: Level): DetectionTrial[] {
  const cfg = DETECTION_LEVELS[level];
  const catchCount = Math.round(10 * cfg.catchRatio);
  const soundCount = 10 - catchCount;

  // Build candidate pool from the level's enabled categories
  const pool: DetectionStimulus[] = cfg.pool.flatMap((cat) =>
    cat === 'environmental'
      ? DETECTION_STIMULI.environmental
      : DETECTION_STIMULI.phonetic
  );

  const soundTrials: DetectionTrial[] = sampleN(pool, soundCount).map((s) => ({
    stimulusId: s.id,
    label: s.label,
    file: s.file,
    isSilence: false,
  }));

  const silenceStim = DETECTION_STIMULI.silence;
  const catchTrials: DetectionTrial[] = Array.from({ length: catchCount }, () => ({
    stimulusId: silenceStim.id,
    label: silenceStim.label,
    file: silenceStim.file,
    isSilence: true,
  }));

  return shuffle([...soundTrials, ...catchTrials]);
}

// ==================== MODULE 2 — DISCRIMINATION ====================

export function generateDiscriminationTrials(level: Level): DiscriminationTrial[] {
  const cfg = DISCRIMINATION_LEVELS[level];
  const pairs = DISCRIMINATION_PAIRS[cfg.pool];

  return Array.from({ length: 10 }, (): DiscriminationTrial => {
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const isSame = Math.random() < 0.5;
    if (isSame) {
      return {
        pairId: pair.id,
        labelA: pair.labelA,
        labelB: pair.labelA,
        soundA: pair.soundA,
        soundB: pair.soundA,
        correctAnswer: 'same',
      };
    }
    return {
      pairId: pair.id,
      labelA: pair.labelA,
      labelB: pair.labelB,
      soundA: pair.soundA,
      soundB: pair.soundB,
      correctAnswer: 'different',
    };
  });
}

// ==================== MODULE 3 — WORDS ====================

export function generateWordTrials(level: Level): WordTrial[] {
  const cfg = WORDS_LEVELS[level];

  const filtered: Word[] = (() => {
    if (cfg.syllables === 'mono') return WORDS.filter((w) => w.syllables === 'mono');
    if (cfg.syllables === 'mixed') return WORDS.filter((w) => w.syllables === 'mono' || w.syllables === 'bi');
    return WORDS.slice();
  })();

  // Fallback: if filtered pool is too small for even 1 target + 2 distractors, use all words
  const pool = filtered.length >= 3 ? filtered : WORDS.slice();

  const usedTargets = new Set<string>();

  return Array.from({ length: 10 }, (): WordTrial => {
    // Pick a target, preferring words not yet used as target this session
    const candidates = pool.filter((w) => !usedTargets.has(w.id));
    const targetPool = candidates.length > 0 ? candidates : pool;
    const target = targetPool[Math.floor(Math.random() * targetPool.length)];
    usedTargets.add(target.id);

    // Distractor count
    const distractors = cfg.distractors;
    const n = Array.isArray(distractors)
      ? randomInt(distractors[0], distractors[1])
      : distractors;

    // Sample N distractors, excluding the target
    const distractorPool = pool.filter((w) => w.id !== target.id);
    const selectedDistractors = sampleN(distractorPool, n);

    const cards: WordCard[] = shuffle(
      [target, ...selectedDistractors].map((w) => ({
        id: w.id,
        label: w.label,
        icon: w.icon,
        color: w.color,
      }))
    );

    return {
      targetId: target.id,
      targetLabel: target.label,
      targetFile: target.file,
      cards,
    };
  });
}

// ==================== LEVEL PROGRESSION ====================

const SESSION_TRIAL_COUNT = 10;

export function computeNextLevel(
  currentLevel: Level,
  correctCount: number
): { nextLevel: Level; changed: 'promoted' | 'demoted' | 'same' } {
  const accuracy = Math.round((correctCount / SESSION_TRIAL_COUNT) * 100);
  if (accuracy >= 80 && currentLevel < 3) {
    return { nextLevel: (currentLevel + 1) as Level, changed: 'promoted' };
  }
  if (accuracy < 50 && currentLevel > 1) {
    return { nextLevel: (currentLevel - 1) as Level, changed: 'demoted' };
  }
  return { nextLevel: currentLevel, changed: 'same' };
}
