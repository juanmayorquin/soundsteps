import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { DISCRIMINATION_LEVELS, NOISE_TRACKS, type DiscriminationPair } from '../../constants/AudioContent';
import { useAudio } from '../../hooks/useAudio';
import { useProgress } from '../../hooks/useProgress';
import { generateDiscriminationTrials, computeNextLevel, type DiscriminationTrial } from '../../lib/trials';
import type { Level } from '../../constants/Modules';

type Phase = 'idle' | 'playingA' | 'playingB' | 'bothPlayed' | 'feedback' | 'done';

const SESSION_TRIAL_COUNT = 10;

export default function DiscriminationScreen() {
  const { progress, loading, isUnlocked, logTrial, updateLevel, recordSession } = useProgress();
  const { play, playFeedback, playNoise, stopNoise, isPlaying } = useAudio();

  const currentLevel = progress.modules.discrimination.currentLevel as Level;
  const [trials, setTrials] = useState<DiscriminationTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [hasPlayedA, setHasPlayedA] = useState(false);
  const [hasPlayedB, setHasPlayedB] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [levelChange, setLevelChange] = useState<'promoted' | 'demoted' | 'same'>('same');
  const [nextLevelResult, setNextLevelResult] = useState<Level>(currentLevel);

  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());
  const noiseStarted = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Deep-link guard
  useEffect(() => {
    if (!loading && !isUnlocked('discrimination')) {
      router.replace('/(tabs)/exercises');
    }
  }, [loading, isUnlocked]);

  // Generate trials and start noise on mount
  useEffect(() => {
    if (!loading) {
      const generated = generateDiscriminationTrials(currentLevel);
      setTrials(generated);
      scoreRef.current = 0;
      startTime.current = Date.now();

      const levelCfg = DISCRIMINATION_LEVELS[currentLevel];
      if (!noiseStarted.current && levelCfg.noiseVolume > 0) {
        noiseStarted.current = true;
        const noiseTrack =
          currentLevel === 1 ? NOISE_TRACKS.low :
          currentLevel === 2 ? NOISE_TRACKS.medium :
          NOISE_TRACKS.high;
        playNoise(noiseTrack, levelCfg.noiseVolume);
      }
    }
  }, [loading]);

  const currentTrial = trials[trialIndex];

  const animateFeedback = useCallback(() => {
    feedbackAnim.setValue(0);
    Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [feedbackAnim]);

  const handlePlayA = useCallback(async () => {
    if (isPlaying) return;
    setPhase('playingA');
    await play(currentTrial.soundA);
    // hasPlayedA is set in the isPlaying useEffect when playback actually ends
  }, [isPlaying, play, currentTrial]);

  const handlePlayB = useCallback(async () => {
    if (isPlaying) return;
    setPhase('playingB');
    await play(currentTrial.soundB);
    // hasPlayedB is set in the isPlaying useEffect when playback actually ends
  }, [isPlaying, play, currentTrial]);

  // Detect playback end during playingA/playingB
  useEffect(() => {
    if (!isPlaying) {
      if (phase === 'playingA') {
        setHasPlayedA(true);
        setPhase(hasPlayedB ? 'bothPlayed' : 'idle');
      } else if (phase === 'playingB') {
        setHasPlayedB(true);
        setPhase(hasPlayedA ? 'bothPlayed' : 'idle');
      }
    }
  }, [isPlaying]);

  const handleAnswer = useCallback(async (answer: 'same' | 'different') => {
    if (phase !== 'bothPlayed') return;
    if (!hasPlayedA || !hasPlayedB) return;

    const correct = answer === currentTrial.correctAnswer;

    if (correct) {
      scoreRef.current += 1;
      setScore((s) => s + 1);
    }
    setLastCorrect(correct);

    setPhase('feedback');
    animateFeedback();
    playFeedback(correct ? 'correct' : 'incorrect');

    await logTrial('discrimination', {
      stimulusId: currentTrial.pairId,
      level: currentLevel,
      noiseVolume: DISCRIMINATION_LEVELS[currentLevel].noiseVolume,
      response: answer,
      correct,
      timestamp: Date.now(),
    });

    setTimeout(async () => {
      const nextIndex = trialIndex + 1;
      if (nextIndex >= SESSION_TRIAL_COUNT) {
        await stopNoise();
        const result = computeNextLevel(currentLevel, scoreRef.current);
        setLevelChange(result.changed);
        setNextLevelResult(result.nextLevel);
        await updateLevel('discrimination', result.nextLevel);
        const minutes = Math.ceil((Date.now() - startTime.current) / 60000);
        await recordSession('discrimination', scoreRef.current, SESSION_TRIAL_COUNT, minutes);
        setPhase('done');
      } else {
        setTrialIndex(nextIndex);
        setHasPlayedA(false);
        setHasPlayedB(false);
        setLastCorrect(null);
        setPhase('idle');
      }
    }, 1200);
  }, [
    phase, hasPlayedA, hasPlayedB, currentTrial, currentLevel, trialIndex,
    logTrial, playFeedback, stopNoise, updateLevel, recordSession, animateFeedback,
  ]);

  if (loading || trials.length === 0) {
    return <SafeAreaView style={styles.container} />;
  }

  if (phase === 'done') {
    const pct = Math.round((scoreRef.current / SESSION_TRIAL_COUNT) * 100);
    const levelCopy =
      levelChange === 'promoted' ? `¡Subiste al Nivel ${nextLevelResult}!` :
      levelChange === 'demoted'  ? `Volviste al Nivel ${nextLevelResult}. ¡Seguís progresando!` :
      `Mantuviste el Nivel ${nextLevelResult}. ¡Muy bien!`;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <MaterialIcons name="check-circle" size={64} color={Colors.green500} />
          <Text style={styles.doneTitle}>¡Sesión completada!</Text>
          <Text style={styles.doneSubtitle}>{scoreRef.current} de {SESSION_TRIAL_COUNT} correctos</Text>
          <View style={styles.doneScore}>
            <Text style={styles.doneScoreNumber}>{pct}%</Text>
            <Text style={styles.doneScoreLabel}>Precisión</Text>
          </View>
          <Text style={styles.levelCopy}>{levelCopy}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canAnswer = phase === 'bothPlayed';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discriminación de sonidos</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>PROGRESO</Text>
            <Text style={styles.progressCount}>Intento {trialIndex + 1} de {SESSION_TRIAL_COUNT}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(trialIndex / SESSION_TRIAL_COUNT) * 100}%` }]} />
          </View>
        </View>

        {/* Level chip */}
        <View style={styles.levelChipRow}>
          <View style={styles.levelChip}>
            <Text style={styles.levelChipText}>Nivel {currentLevel}</Text>
          </View>
        </View>

        {/* Instruction */}
        <View style={styles.instruction}>
          <Text style={styles.instructionTitle}>Escuchá atentamente</Text>
          <Text style={styles.instructionSub}>¿Estos dos sonidos son iguales?</Text>
        </View>

        {/* Playback Cards */}
        <View style={styles.playbackRow}>
          {/* Sound A */}
          <TouchableOpacity
            style={[styles.soundCard, phase === 'playingA' && styles.soundCardActive]}
            onPress={handlePlayA}
            activeOpacity={0.8}
            disabled={phase === 'feedback' || phase === 'done'}
          >
            <View style={[styles.playCircle, phase === 'playingA' && styles.playCircleActive]}>
              <MaterialIcons
                name={phase === 'playingA' ? 'pause' : 'play-arrow'}
                size={32}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.soundLabel}>Sonido A</Text>
            {hasPlayedA && <View style={styles.playedDot} />}
          </TouchableOpacity>

          {/* Sound B */}
          <TouchableOpacity
            style={[styles.soundCard, phase === 'playingB' && styles.soundCardActive]}
            onPress={handlePlayB}
            activeOpacity={0.8}
            disabled={phase === 'feedback' || phase === 'done'}
          >
            <View style={[styles.playCircle, phase === 'playingB' && styles.playCircleActive]}>
              <MaterialIcons
                name={phase === 'playingB' ? 'pause' : 'play-arrow'}
                size={32}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.soundLabel}>Sonido B</Text>
            {hasPlayedB && <View style={styles.playedDot} />}
          </TouchableOpacity>
        </View>

        {/* Feedback */}
        {phase === 'feedback' && (
          <Animated.View
            style={[
              styles.feedbackBanner,
              { opacity: feedbackAnim, backgroundColor: lastCorrect ? '#dcfce7' : '#fee2e2' },
            ]}
          >
            <MaterialIcons
              name={lastCorrect ? 'check-circle' : 'cancel'}
              size={18}
              color={lastCorrect ? Colors.green500 : Colors.red400}
            />
            <Text style={[styles.feedbackText, { color: lastCorrect ? Colors.green500 : Colors.red400 }]}>
              {lastCorrect ? '¡Correcto!' : 'No era — ¡siguiente ronda!'}
            </Text>
          </Animated.View>
        )}

        {/* Hint when not both played */}
        {phase !== 'feedback' && !canAnswer && (
          <Text style={styles.hint}>
            {!hasPlayedA && !hasPlayedB
              ? 'Escuchá los dos sonidos para responder'
              : !hasPlayedA
                ? 'Escuchá el Sonido A'
                : 'Escuchá el Sonido B'}
          </Text>
        )}

        {/* Answer Buttons */}
        <View style={styles.answerSection}>
          <TouchableOpacity
            style={[styles.answerBtn, styles.answerBtnSame, !canAnswer && styles.answerBtnDisabled]}
            onPress={() => handleAnswer('same')}
            disabled={!canAnswer}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.answerBtnText}>Igual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerBtn, styles.answerBtnDiff, !canAnswer && styles.answerBtnDisabled]}
            onPress={() => handleAnswer('different')}
            disabled={!canAnswer}
            activeOpacity={0.85}
          >
            <MaterialIcons name="cancel" size={20} color={Colors.slate700} />
            <Text style={[styles.answerBtnText, { color: Colors.slate700 }]}>Diferente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.primary}18`,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: Colors.slate900,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: Colors.slate500,
    letterSpacing: 0.8,
  },
  progressCount: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.slate200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  levelChipRow: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  levelChip: {
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelChipText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  instruction: {
    marginBottom: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: Colors.slate900,
  },
  instructionSub: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: Colors.slate500,
    marginTop: 4,
  },
  playbackRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  soundCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  soundCardActive: {
    borderColor: Colors.primary,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircleActive: {
    backgroundColor: `${Colors.primary}30`,
  },
  soundLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: Colors.slate700,
  },
  playedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  feedbackText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
  },
  hint: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate500,
    textAlign: 'center',
    marginBottom: 12,
  },
  answerSection: {
    gap: 12,
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  answerBtnSame: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  answerBtnDiff: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  answerBtnDisabled: { opacity: 0.4 },
  answerBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: '#fff',
  },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  doneTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: Colors.slate900,
  },
  doneSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: Colors.slate500,
  },
  doneScore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  doneScoreNumber: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 32,
    color: Colors.primary,
  },
  doneScoreLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: Colors.slate500,
  },
  levelCopy: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 15,
    color: Colors.slate600,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
  },
  doneBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});
