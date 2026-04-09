import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { DISCRIMINATION_PAIRS, NOISE_TRACKS } from '../../constants/AudioContent';
import { useProgress } from '../../hooks/useProgress';

type NoiseLevel = 'off' | 'low' | 'medium' | 'high';
type FeedbackState = 'idle' | 'correct' | 'incorrect';

const TOTAL = DISCRIMINATION_PAIRS.length;

export default function DiscriminationScreen() {
  const [current, setCurrent] = useState(0);
  const [playedA, setPlayedA] = useState(false);
  const [playedB, setPlayedB] = useState(false);
  const [playingId, setPlayingId] = useState<'A' | 'B' | null>(null);
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>('off');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const noiseRef = useRef<Audio.Sound | null>(null);
  const { recordSession } = useProgress();
  const startTime = useRef(Date.now());
  const correctCount = useRef(0);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return () => {
      soundRef.current?.unloadAsync();
      noiseRef.current?.unloadAsync();
    };
  }, []);

  const stopNoise = useCallback(async () => {
    if (noiseRef.current) {
      await noiseRef.current.stopAsync();
      await noiseRef.current.unloadAsync();
      noiseRef.current = null;
    }
  }, []);

  const startNoise = useCallback(async (level: NoiseLevel) => {
    if (level === 'off') return;
    await stopNoise();
    try {
      const file = NOISE_TRACKS[level];
      const { sound } = await Audio.Sound.createAsync(file, { isLooping: true, volume: level === 'low' ? 0.2 : level === 'medium' ? 0.5 : 0.85 });
      noiseRef.current = sound;
      await sound.playAsync();
    } catch { /* skip */ }
  }, [stopNoise]);

  const handleNoiseLevelChange = useCallback(async (level: NoiseLevel) => {
    setNoiseLevel(level);
    if (level === 'off') {
      await stopNoise();
    } else {
      await startNoise(level);
    }
  }, [stopNoise, startNoise]);

  const playTrack = useCallback(async (which: 'A' | 'B') => {
    if (playingId) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const file = which === 'A' ? DISCRIMINATION_PAIRS[current].soundA : DISCRIMINATION_PAIRS[current].soundB;
      const { sound } = await Audio.Sound.createAsync(file);
      soundRef.current = sound;
      setPlayingId(which);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          if (which === 'A') setPlayedA(true);
          else setPlayedB(true);
        }
      });
      await sound.playAsync();
    } catch {
      setPlayingId(null);
      if (which === 'A') setPlayedA(true);
      else setPlayedB(true);
    }
  }, [current, playingId]);

  const handleAnswer = useCallback((answer: 'same' | 'different') => {
    if (feedback !== 'idle') return;
    if (!playedA || !playedB) return;
    const pair = DISCRIMINATION_PAIRS[current];
    const isCorrect = (answer === 'same') === pair.isSame;
    if (isCorrect) {
      correctCount.current += 1;
      setScore((s) => s + 1);
    }
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(async () => {
      const next = current + 1;
      if (next >= TOTAL) {
        await stopNoise();
        const minutes = Math.ceil((Date.now() - startTime.current) / 60000);
        recordSession('discrimination', correctCount.current, TOTAL, minutes);
        setDone(true);
      } else {
        setCurrent(next);
        setPlayedA(false);
        setPlayedB(false);
        setFeedback('idle');
      }
    }, 1200);
  }, [current, feedback, playedA, playedB, stopNoise, recordSession]);

  if (done) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <MaterialIcons name="check-circle" size={64} color={Colors.green500} />
          <Text style={styles.doneTitle}>¡Sesión completada!</Text>
          <Text style={styles.doneSubtitle}>{score} de {TOTAL} correctos</Text>
          <View style={styles.doneScore}>
            <Text style={styles.doneScoreNumber}>{pct}%</Text>
            <Text style={styles.doneScoreLabel}>Precisión</Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canAnswer = playedA && playedB && feedback === 'idle';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discriminación de sonidos</Text>
        <TouchableOpacity style={styles.backBtn}>
          <MaterialIcons name="info-outline" size={22} color={Colors.slate400} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>PROGRESO</Text>
            <Text style={styles.progressCount}>Intento {current + 1} de {TOTAL}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((current) / TOTAL) * 100}%` }]} />
          </View>
        </View>

        {/* Instruction */}
        <View style={styles.instruction}>
          <Text style={styles.instructionTitle}>Escuchá atentamente</Text>
          <Text style={styles.instructionSub}>¿Estos dos sonidos son iguales?</Text>
        </View>

        {/* Playback Cards */}
        <View style={styles.playbackRow}>
          {(['A', 'B'] as const).map((which) => {
            const played = which === 'A' ? playedA : playedB;
            const isActive = playingId === which;
            return (
              <TouchableOpacity
                key={which}
                style={[styles.soundCard, isActive && styles.soundCardActive]}
                onPress={() => playTrack(which)}
                activeOpacity={0.8}
              >
                <View style={[styles.playCircle, isActive && styles.playCircleActive]}>
                  <MaterialIcons
                    name={isActive ? 'pause' : 'play-arrow'}
                    size={32}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.soundLabel}>Sonido {which}</Text>
                <Text style={styles.soundPhoneme}>
                  {which === 'A' ? DISCRIMINATION_PAIRS[current].labelA : DISCRIMINATION_PAIRS[current].labelB}
                </Text>
                {played && (
                  <View style={styles.playedDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {feedback !== 'idle' && (
          <View style={[styles.feedbackBanner, { backgroundColor: feedback === 'correct' ? '#dcfce7' : '#fee2e2' }]}>
            <MaterialIcons
              name={feedback === 'correct' ? 'check-circle' : 'cancel'}
              size={18}
              color={feedback === 'correct' ? Colors.green500 : Colors.red400}
            />
            <Text style={[styles.feedbackText, { color: feedback === 'correct' ? Colors.green500 : Colors.red400 }]}>
              {feedback === 'correct' ? '¡Correcto!' : 'No era — ¡siguiente ronda!'}
            </Text>
          </View>
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

        {/* Noise Control */}
        <View style={styles.noiseSection}>
          <View style={styles.noiseHeader}>
            <View style={styles.noiseHeaderLeft}>
              <MaterialIcons name="graphic-eq" size={18} color={Colors.primary} />
              <Text style={styles.noiseLabel}>Ruido de fondo</Text>
            </View>
            {noiseLevel !== 'off' && (
              <View style={styles.noiseBadge}>
                <Text style={styles.noiseBadgeText}>{{ off: 'Sin ruido', low: 'Bajo', medium: 'Medio', high: 'Alto' }[noiseLevel]}</Text>
              </View>
            )}
          </View>
          <View style={styles.noiseControls}>
            {(['off', 'low', 'medium', 'high'] as NoiseLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.noiseBtn, noiseLevel === level && styles.noiseBtnActive]}
                onPress={() => handleNoiseLevelChange(level)}
              >
                <Text style={[styles.noiseBtnText, noiseLevel === level && styles.noiseBtnTextActive]}>
                  {({ off: 'Sin ruido', low: 'Bajo', medium: 'Medio', high: 'Alto' } as Record<NoiseLevel, string>)[level]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
    marginBottom: 24,
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
  instruction: {
    marginBottom: 24,
    alignItems: 'center',
  },
  instructionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
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
    padding: 24,
    alignItems: 'center',
    gap: 12,
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
    fontSize: 15,
    color: Colors.slate700,
  },
  soundPhoneme: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: Colors.primary,
    letterSpacing: 1,
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
    marginBottom: 16,
  },
  feedbackText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
  },
  answerSection: {
    gap: 12,
    marginBottom: 20,
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
  noiseSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
    paddingTop: 16,
  },
  noiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noiseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noiseLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: Colors.slate600,
  },
  noiseBadge: {
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  noiseBadgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  noiseControls: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  noiseBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  noiseBtnActive: {
    backgroundColor: `${Colors.primary}18`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  noiseBtnText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: Colors.slate500,
  },
  noiseBtnTextActive: {
    fontFamily: 'Lexend_700Bold',
    color: Colors.primary,
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
