import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useProgress } from '../../hooks/useProgress';

const ACHIEVEMENTS = [
  {
    id: 'first_session',
    title: 'Primeros pasos',
    icon: 'emoji-events',
    bg: ['#fef9c3', '#fde68a'],
    iconColor: '#d97706',
  },
  {
    id: 'first_week',
    title: 'Primera semana',
    icon: 'local-fire-department',
    bg: ['#fee2e2', '#fca5a5'],
    iconColor: '#dc2626',
  },
  {
    id: 'accuracy_80',
    title: '80% de precisión',
    icon: 'track-changes',
    bg: ['#dbeafe', '#93c5fd'],
    iconColor: Colors.primary,
  },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProgressScreen() {
  const { progress, getWeeklyAccuracy, getModuleAccuracy } = useProgress();

  const weeklyAccuracy = getWeeklyAccuracy();
  const detectionAcc = getModuleAccuracy('detection');
  const discriminationAcc = getModuleAccuracy('discrimination');
  const wordsAcc = getModuleAccuracy('words');

  const weekData = progress.weeklyData.length >= 7
    ? progress.weeklyData.slice(-7)
    : [
        { date: '', accuracy: 55, minutesTrained: 0 },
        { date: '', accuracy: 62, minutesTrained: 0 },
        { date: '', accuracy: 58, minutesTrained: 0 },
        { date: '', accuracy: 70, minutesTrained: 0 },
        { date: '', accuracy: 72, minutesTrained: 0 },
        { date: '', accuracy: 80, minutesTrained: 0 },
        { date: '', accuracy: weeklyAccuracy || 85, minutesTrained: 0 },
      ];

  const maxAcc = Math.max(...weekData.map((d) => d.accuracy), 1);

  const modules = [
    { label: 'Detección', acc: detectionAcc, color: Colors.secondary },
    { label: 'Discriminación', acc: discriminationAcc, color: Colors.primary },
    { label: 'Palabras', acc: wordsAcc, color: Colors.purple500 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu progreso</Text>
        </View>

        {/* Top stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ffedd5' }]}>
              <MaterialIcons name="local-fire-department" size={22} color={Colors.orange500} />
            </View>
            <Text style={styles.statValue}>{progress.currentStreak}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <MaterialIcons name="timer" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{progress.totalMinutes}m</Text>
            <Text style={styles.statLabel}>Total entrenado</Text>
          </View>
        </View>

        {/* Weekly Accuracy Graph */}
        <View style={styles.card}>
          <View style={styles.graphHeader}>
            <View>
              <Text style={styles.cardTitle}>Precisión semanal</Text>
              <Text style={styles.cardSubtitle}>Rendimiento últimos 7 días</Text>
            </View>
            <View style={styles.bigAccuracy}>
              <Text style={styles.bigAccuracyNumber}>{weeklyAccuracy || 85}%</Text>
              <View style={styles.trendRow}>
                <MaterialIcons name="trending-up" size={13} color={Colors.green500} />
                <Text style={styles.trendText}>mejorando</Text>
              </View>
            </View>
          </View>

          {/* Bar chart */}
          <View style={styles.barChart}>
            {weekData.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max((d.accuracy / maxAcc) * 100, 5)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Module Mastery */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Maestría por módulo</Text>
          <View style={styles.moduleBars}>
            {modules.map((m) => (
              <View key={m.label} style={styles.moduleRow}>
                <View style={styles.moduleRowHeader}>
                  <View style={styles.moduleRowLeft}>
                    <View style={[styles.dot, { backgroundColor: m.color }]} />
                    <Text style={styles.moduleLabel}>{m.label}</Text>
                  </View>
                  <Text style={styles.modulePercent}>{m.acc || '—'}%</Text>
                </View>
                <View style={styles.moduleTrack}>
                  <View style={[styles.moduleFill, { width: `${m.acc}%`, backgroundColor: m.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Logros</Text>
          <View style={styles.badgesGrid}>
            {ACHIEVEMENTS.map((ach) => {
              const earned = progress.achievements.includes(ach.id);
              return (
                <View key={ach.id} style={[styles.badge, !earned && styles.badgeLocked]}>
                  <View style={[
                    styles.badgeCircle,
                    { backgroundColor: earned ? ach.bg[0] : Colors.slate100 },
                    earned && styles.badgeCircleEarned,
                  ]}>
                    {earned ? (
                      <MaterialIcons name={ach.icon as any} size={28} color={ach.iconColor} />
                    ) : (
                      <MaterialIcons name="lock" size={24} color={Colors.slate400} />
                    )}
                  </View>
                  <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}>
                    {ach.title}
                  </Text>
                </View>
              );
            })}
          </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: Colors.slate900,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.slate500,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surfaceLight,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: Colors.slate900,
  },
  cardSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.slate500,
    marginTop: 2,
  },
  bigAccuracy: {
    alignItems: 'flex-end',
  },
  bigAccuracyNumber: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: Colors.primary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: Colors.green500,
  },
  barChart: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    height: 120,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.slate100,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
    opacity: 0.85,
  },
  dayLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 9,
    color: Colors.slate400,
    marginTop: 4,
  },
  moduleBars: {
    marginTop: 16,
    gap: 14,
  },
  moduleRow: {
    gap: 6,
  },
  moduleRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moduleLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: Colors.slate700,
  },
  modulePercent: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: Colors.slate900,
  },
  moduleTrack: {
    height: 10,
    backgroundColor: Colors.slate100,
    borderRadius: 5,
    overflow: 'hidden',
  },
  moduleFill: {
    height: '100%',
    borderRadius: 5,
  },
  achievementsSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: Colors.slate900,
    marginBottom: 14,
  },
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badge: {
    alignItems: 'center',
    gap: 8,
    width: 90,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeCircleEarned: {
    borderColor: '#fbbf24',
  },
  badgeLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: Colors.slate700,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: Colors.slate400,
  },
});
