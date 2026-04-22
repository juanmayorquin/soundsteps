import { Colors } from './Colors';

export type ModuleId = 'detection' | 'discrimination' | 'words';
export type Level = 1 | 2 | 3;

export type ModuleConfig = {
  id: ModuleId;
  route: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  tagLabel: string;
  tagColor: string;
  roundCount: number;
  prerequisite: ModuleId | null;
};

export const MODULES: ModuleConfig[] = [
  {
    id: 'detection',
    route: '/exercises/detection',
    title: 'Detección de sonidos',
    description: 'Identificá si podés escuchar un sonido. Ejercicios sí/no para entrenar tu percepción auditiva.',
    icon: 'notifications',
    iconBg: '#dbeafe',
    iconColor: Colors.primary,
    tagLabel: 'Principiante',
    tagColor: Colors.primary,
    roundCount: 10,
    prerequisite: null,
  },
  {
    id: 'discrimination',
    route: '/exercises/discrimination',
    title: 'Discriminación de sonidos',
    description: 'Compará dos sonidos y decidí si son iguales o diferentes.',
    icon: 'graphic-eq',
    iconBg: '#ccfbf1',
    iconColor: '#0d9488',
    tagLabel: 'Intermedio',
    tagColor: '#0d9488',
    roundCount: 10,
    prerequisite: 'detection',
  },
  {
    id: 'words',
    route: '/exercises/words',
    title: 'Reconocimiento de palabras',
    description: 'Escuchá una palabra y seleccioná la imagen correcta entre las opciones.',
    icon: 'record-voice-over',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    tagLabel: 'Avanzado',
    tagColor: '#7c3aed',
    roundCount: 10,
    prerequisite: 'discrimination',
  },
];
