import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useProgress } from '../../hooks/useProgress';

const MODULES = [
  {
    id: 'detection' as const,
    title: 'Detección de sonidos',
    description: 'Identificá si podés escuchar un sonido. Ejercicios sí/no para entrenar tu percepción auditiva.',
    icon: 'notifications' as const,
    iconBg: '#dbeafe',
    iconColor: Colors.primary,
    tag: 'Principiante',
    tagColor: Colors.primary,
    route: '/exercises/detection',
    rounds: 10,
  },
  {
    id: 'discrimination' as const,
    title: 'Discriminación de sonidos',
    description: 'Compará dos sonidos y decidí si son iguales o diferentes.',
    icon: 'graphic-eq' as const,
    iconBg: '#ccfbf1',
    iconColor: '#0d9488',
    tag: 'Intermedio',
    tagColor: '#0d9488',
    route: '/exercises/discrimination',
    rounds: 15,
  },
  {
    id: 'words' as const,
    title: 'Reconocimiento de palabras',
    description: 'Escuchá una palabra y seleccioná la imagen correcta entre tres opciones.',
    icon: 'record-voice-over' as const,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    tag: 'Avanzado',
    tagColor: '#7c3aed',
    route: '/exercises/words',
    rounds: 10,
  },
];

export default function ExercisesScreen() {
  const { getModuleAccuracy } = useProgress();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ejercicios</Text>
          <Text style={styles.subtitle}>Elegí un módulo para comenzar tu sesión</Text>
        </View>

        {MODULES.map((module) => {
          const acc = getModuleAccuracy(module.id);
          return (
            <TouchableOpacity
              key={module.id}
              style={styles.card}
              onPress={() => router.push(module.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: module.iconBg }]}>
                  <MaterialIcons name={module.icon} size={32} color={module.iconColor} />
                </View>
                <View style={[styles.tag, { borderColor: module.tagColor }]}>
                  <Text style={[styles.tagText, { color: module.tagColor }]}>{module.tag}</Text>
                </View>
              </View>

              <Text style={styles.moduleName}>{module.title}</Text>
              <Text style={styles.moduleDesc}>{module.description}</Text>

              <View style={styles.cardBottom}>
                <View style={styles.meta}>
                  <MaterialIcons name="format-list-numbered" size={14} color={Colors.slate400} />
                  <Text style={styles.metaText}>{module.rounds} rondas</Text>
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
