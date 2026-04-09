import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { WORD_SETS } from '../../constants/AudioContent';
import { useProgress } from '../../hooks/useProgress';

type AnswerState = 'idle' | 'correct' | 'incorrect';

const TOTAL = WORD_SETS.length;

export default function WordsScreen() {
  const [current, setCurrent] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { recordSession } = useProgress();
  const startTime = useRef(Date.now());
  const correctCount = useRef(0);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playWord = useCallback(async () => {
    if (isPlaying) return;
    const set = WORD_SETS[current];
    const targetWord = set.words.find((w) => w.id === set.target);
    if (!targetWord) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(targetWord.file);
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setHasPlayed(true);
        }
      });
      await sound.playAsync();
    } catch {
      setIsPlaying(false);
      setHasPlayed(true);
    }
  }, [current, isPlaying]);

  const handleSelect = useCallback((wordId: string) => {
    if (!hasPlayed || answerState !== 'idle') return;
    const set = WORD_SETS[current];
    setSelected(wordId);
    const isCorrect = wordId === set.target;
    if (isCorrect) {
      correctCount.current += 1;
      setScore((s) => s + 1);
      setAnswerState('correct');
    } else {
      setAnswerState('incorrect');
    }
    setTimeout(() => {
      const next = current + 1;
      if (next >= TOTAL) {
        const minutes = Math.ceil((Date.now() - startTime.current) / 60000);
        recordSession('words', correctCount.current, TOTAL, minutes);
        setDone(true);
      } else {
        setCurrent(next);
        setSelected(null);
        setAnswerState('idle');
        setHasPlayed(false);
      }
    }, 1300);
  }, [current, hasPlayed, answerState, recordSession]);

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

  const set = WORD_SETS[current];

  const getCardStyle = (wordId: string) => {
    if (answerState === 'idle') return styles.wordCard;
    if (wordId === set.target) return [styles.wordCard, styles.wordCardCorrect];
    if (wordId === selected) return [styles.wordCard, styles.wordCardIncorrect];
    return [styles.wordCard, styles.wordCardDimmed];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identificación de palabras</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLeft}>Ejercicio {current + 1} de {TOTAL}</Text>
          <Text style={styles.progressRight}>{Math.round((current / TOTAL) * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(current / TOTAL) * 100}%` }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Instruction + Play Button */}
        <View style={styles.playSection}>
          <Text style={styles.playTitle}>Escuchá y seleccioná la imagen correcta</Text>
          <TouchableOpacity
            style={[styles.playBtn, isPlaying && styles.playBtnActive]}
            onPress={playWord}
            activeOpacity={0.85}
          >
            <View style={styles.playBtnInner} />
            <MaterialIcons
              name={isPlaying ? 'pause-circle-filled' : 'play-circle-fill'}
              size={32}
              color="#fff"
            />
            <Text style={styles.playBtnText}>{isPlaying ? 'Reproduciendo...' : hasPlayed ? 'Reproducir de nuevo' : 'Reproducir audio'}</Text>
          </TouchableOpacity>
        </View>

        {!hasPlayed && (
          <Text style={styles.hint}>Tocá Reproducir audio para escuchar la palabra y seleccioná la imagen correcta.</Text>
        )}

        {/* Word Options Grid */}
        <View style={styles.grid}>
          {set.words.map((word) => {
            const isSelected = selected === word.id;
            const isTarget = word.id === set.target;
            const showCheck = answerState !== 'idle' && isTarget;
            return (
              <TouchableOpacity
                key={word.id}
                style={getCardStyle(word.id)}
                onPress={() => handleSelect(word.id)}
                disabled={!hasPlayed || answerState !== 'idle'}
                activeOpacity={0.8}
              >
                {showCheck && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check" size={16} color="#fff" />
                  </View>
                )}
                <View style={[styles.wordIconWrap, { backgroundColor: word.color }]}>
                  <MaterialIcons name={word.icon as any} size={40} color={Colors.slate700} />
                </View>
                <View style={styles.wordInfo}>
                  <Text style={styles.wordLabel}>{word.label}</Text>
                  <Text style={styles.wordCategory}>{word.category}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => {
            const next = current + 1;
            if (next >= TOTAL) {
              recordSession('words', correctCount.current, TOTAL, 1);
              setDone(true);
            } else {
              setCurrent(next);
              setSelected(null);
              setAnswerState('idle');
              setHasPlayed(false);
            }
          }}
        >
          <Text style={styles.skipText}>Saltar ejercicio</Text>
        </TouchableOpacity>
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
    gap: 20,
    paddingVertical: 24,
  },
  playTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
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
  playBtnInner: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    opacity: 0,
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
    gap: 12,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 12,
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
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  wordInfo: {
    flex: 1,
  },
  wordLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: Colors.slate900,
  },
  wordCategory: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate500,
    marginTop: 2,
  },
  skipBtn: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.slate100,
    borderRadius: 12,
  },
  skipText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: Colors.slate500,
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
