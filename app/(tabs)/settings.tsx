import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useProgress } from '../../hooks/useProgress';

export default function SettingsScreen() {
  const { progress } = useProgress();
  const [dailyGoal, setDailyGoal] = useState('30');
  const [notifications, setNotifications] = useState(true);

  const handleReset = () => {
    Alert.alert(
      'Resetear progreso',
      '¿Esto eliminará todo tu historial de entrenamiento. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@soundsteps_progress');
            Alert.alert('Listo', 'El progreso fue reseteado.');
          },
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Entrenamiento',
      items: [
        {
          id: 'goal',
          label: 'Meta diaria',
          icon: 'timer',
          iconBg: '#dbeafe',
          iconColor: Colors.primary,
          right: (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.goalInput}
                value={dailyGoal}
                onChangeText={setDailyGoal}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.goalUnit}>min</Text>
            </View>
          ),
        },
        {
          id: 'notifications',
          label: 'Recordatorios diarios',
          icon: 'notifications',
          iconBg: '#fef3c7',
          iconColor: Colors.amber500,
          right: (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.slate200, true: `${Colors.primary}60` }}
              thumbColor={notifications ? Colors.primary : Colors.slate400}
            />
          ),
        },
      ],
    },
    {
      title: 'Acerca de',
      items: [
        {
          id: 'version',
          label: 'Versión',
          icon: 'info',
          iconBg: '#ede9fe',
          iconColor: Colors.purple500,
          right: <Text style={styles.versionText}>1.0.0</Text>,
        },
        {
          id: 'reset',
          label: 'Resetear todo el progreso',
          icon: 'refresh',
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          right: null,
          onPress: handleReset,
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{progress.userName.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{progress.userName}</Text>
          <Text style={styles.userSubtitle}>Rehabilitación auditiva</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.currentStreak}</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.achievements.length}</Text>
              <Text style={styles.statLabel}>Logros</Text>
            </View>
          </View>
        </View>

        {settingsGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingRow,
                    idx < group.items.length - 1 && styles.settingRowBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                >
                  <View style={[styles.settingIcon, { backgroundColor: item.iconBg }]}>
                    <MaterialIcons name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <Text style={[styles.settingLabel, (item as any).danger && styles.dangerText]}>
                    {item.label}
                  </Text>
                  <View style={styles.settingRight}>{item.right}</View>
                  {item.onPress && !item.right && (
                    <MaterialIcons name="chevron-right" size={18} color={Colors.slate400} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          SoundSteps — Auditory Rehabilitation App{'\n'}
          Los archivos de audio se guardan localmente para uso sin conexión.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 32,
    color: '#fff',
  },
  userName: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: Colors.slate900,
  },
  userSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate500,
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: Colors.slate900,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.slate500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.slate200,
  },
  group: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  groupTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: Colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.slate100,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontFamily: 'Lexend_500Medium',
    fontSize: 15,
    color: Colors.slate900,
  },
  dangerText: {
    color: '#dc2626',
  },
  settingRight: {
    alignItems: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalInput: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: Colors.primary,
    textAlign: 'right',
    width: 36,
    padding: 0,
  },
  goalUnit: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate400,
  },
  versionText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.slate400,
  },
  footer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.slate400,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    lineHeight: 18,
  },
});
