import type { Level } from './Modules';

// ==================== TYPES ====================

export type DetectionStimulus = {
  id: string;
  label: string;
  isSilence?: boolean;
  file: ReturnType<typeof require>;
};

export type DiscriminationPair = {
  id: string;
  labelA: string;
  labelB: string;
  soundA: ReturnType<typeof require>;
  soundB: ReturnType<typeof require>;
};

export type SyllableClass = 'mono' | 'bi' | 'tri' | 'poly';

export type Word = {
  id: string;
  label: string;
  syllables: SyllableClass;
  icon: string;
  color: string;
  file: ReturnType<typeof require>;
};

// ==================== MODULE 1 — DETECTION ====================

export const DETECTION_STIMULI: {
  environmental: DetectionStimulus[];
  phonetic: DetectionStimulus[];
  silence: DetectionStimulus;
} = {
  environmental: [
    { id: 'doorbell',   label: 'Timbre',   file: require('../assets/audio/module1/doorbell.mp3') },
    { id: 'phone_ring', label: 'Teléfono', file: require('../assets/audio/module1/phone_ring.mp3') },
    { id: 'clapping',   label: 'Aplausos', file: require('../assets/audio/module1/clapping.mp3') },
    { id: 'dog_bark',   label: 'Ladrido',  file: require('../assets/audio/module1/dog_bark.mp3') },
    { id: 'rain',       label: 'Lluvia',   file: require('../assets/audio/module1/rain.mp3') },
    { id: 'car_horn',   label: 'Bocina',   file: require('../assets/audio/module1/car_horn.mp3') },
    { id: 'baby_cry',   label: 'Llanto',   file: require('../assets/audio/module1/baby_cry.mp3') },
  ],
  phonetic: [
    { id: 'vowel_a', label: '/a/',   file: require('../assets/audio/module1/vowel_a.mp3') },
    { id: 'vowel_u', label: '/u/',   file: require('../assets/audio/module1/vowel_u.mp3') },
    { id: 'click',   label: 'Click', file: require('../assets/audio/module1/click.mp3') },
  ],
  silence: {
    id: 'silence',
    label: '(silencio)',
    isSilence: true,
    file: require('../assets/audio/module1/silence.mp3'),
  },
};

export const DETECTION_LEVELS: Record<Level, {
  pool: Array<'environmental' | 'phonetic'>;
  catchRatio: number;
  noiseVolume: number;
}> = {
  1: { pool: ['environmental'],             catchRatio: 0.20, noiseVolume: 0.0 },
  2: { pool: ['environmental', 'phonetic'], catchRatio: 0.25, noiseVolume: 0.2 },
  3: { pool: ['environmental', 'phonetic'], catchRatio: 0.30, noiseVolume: 0.2 },
};

// ==================== MODULE 2 — DISCRIMINATION ====================

export const DISCRIMINATION_PAIRS: {
  veryDifferent: DiscriminationPair[];
  similar: DiscriminationPair[];
  minimal: DiscriminationPair[];
} = {
  veryDifferent: [
    { id: 'a-i',        labelA: '/a/',  labelB: '/i/',  soundA: require('../assets/audio/module2/a-i_a.mp3'),        soundB: require('../assets/audio/module2/a-i_b.mp3') },
    { id: 'u-i',        labelA: '/u/',  labelB: '/i/',  soundA: require('../assets/audio/module2/u-i_a.mp3'),        soundB: require('../assets/audio/module2/u-i_b.mp3') },
    { id: 'tone-lo-hi', labelA: 'Grave', labelB: 'Agudo', soundA: require('../assets/audio/module2/tone-lo-hi_a.mp3'), soundB: require('../assets/audio/module2/tone-lo-hi_b.mp3') },
    { id: 'pa-ma',      labelA: 'PA',  labelB: 'MA',   soundA: require('../assets/audio/module2/pa-ma_a.mp3'),       soundB: require('../assets/audio/module2/pa-ma_b.mp3') },
    { id: 'sa-ma',      labelA: 'SA',  labelB: 'MA',   soundA: require('../assets/audio/module2/sa-ma_a.mp3'),       soundB: require('../assets/audio/module2/sa-ma_b.mp3') },
  ],
  similar: [
    { id: 'pa-ba', labelA: 'PA', labelB: 'BA', soundA: require('../assets/audio/module2/pa-ba_a.mp3'), soundB: require('../assets/audio/module2/pa-ba_b.mp3') },
    { id: 'ma-na', labelA: 'MA', labelB: 'NA', soundA: require('../assets/audio/module2/ma-na_a.mp3'), soundB: require('../assets/audio/module2/ma-na_b.mp3') },
    { id: 'ra-la', labelA: 'RA', labelB: 'LA', soundA: require('../assets/audio/module2/ra-la_a.mp3'), soundB: require('../assets/audio/module2/ra-la_b.mp3') },
    { id: 'fa-va', labelA: 'FA', labelB: 'VA', soundA: require('../assets/audio/module2/fa-va_a.mp3'), soundB: require('../assets/audio/module2/fa-va_b.mp3') },
    { id: 'na-na', labelA: 'NA', labelB: 'ÑA', soundA: require('../assets/audio/module2/na-na_a.mp3'), soundB: require('../assets/audio/module2/na-na_b.mp3') },
  ],
  minimal: [
    { id: 'ta-da',     labelA: 'TA', labelB: 'DA', soundA: require('../assets/audio/module2/ta-da_a.mp3'),     soundB: require('../assets/audio/module2/ta-da_b.mp3') },
    { id: 'ka-ga',     labelA: 'KA', labelB: 'GA', soundA: require('../assets/audio/module2/ka-ga_a.mp3'),     soundB: require('../assets/audio/module2/ka-ga_b.mp3') },
    { id: 'sa-za',     labelA: 'SA', labelB: 'ZA', soundA: require('../assets/audio/module2/sa-za_a.mp3'),     soundB: require('../assets/audio/module2/sa-za_b.mp3') },
    { id: 'pa-ba-min', labelA: 'PA', labelB: 'BA', soundA: require('../assets/audio/module2/pa-ba-min_a.mp3'), soundB: require('../assets/audio/module2/pa-ba-min_b.mp3') },
    { id: 'fa-sa',     labelA: 'FA', labelB: 'SA', soundA: require('../assets/audio/module2/fa-sa_a.mp3'),     soundB: require('../assets/audio/module2/fa-sa_b.mp3') },
  ],
};

export const DISCRIMINATION_LEVELS: Record<Level, {
  pool: 'veryDifferent' | 'similar' | 'minimal';
  noiseVolume: number;
}> = {
  1: { pool: 'veryDifferent', noiseVolume: 0.0 },
  2: { pool: 'similar',       noiseVolume: 0.2 },
  3: { pool: 'minimal',       noiseVolume: 0.4 },
};

// ==================== MODULE 3 — WORDS ====================

export const WORDS: Word[] = [
  // Monosyllabic — 8
  { id: 'sol',  label: 'Sol',  syllables: 'mono', icon: 'wb-sunny',         color: '#fef3c7', file: require('../assets/audio/module3/sol.mp3') },
  { id: 'pan',  label: 'Pan',  syllables: 'mono', icon: 'bakery-dining',    color: '#fef3c7', file: require('../assets/audio/module3/pan.mp3') },
  { id: 'mar',  label: 'Mar',  syllables: 'mono', icon: 'waves',            color: '#dbeafe', file: require('../assets/audio/module3/mar.mp3') },
  { id: 'luz',  label: 'Luz',  syllables: 'mono', icon: 'lightbulb',        color: '#fef3c7', file: require('../assets/audio/module3/luz.mp3') },
  { id: 'si',   label: 'Sí',   syllables: 'mono', icon: 'check-circle',     color: '#dcfce7', file: require('../assets/audio/module3/si.mp3') },
  { id: 'no',   label: 'No',   syllables: 'mono', icon: 'cancel',           color: '#fee2e2', file: require('../assets/audio/module3/no.mp3') },
  { id: 'ven',  label: 'Ven',  syllables: 'mono', icon: 'front-hand',       color: '#ede9fe', file: require('../assets/audio/module3/ven.mp3') },
  { id: 'ir',   label: 'Ir',   syllables: 'mono', icon: 'directions-walk',  color: '#dbeafe', file: require('../assets/audio/module3/ir.mp3') },

  // Bisyllabic — 12
  { id: 'casa',   label: 'Casa',   syllables: 'bi', icon: 'home',           color: '#dbeafe', file: require('../assets/audio/module3/casa.mp3') },
  { id: 'perro',  label: 'Perro',  syllables: 'bi', icon: 'pets',           color: '#fef3c7', file: require('../assets/audio/module3/perro.mp3') },
  { id: 'carro',  label: 'Carro',  syllables: 'bi', icon: 'directions-car', color: '#dbeafe', file: require('../assets/audio/module3/carro.mp3') },
  { id: 'puerta', label: 'Puerta', syllables: 'bi', icon: 'door-front',     color: '#ede9fe', file: require('../assets/audio/module3/puerta.mp3') },
  { id: 'agua',   label: 'Agua',   syllables: 'bi', icon: 'water-drop',     color: '#dbeafe', file: require('../assets/audio/module3/agua.mp3') },
  { id: 'gato',   label: 'Gato',   syllables: 'bi', icon: 'pets',           color: '#fce7f3', file: require('../assets/audio/module3/gato.mp3') },
  { id: 'mama',   label: 'Mamá',   syllables: 'bi', icon: 'favorite',       color: '#fce7f3', file: require('../assets/audio/module3/mama.mp3') },
  { id: 'papa',   label: 'Papá',   syllables: 'bi', icon: 'face',           color: '#dbeafe', file: require('../assets/audio/module3/papa.mp3') },
  { id: 'bebe',   label: 'Bebé',   syllables: 'bi', icon: 'child-care',     color: '#fce7f3', file: require('../assets/audio/module3/bebe.mp3') },
  { id: 'hola',   label: 'Hola',   syllables: 'bi', icon: 'waving-hand',    color: '#fef3c7', file: require('../assets/audio/module3/hola.mp3') },
  { id: 'vaso',   label: 'Vaso',   syllables: 'bi', icon: 'local-bar',      color: '#dbeafe', file: require('../assets/audio/module3/vaso.mp3') },
  { id: 'libro',  label: 'Libro',  syllables: 'bi', icon: 'menu-book',      color: '#dcfce7', file: require('../assets/audio/module3/libro.mp3') },

  // Trisyllabic — 5
  { id: 'telefono', label: 'Teléfono', syllables: 'tri', icon: 'phone',          color: '#dbeafe', file: require('../assets/audio/module3/telefono.mp3') },
  { id: 'pelota',   label: 'Pelota',   syllables: 'tri', icon: 'sports-soccer',  color: '#fef3c7', file: require('../assets/audio/module3/pelota.mp3') },
  { id: 'zapato',   label: 'Zapato',   syllables: 'tri', icon: 'checkroom',      color: '#ede9fe', file: require('../assets/audio/module3/zapato.mp3') },
  { id: 'comer',    label: 'Comer',    syllables: 'tri', icon: 'restaurant',     color: '#dcfce7', file: require('../assets/audio/module3/comer.mp3') },
  { id: 'sentar',   label: 'Sentar',   syllables: 'tri', icon: 'chair',          color: '#fce7f3', file: require('../assets/audio/module3/sentar.mp3') },
];
// Total: 25 words (8 mono + 12 bi + 5 tri)

export const WORDS_LEVELS: Record<Level, {
  syllables: 'mono' | 'mixed' | 'any';
  distractors: number | [number, number];
  noiseVolume: number;
}> = {
  1: { syllables: 'mono',  distractors: 2,      noiseVolume: 0.0 },
  2: { syllables: 'mixed', distractors: [3, 4], noiseVolume: 0.2 },
  3: { syllables: 'any',   distractors: [5, 6], noiseVolume: 0.2 },
};

// ==================== FEEDBACK (preserved) ====================

export const FEEDBACK_AUDIO = {
  correct:   require('../assets/audio/feedback/correct.mp3'),
  incorrect: require('../assets/audio/feedback/incorrect.mp3'),
};

// ==================== NOISE (preserved) ====================

export const NOISE_TRACKS = {
  low:    require('../assets/audio/module2/noise_low.mp3'),
  medium: require('../assets/audio/module2/noise_medium.mp3'),
  high:   require('../assets/audio/module2/noise_high.mp3'),
} as const;
