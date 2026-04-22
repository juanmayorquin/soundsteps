import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { WORDS_LEVELS } from '../../constants/AudioContent';
import { useAudio } from '../../hooks/useAudio';
import { useProgress } from '../../hooks/useProgress';
import { generateWordTrials, computeNextLevel, type WordTrial, type WordCard } from '../../lib/trials';
import type { Level } from '../../constants/Modules';

type Phase = 'idle' | 'playing' | 'waitingAnswer' | 'feedback' | 'done';

const SESSION_TRIAL_COUNT = 10;

export default function WordsScreen() {
  const { progress, loading, isUnlocked, logTrial, updateLevel, recordSession } = useProgress();
  const { play, playFeedback, isPlaying } = useAudio();

  const currentLevel = progress.modules.words.currentLevel as Level;
  const [trials, setTrials] = useState<WordTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [levelChange, setLevelChange] = useState<'promoted' | 'demoted' | 'same'>('same');
  const [nextLevelResult, setNextLevelResult] = useState<Level>(currentLevel);

  const scoreRef = useRef(0);
  const startTime = useRef(Date.now());

  // Deep-link guard
  useEffect(() => {
    if (!loading && !isUnlocked('words')) {
      router.replace('/(tabs)/exercises');
    }
  }, [loading, isUnlocked]);

  // Generate trials on mount
  useEffect(() => {
    if (!loading) {
      const generated = generateWordTrials(currentLevel);
      setTrials(generated);
      scoreRef.current = 0;
      startTime.current = Date.now();
    }
  }, [loading]);

  const currentTrial = trials[trialIndex];

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;
    setPhase('playing');
    await play(currentTrial.targetFile);
    setHasPlayed(true);
    setPhase('waitingAnswer');
  }, [isPlaying, play, currentTrial]);


  const handleSelect = useCallback(async (cardId: string) => {
    if (phase !== 'waitingAnswer' || !hasPlayed || selectedId !== null) return;

    const correct = cardId === currentTrial.targetId;
    setSelectedId(cardId);
    setLastCorrect(correct);

    if (correct) {
      scoreRef.current += 1;
      setScore((s) => s + 1);
    }

    setPhase('feedback');
    playFeedback(correct ? 'correct' : 'incorrect');

    await logTrial('words', {
      stimulusId: currentTrial.targetId,
      level: currentLevel,
      noiseVolume: WORDS_LEVELS[currentLevel].noiseVolume,
      response: cardId,
      correct,
      timestamp: Date.now(),
    });

    setTimeout(async () => {
      const nextIndex = trialIndex + 1;
      if (nextIndex >= SESSION_TRIAL_COUNT) {
        const result = computeNextLevel(currentLevel, scoreRef.current);
        setLevelChange(result.changed);
        setNextLevelResult(result.nextLevel);
        await updateLevel('words', result.nextLevel);
        const minutes = Math.ceil((Date.now() - startTime.current) / 60000);
        await recordSession('words', scoreRef.current, SESSION_TRIAL_COUNT, minutes);
        setPhase('done');
      } else {
        setTrialIndex(nextIndex);
        setHasPlayed(false);
        setSelectedId(null);
        setLastCorrect(null);
        setPhase('idle');
      }
    }, 1300);
  }, [
    phase, hasPlayed, selectedId, currentTrial, currentLevel, trialIndex,
    logTrial, playFeedback, updateLevel, recordSession,
  ]);

  if (loading || trials.length === 0) {
    return <SafeAreaView style={styles.container} />;
  }

  if (phase === 'done') {
    const pct = Math.round((scoreRef.current / SESSION_TRIAL_COUNT) * 100);
    const levelCopy =
      levelChange === 'promoted' ? `¡Subiste a Nivel ${nextLevelResult}!` :
      levelChange === 'demoted'  ? `Ajustamos a Nivel ${nextLevelResult} para que practiques mejor.` :
      `Mantuviste Nivel ${nextLevelResult}.`;

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

  const canPlay = phase === 'idle' || phase === 'waitingAnswer';

  const getCardStyle = (card: WordCard) => {
    if (phase !== 'feedback') return styles.wordCard;
    if (card.id === currentTrial.targetId) return [styles.wordCard, styles.wordCardCorrect];
    if (card.id === selectedId) return [styles.wordCard, styles.wordCardIncorrect];
    return [styles.wordCard, styles.wordCardDimmed];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reconocimiento de palabras</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLeft}>Ejercicio {trialIndex + 1} de {SESSION_TRIAL_COUNT}</Text>
          <Text style={styles.progressRight}>{Math.round((trialIndex / SESSION_TRIAL_COUNT) * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(trialIndex / SESSION_TRIAL_COUNT) * 100}%` }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Level chip + play button */}
        <View style={styles.playSection}>
          <View style={styles.levelChip}>
            <Text style={styles.levelChipText}>Nivel {currentLevel}</Text>
          </View>
          <Text style={styles.playTitle}>Escuchá y seleccioná la palabra</Text>
          <TouchableOpacity
            style={[styles.playBtn, (isPlaying) && styles.playBtnActive]}
            onPress={handlePlay}
            disabled={!canPlay || isPlaying}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={isPlaying ? 'pause-circle-filled' : 'play-circle-fill'}
              size={32}
              color="#fff"
            />
            <Text style={styles.playBtnText}>
              {isPlaying
                ? 'Reproduciendo...'
                : hasPlayed
                  ? 'Reproducir de nuevo'
                  : 'Reproducir'}
            </Text>
          </TouchableOpacity>
        </View>

        {!hasPlayed && (
          <Text style={styles.hint}>Tocá Reproducir para escuchar la palabra.</Text>
        )}

        {/* Word Options Grid — 2 columns */}
        <View style={styles.grid}>
          {currentTrial.cards.map((card) => {
            const isTarget = card.id === currentTrial.targetId;
            const isSelected = card.id === selectedId;
            const showCheck = phase === 'feedback' && isTarget;

            return (
              <TouchableOpacity
                key={card.id}
                style={[getCardStyle(card), styles.gridCell]}
                onPress={() => handleSelect(card.id)}
                disabled={!hasPlayed || phase !== 'waitingAnswer'}
                activeOpacity={0.8}
              >
                {showCheck && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check" size={16} color="#fff" />
                  </View>
                )}
                <View style={[styles.wordIconWrap, { backgroundColor: card.color }]}>
                  <MaterialIcons name={card.icon as any} size={36} color={Colors.slate700} />
                </View>
                <Text style={styles.wordLabel}>{card.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLeft: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: Colors.slate700,
  },
  progressRight: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: Colors.primary,
  },
  progressTrack: {
    height: 12,
    backgroundColor: Colors.slate200,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  playSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  levelChip: {
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  levelChipText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
  playTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: Colors.slate900,
    textAlign: 'center',
    maxWidth: 260,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    width: '75%',
    maxWidth: 280,
    paddingVertical: 18,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playBtnActive: {
    backgroundColor: Colors.primaryDark,
  },
  playBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate500,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCell: {
    width: '47%',
  },
  wordCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  wordCardCorrect: {
    borderColor: Colors.green500,
    backgroundColor: '#f0fdf4',
  },
  wordCardIncorrect: {
    borderColor: Colors.red400,
    backgroundColor: '#fff5f5',
  },
  wordCardDimmed: {
    opacity: 0.5,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.green500,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  wordIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: Colors.slate900,
    textAlign: 'center',
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
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: Colors.slate700,
    textAlign: 'center',
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
