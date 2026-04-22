import { Audio, AVPlaybackSource } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FEEDBACK_AUDIO } from '../constants/AudioContent';

export interface UseAudioReturn {
  play: (source: AVPlaybackSource) => Promise<void>;
  playFeedback: (type: 'correct' | 'incorrect') => Promise<void>;
  playNoise: (source: AVPlaybackSource, volume: number) => Promise<void>;
  stopNoise: () => Promise<void>;
  stop: () => Promise<void>;
  isPlaying: boolean;
}

export function useAudio(): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null);
  const noiseRef = useRef<Audio.Sound | null>(null);
  const feedbackRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      noiseRef.current?.unloadAsync().catch(() => {});
      feedbackRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      noiseRef.current = null;
      feedbackRef.current = null;
    };
  }, []);

  const play = useCallback(async (source: AVPlaybackSource): Promise<void> => {
    try {
      if (soundRef.current) {
        try { await soundRef.current.stopAsync(); } catch {}
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(source);
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const playFeedback = useCallback(async (type: 'correct' | 'incorrect'): Promise<void> => {
    try {
      if (feedbackRef.current) {
        try { await feedbackRef.current.stopAsync(); } catch {}
        try { await feedbackRef.current.unloadAsync(); } catch {}
        feedbackRef.current = null;
      }
      const file = type === 'correct' ? FEEDBACK_AUDIO.correct : FEEDBACK_AUDIO.incorrect;
      const { sound } = await Audio.Sound.createAsync(file);
      feedbackRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          feedbackRef.current = null;
        }
      });
      await sound.playAsync();
    } catch {}
  }, []);

  const playNoise = useCallback(async (source: AVPlaybackSource, volume: number): Promise<void> => {
    try {
      if (noiseRef.current) {
        try { await noiseRef.current.stopAsync(); } catch {}
        try { await noiseRef.current.unloadAsync(); } catch {}
        noiseRef.current = null;
      }
      if (volume <= 0) return;
      const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, volume });
      noiseRef.current = sound;
      await sound.playAsync();
    } catch {
      // swallow
    }
  }, []);

  const stopNoise = useCallback(async (): Promise<void> => {
    if (noiseRef.current) {
      try { await noiseRef.current.stopAsync(); } catch {}
      try { await noiseRef.current.unloadAsync(); } catch {}
      noiseRef.current = null;
    }
  }, []);

  const stop = useCallback(async (): Promise<void> => {
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); } catch {}
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return { play, playFeedback, playNoise, stopNoise, stop, isPlaying };
}
