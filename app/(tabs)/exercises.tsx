import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { MODULES, type ModuleId } from '../../constants/Modules';
import { useProgress } from '../../hooks/useProgress';

const UNLOCK_HINTS: Record<ModuleId, string> = {
  detection: '',
  discrimination: 'Completa Detección al 80% para desbloquear',
  words: 'Completa Discriminación al 80% para desbloquear',
};

export default function ExercisesScreen() {
  const { getModuleAccuracy, isUnlocked, loading, reload } = useProgress();

  useFocusEffect(useCallback(() => {
    reload();
  }, []));

  if (loading) return <SafeAreaView style={styles.container} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ejercicios</Text>
          <Text style={styles.subtitle}>Elige un módulo para comenzar tu sesión</Text>
        </View>

        {MODULES.map((module) => {
          const acc = getModuleAccuracy(module.id);
          const unlocked = isUnlocked(module.id);

          return (
            <TouchableOpacity
              key={module.id}
              style={[styles.card, !unlocked && styles.cardLocked]}
              onPress={unlocked ? () => router.push(module.route as any) : undefined}
              activeOpacity={unlocked ? 0.8 : 1}
              disabled={!unlocked}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: module.iconBg }]}>
                  <MaterialIcons name={module.icon as any} size={32} color={module.iconColor} />
                </View>
                {unlocked ? (
                  <View style={[styles.tag, { borderColor: module.tagColor }]}>
                    <Text style={[styles.tagText, { color: module.tagColor }]}>{module.tagLabel}</Text>
                  </View>
                ) : (
                  <View style={styles.lockBadge}>
                    <MaterialIcons name="lock" size={18} color={Colors.slate400} />
                  </View>
                )}
              </View>

              <Text style={styles.moduleName}>{module.title}</Text>
              <Text style={styles.moduleDesc}>{module.description}</Text>

              {!unlocked && UNLOCK_HINTS[module.id] ? (
                <Text style={styles.lockedHint}>{UNLOCK_HINTS[module.id]}</Text>
              ) : null}

              {unlocked && (
                <View style={styles.cardBottom}>
                  <View style={styles.meta}>
                    <MaterialIcons name="format-list-numbered" size={14} color={Colors.slate400} />
                    <Text style={styles.metaText}>{module.roundCount} rondas</Text>
                  </View>
                  {acc > 0 && (
                    <View style={styles.meta}>
                      <MaterialIcons name="trending-up" size={14} color={Colors.green500} />
                      <Text style={[styles.metaText, { color: Colors.green500 }]}>{acc}% precisión</Text>
                    </View>
                  )}
                  <View style={styles.startBtn}>
                    <Text style={[styles.startText, { color: module.iconColor }]}>Iniciar</Text>
                    <MaterialIcons name="arrow-forward" size={14} color={module.iconColor} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: Colors.slate900,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate500,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surfaceLight,
    marginHorizontal: 24,
    marginVertical: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleName: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: Colors.slate900,
    marginBottom: 6,
  },
  moduleDesc: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate500,
    lineHeight: 20,
    marginBottom: 16,
  },
  lockedHint: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.slate400,
    marginTop: 8,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: Colors.slate400,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  startText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
  },
});
