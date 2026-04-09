import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useProgress } from '../../hooks/useProgress';

const MODULES = [
  {
    id: 'detection',
    title: 'Detección de sonidos',
    description: 'Identificá señales auditivas básicas',
    icon: 'notifications' as const,
    iconBg: '#dbeafe',
    iconColor: Colors.primary,
    route: '/exercises/detection',
  },
  {
    id: 'discrimination',
    title: 'Discriminación de sonidos',
    description: 'Diferenciá entre distintos sonidos',
    icon: 'graphic-eq' as const,
    iconBg: '#ccfbf1',
    iconColor: '#0d9488',
    route: '/exercises/discrimination',
  },
  {
    id: 'words',
    title: 'Reconocimiento de palabras',
    description: 'Practicá la comprensión del habla',
    icon: 'record-voice-over' as const,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    route: '/exercises/words',
  },
];

export default function HomeScreen() {
  const { progress, getWeeklyAccuracy, getTodayMinutes, getModuleAccuracy } = useProgress();

  const weeklyAccuracy = getWeeklyAccuracy();
  const todayMinutes = getTodayMinutes();
  const dailyGoal = 30;
  const progressPct = Math.min((todayMinutes / dailyGoal) * 100, 100);

  const weekBars = progress.weeklyData.length > 0
    ? progress.weeklyData.map((d) => d.accuracy)
    : [20, 35, 45, 50, 60, 70, 80];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {progress.userName}</Text>
            <Text style={styles.subtitle}>Continuemos tu camino auditivo.</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {progress.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Daily Goal Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Meta diaria</Text>
            <Text style={styles.primaryText}>{todayMinutes} / {dailyGoal} min</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.minutesRow}>
            <MaterialIcons name="timer" size={18} color={Colors.primary} />
            <Text style={styles.minutesText}>{todayMinutes} min entrenados hoy</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Circular Progress */}
          <View style={[styles.statCard, styles.statCardFlex]}>
            <Text style={styles.statLabel}>PRECISIÓN SEMANAL</Text>
            <View style={styles.accuracyCircle}>
              <Text style={styles.accuracyNumber}>{weeklyAccuracy}%</Text>
            </View>
            <View style={styles.trendRow}>
              <MaterialIcons name="arrow-upward" size={12} color={Colors.green500} />
              <Text style={styles.trendText}>¡Buen progreso!</Text>
            </View>
          </View>

          {/* Improvement Bars */}
          <View style={[styles.statCard, styles.statCardFlex]}>
            <Text style={styles.statLabel}>MEJORA</Text>
            <View style={styles.barsContainer}>
              {weekBars.slice(-7).map((val, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    { height: `${Math.max(val, 10)}%`, opacity: 0.3 + (i / 6) * 0.7 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.lastWeekText}>Últimos 7 días</Text>
          </View>
        </View>

        {/* Start Session Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/exercises/detection')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="play-circle-fill" size={24} color="#fff" />
            <Text style={styles.ctaText}>Comenzar sesión de hoy</Text>
          </TouchableOpacity>
        </View>

        {/* Training Modules */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Módulos de entrenamiento</Text>
          {MODULES.map((module) => {
            const acc = getModuleAccuracy(module.id as any);
            return (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => router.push(module.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.moduleIcon, { backgroundColor: module.iconBg }]}>
                  <MaterialIcons name={module.icon} size={24} color={module.iconColor} />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{module.title}</Text>
                  <Text style={styles.moduleDesc}>{module.description}</Text>
                </View>
                <View style={styles.moduleArrow}>
                  {acc > 0 && (
                    <Text style={styles.moduleAcc}>{acc}%</Text>
                  )}
                  <MaterialIcons name="chevron-right" size={18} color={Colors.slate400} />
                </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
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
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  card: {
    backgroundColor: Colors.surfaceLight,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: Colors.slate500,
  },
  primaryText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
  progressTrack: {
    height: 12,
    backgroundColor: Colors.slate100,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  minutesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  minutesText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate600,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  statCardFlex: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 9,
    color: Colors.slate400,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  accuracyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  accuracyNumber: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: Colors.slate900,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
  },
  trendText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 10,
    color: Colors.green500,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  bar: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  lastWeekText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: Colors.slate400,
    marginTop: 4,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  modulesSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: Colors.slate900,
    marginBottom: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 14,
  },
  moduleName: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: Colors.slate900,
  },
  moduleDesc: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.slate500,
    marginTop: 2,
  },
  moduleArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleAcc: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
});
