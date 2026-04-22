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
import { DETECTION_LEVELS } from '../../constants/AudioContent';
import { useAudio } from '../../hooks/useAudio';
import { useProgress } from '../../hooks/useProgress';
import { generateDetectionTrials, computeNextLevel, type DetectionTrial } from '../../lib/trials';
import type { Level } from '../../constants/Modules';

type Phase = 'idle' | 'playing' | 'waitingAnswer' | 'feedback' | 'done';

const SESSION_TRIAL_COUNT = 10;

export default function DetectionScreen() {
  const { progress, loading, logTrial, updateLevel, recordSession } = useProgress();
  const { play, playFeedback, stop, isPlaying } = useAudio();

  const currentLevel = progress.modules.detection.currentLevel as Level;
  const [trials, setTrials] = useState<DetectionTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [levelChange, setLevelChange] = useState<'promoted' | 'demoted' | 'same'>('same');
  const [nextLevel, setNextLevel] = useState<Level>(currentLevel);

  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const phaseRef = useRef<Phase>('idle');

  const setPhaseTracked = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // Generate trials on mount (after loading completes)
  useEffect(() => {
    if (!loading) {
      const generated = generateDetectionTrials(currentLevel);
      setTrials(generated);
      scoreRef.current = 0;
      startTime.current = Date.now();
    }
  }, [loading]);

  const currentTrial = trials[trialIndex];

  const animateFeedback = useCallback(() => {
    feedbackAnim.setValue(0);
    Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [feedbackAnim]);

  const handlePlay = useCallback(async () => {
    if (phaseRef.current === 'playing' || isPlaying) return;
    setPhaseTracked('playing');
    await play(currentTrial.file);
    if ((phaseRef.current as Phase) === 'playing') {
      setPhaseTracked('waitingAnswer');
    } else {
      // handleResponse won the race — stop the audio that just started
      stop();
    }
  }, [isPlaying, play, currentTrial, setPhaseTracked, stop]);

  const handleResponse = useCallback(async (response: 'heard' | 'not-heard') => {
    if (phaseRef.current !== 'waitingAnswer') return;

    const correct =
      (response === 'heard' && !currentTrial.isSilence) ||
      (response === 'not-heard' && currentTrial.isSilence);

    if (correct) {
      scoreRef.current += 1;
      setScore((s) => s + 1);
    }
    setLastCorrect(correct);

    // Lock the UI immediately via ref — blocks handlePlay continuation even before re-render
    setPhaseTracked('feedback');
    animateFeedback();
    playFeedback(correct ? 'correct' : 'incorrect');

    // Log trial
    await logTrial('detection', {
      stimulusId: currentTrial.stimulusId,
      level: currentLevel,
      noiseVolume: DETECTION_LEVELS[currentLevel].noiseVolume,
      response,
      correct,
      timestamp: Date.now(),
    });

    setTimeout(async () => {
      const nextIndex = trialIndex + 1;
      if (nextIndex >= SESSION_TRIAL_COUNT) {
        // Session done
        const result = computeNextLevel(currentLevel, scoreRef.current);
        setLevelChange(result.changed);
        setNextLevel(result.nextLevel);
        await updateLevel('detection', result.nextLevel);
        const minutes = Math.ceil((Date.now() - startTime.current) / 60000);
        await recordSession('detection', scoreRef.current, SESSION_TRIAL_COUNT, minutes);
        setPhaseTracked('done');
      } else {
        setTrialIndex(nextIndex);
        setPhaseTracked('idle');
        setLastCorrect(null);
      }
    }, 1200);
  }, [
    currentTrial, currentLevel, trialIndex,
    logTrial, playFeedback, updateLevel, recordSession, animateFeedback, setPhaseTracked,
  ]);

  if (loading || trials.length === 0) {
    return <SafeAreaView style={styles.container} />;
  }

  if (phase === 'done') {
    const pct = Math.round((scoreRef.current / SESSION_TRIAL_COUNT) * 100);
    const levelCopy =
      levelChange === 'promoted' ? `¡Subiste a Nivel ${nextLevel}!` :
      levelChange === 'demoted'  ? `Ajustamos a Nivel ${nextLevel} para que practiques mejor.` :
      `Mantuviste Nivel ${nextLevel}.`;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <MaterialIcons name="check-circle" size={64} color={Colors.green500} />
          </View>
          <Text style={styles.doneTitle}>¡Sesión completada!</Text>
          <Text style={styles.doneSubtitle}>Acertaste {scoreRef.current} de {SESSION_TRIAL_COUNT}</Text>
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

  const canAnswer = phase === 'waitingAnswer' && !isPlaying;
  const canPlay = phase === 'idle' || phase === 'waitingAnswer';
  const hasPlayed = phase === 'waitingAnswer' || phase === 'feedback';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detección de sonidos</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {Array.from({ length: SESSION_TRIAL_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i < trialIndex
                ? styles.progressDone
                : i === trialIndex
                  ? styles.progressActive
                  : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      {/* Main content */}
      <View style={styles.main}>
        <Text style={styles.mainTitle}>Escuchá con atención</Text>

        {/* Level chip */}
        <View style={styles.levelChip}>
          <Text style={styles.levelChipText}>Nivel {currentLevel}</Text>
        </View>

        {/* Sound card */}
        <View style={styles.speakerCard}>
          <View style={styles.speakerBg} />
          <View style={styles.speakerBgBlob1} />
          <View style={styles.speakerBgBlob2} />
          <View style={styles.speakerIconWrap}>
            <MaterialIcons
              name={phase === 'playing' ? 'volume-up' : 'hearing'}
              size={64}
              color={Colors.primary}
            />
          </View>
          <TouchableOpacity
            style={[styles.playBtn, (!canPlay || isPlaying) && styles.playBtnDisabled]}
            onPress={handlePlay}
            disabled={!canPlay || isPlaying}
            activeOpacity={0.85}
          >
            <MaterialIcons name="play-arrow" size={20} color="#fff" />
            <Text style={styles.playBtnText}>
              {hasPlayed ? 'Reproducir de nuevo' : 'Reproducir sonido'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feedback banner */}
        {phase === 'feedback' ? (
          <Animated.View
            style={[
              styles.feedbackBanner,
              {
                opacity: feedbackAnim,
                backgroundColor: lastCorrect ? '#dcfce7' : '#fee2e2',
              },
            ]}
          >
            <MaterialIcons
              name={lastCorrect ? 'check-circle' : 'cancel'}
              size={20}
              color={lastCorrect ? Colors.green500 : Colors.red400}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: lastCorrect ? Colors.green500 : Colors.red400 },
              ]}
            >
              {lastCorrect ? '¡Muy bien!' : 'Vamos con el siguiente.'}
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.hint}>
            {canAnswer
              ? '¿Lo escuchaste?'
              : 'Tocá el botón para escuchar el sonido'}
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.actionBtnPrimary,
            !canAnswer && styles.actionBtnDisabled,
          ]}
          onPress={() => handleResponse('heard')}
          disabled={!canAnswer}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <MaterialIcons name="check" size={22} color="#fff" />
          </View>
          <Text style={styles.actionBtnPrimaryText}>Lo escuché</Text>
          <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.actionBtnSecondary,
            !canAnswer && styles.actionBtnDisabled,
          ]}
          onPress={() => handleResponse('not-heard')}
          disabled={!canAnswer}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.slate200 }]}>
            <MaterialIcons name="close" size={22} color={Colors.slate500} />
          </View>
          <Text style={styles.actionBtnSecondaryText}>No lo escuché</Text>
        </TouchableOpacity>
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
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: Colors.slate900,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 6,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressDone: { backgroundColor: Colors.primary },
  progressActive: { backgroundColor: Colors.primary },
  progressInactive: { backgroundColor: Colors.slate200 },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  mainTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 26,
    color: Colors.slate900,
    marginBottom: 8,
  },
  levelChip: {
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  levelChipText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
  speakerCard: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    padding: 24,
  },
  speakerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 28,
  },
  speakerBgBlob1: {
    position: 'absolute',
    top: -30, right: -30,
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}20`,
  },
  speakerBgBlob2: {
    position: 'absolute',
    bottom: -30, left: -30,
    width: 120, height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}10`,
  },
  speakerIconWrap: {
    backgroundColor: `${Colors.primary}18`,
    padding: 20,
    borderRadius: 50,
    marginBottom: 28,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playBtnDisabled: {
    opacity: 0.5,
  },
  playBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  feedbackText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
  },
  hint: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: Colors.slate500,
    marginTop: 20,
  },
  actions: {
    backgroundColor: Colors.surfaceLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.slate100,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    flex: 1,
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.3,
  },
  actionBtnSecondaryText: {
    flex: 1,
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: Colors.slate600,
    letterSpacing: 0.3,
  },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  doneIcon: {
    marginBottom: 20,
  },
  doneTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: Colors.slate900,
    marginBottom: 8,
  },
  doneSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: Colors.slate500,
    marginBottom: 32,
  },
  doneScore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: Colors.slate700,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
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
