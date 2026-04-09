import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
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
import { DETECTION_SOUNDS } from '../../constants/AudioContent';
import { useProgress } from '../../hooks/useProgress';

type FeedbackState = 'idle' | 'correct' | 'incorrect';

const TOTAL = DETECTION_SOUNDS.length;

export default function DetectionScreen() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const waveAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const { recordSession } = useProgress();
  const startTime = useRef(Date.now());
  const correctCount = useRef(0);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const animateWave = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [waveAnim]);

  const stopWave = useCallback(() => {
    waveAnim.stopAnimation();
    waveAnim.setValue(0);
  }, [waveAnim]);

  const playSound = useCallback(async () => {
    if (isPlaying) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(DETECTION_SOUNDS[current].file);
      soundRef.current = sound;
      setIsPlaying(true);
      animateWave();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setHasPlayed(true);
          stopWave();
        }
      });
      await sound.playAsync();
    } catch (e) {
      setIsPlaying(false);
      setHasPlayed(true);
      stopWave();
    }
  }, [current, isPlaying, animateWave, stopWave]);

  const showFeedback = useCallback((state: FeedbackState) => {
    setFeedback(state);
    feedbackAnim.setValue(0);
    Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => {
      const next = current + 1;
      if (next >= TOTAL) {
        const minutes = Math.ceil((Date.now() - startTime.current) / 60000);
        recordSession('detection', correctCount.current, TOTAL, minutes);
        setDone(true);
      } else {
        setCurrent(next);
        setFeedback('idle');
        setHasPlayed(false);
      }
    }, 1200);
  }, [current, recordSession]);

  const handleHeard = useCallback(() => {
    if (feedback !== 'idle') return;
    correctCount.current += 1;
    setScore((s) => s + 1);
    showFeedback('correct');
  }, [feedback, showFeedback]);

  const handleNotHeard = useCallback(() => {
    if (feedback !== 'idle') return;
    showFeedback('incorrect');
  }, [feedback, showFeedback]);

  if (done) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <MaterialIcons name="check-circle" size={64} color={Colors.green500} />
          </View>
          <Text style={styles.doneTitle}>¡Sesión completada!</Text>
          <Text style={styles.doneSubtitle}>Acertaste {score} de {TOTAL}</Text>
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

  const sound = DETECTION_SOUNDS[current];
  const feedbackColor = feedback === 'correct' ? Colors.green500 : feedback === 'incorrect' ? Colors.red400 : Colors.primary;

  const waveScale = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

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

      {/* Progress */}
      <View style={styles.progressContainer}>
        {DETECTION_SOUNDS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i < current ? styles.progressDone : i === current ? styles.progressActive : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      {/* Main */}
      <View style={styles.main}>
        <Text style={styles.mainTitle}>Escuchá con atención</Text>

        <Animated.View style={[styles.speakerCard, { transform: [{ scale: waveScale }] }]}>
          <View style={styles.speakerBg} />
          <View style={styles.speakerBgBlob1} />
          <View style={styles.speakerBgBlob2} />
          <View style={styles.speakerIconWrap}>
            <MaterialIcons name="volume-up" size={64} color={Colors.primary} />
          </View>
          <View style={styles.waveform}>
            {[4, 8, 5, 10, 6, 12, 8, 4, 7, 3].map((h, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  { height: h * 2 },
                  isPlaying && { opacity: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.playBtn} onPress={playSound} activeOpacity={0.85}>
            <MaterialIcons name="play-arrow" size={20} color="#fff" />
            <Text style={styles.playBtnText}>{hasPlayed ? 'Reproducir de nuevo' : 'Reproducir sonido'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {feedback !== 'idle' ? (
          <Animated.View style={[styles.feedbackBanner, { opacity: feedbackAnim, backgroundColor: feedback === 'correct' ? '#dcfce7' : '#fee2e2' }]}>
            <MaterialIcons
              name={feedback === 'correct' ? 'check-circle' : 'cancel'}
              size={20}
              color={feedback === 'correct' ? Colors.green500 : Colors.red400}
            />
            <Text style={[styles.feedbackText, { color: feedback === 'correct' ? Colors.green500 : Colors.red400 }]}>
              {feedback === 'correct' ? '¡Muy bien!' : 'Vamos con el siguiente.'}
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.hint}>{hasPlayed ? '¿Lo escuchaste?' : 'Tocá el botón para escuchar el sonido'}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary, !hasPlayed && styles.actionBtnDisabled]}
          onPress={handleHeard}
          disabled={!hasPlayed || feedback !== 'idle'}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <MaterialIcons name="check" size={22} color="#fff" />
          </View>
          <Text style={styles.actionBtnPrimaryText}>Lo escuché</Text>
          <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary, !hasPlayed && styles.actionBtnDisabled]}
          onPress={handleNotHeard}
          disabled={!hasPlayed || feedback !== 'idle'}
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
    paddingTop: 16,
  },
  mainTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 30,
    color: Colors.slate900,
    marginBottom: 24,
  },
  speakerCard: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 320,
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
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}20`,
  },
  speakerBgBlob2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}10`,
  },
  speakerIconWrap: {
    backgroundColor: `${Colors.primary}18`,
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  waveBar: {
    width: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    opacity: 0.4,
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
    marginBottom: 32,
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
