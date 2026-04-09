// Module 1 — Sound Detection (10 everyday sounds via TTS onomatopoeia)
export const DETECTION_SOUNDS = [
  { id: 'doorbell',   label: 'Timbre',    icon: 'doorbell',       file: require('../assets/audio/module1/doorbell.mp3') },
  { id: 'phone_ring', label: 'Teléfono',  icon: 'phone',          file: require('../assets/audio/module1/phone_ring.mp3') },
  { id: 'clapping',   label: 'Aplausos',  icon: 'celebration',    file: require('../assets/audio/module1/clapping.mp3') },
  { id: 'dog_bark',   label: 'Ladrido',   icon: 'pets',           file: require('../assets/audio/module1/dog_bark.mp3') },
  { id: 'rain',       label: 'Lluvia',    icon: 'water_drop',     file: require('../assets/audio/module1/rain.mp3') },
  { id: 'car_horn',   label: 'Bocina',    icon: 'directions_car', file: require('../assets/audio/module1/car_horn.mp3') },
  { id: 'baby_cry',   label: 'Llanto',    icon: 'child_care',     file: require('../assets/audio/module1/baby_cry.mp3') },
  { id: 'thunder',    label: 'Trueno',    icon: 'thunderstorm',   file: require('../assets/audio/module1/thunder.mp3') },
  { id: 'keyboard',   label: 'Teclado',   icon: 'keyboard',       file: require('../assets/audio/module1/keyboard.mp3') },
  { id: 'birds',      label: 'Pájaros',   icon: 'music_note',     file: require('../assets/audio/module1/birds.mp3') },
] as const;

// TTS prompts for Module 1 (what ElevenLabs should say for each sound)
export const DETECTION_TTS_PROMPTS: Record<string, string> = {
  doorbell:   'Din don. Din don.',
  phone_ring: 'Ring ring. Ring ring.',
  clapping:   'Clap clap clap clap clap.',
  dog_bark:   'Guau guau guau.',
  rain:       'Shhhh. Ploc ploc ploc ploc.',
  car_horn:   'Pip pip pip.',
  baby_cry:   'Uah uah uah uah.',
  thunder:    'Buuuuum. Buuum.',
  keyboard:   'Tac tac tac tac tac tac.',
  birds:      'Pío pío pío. Pío pío.',
};

// Module 2 — Sound Discrimination (15 minimal pairs — the core of cochlear rehab)
// isSame: true = both syllables are identical, false = minimal pair (differ by 1 phoneme)
export const DISCRIMINATION_PAIRS = [
  { id: 'p1',  soundA: require('../assets/audio/module2/pair1_a.mp3'),  soundB: require('../assets/audio/module2/pair1_b.mp3'),  isSame: false, labelA: 'BA',  labelB: 'PA'  }, // voiced/unvoiced bilabial
  { id: 'p2',  soundA: require('../assets/audio/module2/pair2_a.mp3'),  soundB: require('../assets/audio/module2/pair2_b.mp3'),  isSame: true,  labelA: 'TA',  labelB: 'TA'  },
  { id: 'p3',  soundA: require('../assets/audio/module2/pair3_a.mp3'),  soundB: require('../assets/audio/module2/pair3_b.mp3'),  isSame: false, labelA: 'DA',  labelB: 'TA'  }, // voiced/unvoiced alveolar
  { id: 'p4',  soundA: require('../assets/audio/module2/pair4_a.mp3'),  soundB: require('../assets/audio/module2/pair4_b.mp3'),  isSame: true,  labelA: 'KA',  labelB: 'KA'  },
  { id: 'p5',  soundA: require('../assets/audio/module2/pair5_a.mp3'),  soundB: require('../assets/audio/module2/pair5_b.mp3'),  isSame: false, labelA: 'SA',  labelB: 'ZA'  }, // fricative pair
  { id: 'p6',  soundA: require('../assets/audio/module2/pair6_a.mp3'),  soundB: require('../assets/audio/module2/pair6_b.mp3'),  isSame: true,  labelA: 'MA',  labelB: 'MA'  },
  { id: 'p7',  soundA: require('../assets/audio/module2/pair7_a.mp3'),  soundB: require('../assets/audio/module2/pair7_b.mp3'),  isSame: false, labelA: 'RA',  labelB: 'LA'  }, // liquid consonants
  { id: 'p8',  soundA: require('../assets/audio/module2/pair8_a.mp3'),  soundB: require('../assets/audio/module2/pair8_b.mp3'),  isSame: true,  labelA: 'FA',  labelB: 'FA'  },
  { id: 'p9',  soundA: require('../assets/audio/module2/pair9_a.mp3'),  soundB: require('../assets/audio/module2/pair9_b.mp3'),  isSame: false, labelA: 'NA',  labelB: 'ÑA'  }, // nasal pair
  { id: 'p10', soundA: require('../assets/audio/module2/pair10_a.mp3'), soundB: require('../assets/audio/module2/pair10_b.mp3'), isSame: true,  labelA: 'SI',  labelB: 'SI'  },
  { id: 'p11', soundA: require('../assets/audio/module2/pair11_a.mp3'), soundB: require('../assets/audio/module2/pair11_b.mp3'), isSame: false, labelA: 'BO',  labelB: 'PO'  },
  { id: 'p12', soundA: require('../assets/audio/module2/pair12_a.mp3'), soundB: require('../assets/audio/module2/pair12_b.mp3'), isSame: true,  labelA: 'GE',  labelB: 'GE'  },
  { id: 'p13', soundA: require('../assets/audio/module2/pair13_a.mp3'), soundB: require('../assets/audio/module2/pair13_b.mp3'), isSame: false, labelA: 'DE',  labelB: 'TE'  },
  { id: 'p14', soundA: require('../assets/audio/module2/pair14_a.mp3'), soundB: require('../assets/audio/module2/pair14_b.mp3'), isSame: false, labelA: 'VE',  labelB: 'BE'  }, // v/b confusion (very common in Spanish)
  { id: 'p15', soundA: require('../assets/audio/module2/pair15_a.mp3'), soundB: require('../assets/audio/module2/pair15_b.mp3'), isSame: true,  labelA: 'LO',  labelB: 'LO'  },
] as const;

// TTS prompts for Module 2 pairs
export const DISCRIMINATION_TTS_PROMPTS: Record<string, string> = {
  pair1_a: 'ba', pair1_b: 'pa',
  pair2_a: 'ta', pair2_b: 'ta',
  pair3_a: 'da', pair3_b: 'ta',
  pair4_a: 'ka', pair4_b: 'ka',
  pair5_a: 'sa', pair5_b: 'za',
  pair6_a: 'ma', pair6_b: 'ma',
  pair7_a: 'ra', pair7_b: 'la',
  pair8_a: 'fa', pair8_b: 'fa',
  pair9_a: 'na', pair9_b: 'ña',
  pair10_a: 'si', pair10_b: 'si',
  pair11_a: 'bo', pair11_b: 'po',
  pair12_a: 'ge', pair12_b: 'ge',
  pair13_a: 'de', pair13_b: 'te',
  pair14_a: 've', pair14_b: 'be',
  pair15_a: 'lo', pair15_b: 'lo',
};

export const NOISE_TRACKS = {
  low:    require('../assets/audio/module2/noise_low.mp3'),
  medium: require('../assets/audio/module2/noise_medium.mp3'),
  high:   require('../assets/audio/module2/noise_high.mp3'),
} as const;

// Module 3 — Word Identification (30 words in 10 RHYMING sets — harder for cochlear implant users)
// Each set contains phonetically similar words (same ending) so the user must listen closely.
export const WORD_SETS = [
  {
    id: 's1',
    words: [
      { id: 'gato',  label: 'Gato',  category: 'Animal',     icon: 'pets',           color: '#dbeafe', file: require('../assets/audio/module3/gato.mp3') },
      { id: 'pato',  label: 'Pato',  category: 'Animal',     icon: 'flutter_dash',   color: '#fef3c7', file: require('../assets/audio/module3/pato.mp3') },
      { id: 'rato',  label: 'Rato',  category: 'Tiempo',     icon: 'access_time',    color: '#dcfce7', file: require('../assets/audio/module3/rato.mp3') },
    ],
    target: 'gato',
  },
  {
    id: 's2',
    words: [
      { id: 'sol',   label: 'Sol',   category: 'Naturaleza', icon: 'wb_sunny',       color: '#fef3c7', file: require('../assets/audio/module3/sol.mp3') },
      { id: 'col',   label: 'Col',   category: 'Comida',     icon: 'local_florist',  color: '#dcfce7', file: require('../assets/audio/module3/col.mp3') },
      { id: 'rol',   label: 'Rol',   category: 'Abstracto',  icon: 'badge',          color: '#ede9fe', file: require('../assets/audio/module3/rol.mp3') },
    ],
    target: 'sol',
  },
  {
    id: 's3',
    words: [
      { id: 'boca',  label: 'Boca',  category: 'Cuerpo',     icon: 'face',           color: '#fce7f3', file: require('../assets/audio/module3/boca.mp3') },
      { id: 'roca',  label: 'Roca',  category: 'Naturaleza', icon: 'landscape',      color: '#dbeafe', file: require('../assets/audio/module3/roca.mp3') },
      { id: 'loca',  label: 'Loca',  category: 'Emoción',    icon: 'mood',           color: '#fef3c7', file: require('../assets/audio/module3/loca.mp3') },
    ],
    target: 'boca',
  },
  {
    id: 's4',
    words: [
      { id: 'pan',   label: 'Pan',   category: 'Comida',     icon: 'breakfast_dining', color: '#fef3c7', file: require('../assets/audio/module3/pan.mp3') },
      { id: 'van',   label: 'Van',   category: 'Transporte', icon: 'directions_bus',   color: '#dbeafe', file: require('../assets/audio/module3/van.mp3') },
      { id: 'dan',   label: 'Dan',   category: 'Acción',     icon: 'volunteer_activism', color: '#dcfce7', file: require('../assets/audio/module3/dan.mp3') },
    ],
    target: 'pan',
  },
  {
    id: 's5',
    words: [
      { id: 'mar',   label: 'Mar',   category: 'Naturaleza', icon: 'waves',          color: '#dbeafe', file: require('../assets/audio/module3/mar.mp3') },
      { id: 'par',   label: 'Par',   category: 'Número',     icon: 'looks_two',      color: '#ede9fe', file: require('../assets/audio/module3/par.mp3') },
      { id: 'bar',   label: 'Bar',   category: 'Lugar',      icon: 'local_bar',      color: '#fce7f3', file: require('../assets/audio/module3/bar.mp3') },
    ],
    target: 'mar',
  },
  {
    id: 's6',
    words: [
      { id: 'vino',  label: 'Vino',  category: 'Bebida',     icon: 'wine_bar',       color: '#fce7f3', file: require('../assets/audio/module3/vino.mp3') },
      { id: 'fino',  label: 'Fino',  category: 'Cualidad',   icon: 'star',           color: '#fef3c7', file: require('../assets/audio/module3/fino.mp3') },
      { id: 'pino',  label: 'Pino',  category: 'Naturaleza', icon: 'park',           color: '#dcfce7', file: require('../assets/audio/module3/pino.mp3') },
    ],
    target: 'vino',
  },
  {
    id: 's7',
    words: [
      { id: 'cama',  label: 'Cama',  category: 'Mueble',     icon: 'bed',            color: '#dbeafe', file: require('../assets/audio/module3/cama.mp3') },
      { id: 'tama',  label: 'Tama',  category: 'Nombre',     icon: 'person',         color: '#fce7f3', file: require('../assets/audio/module3/tama.mp3') },
      { id: 'fama',  label: 'Fama',  category: 'Abstracto',  icon: 'emoji_events',   color: '#fef3c7', file: require('../assets/audio/module3/fama.mp3') },
    ],
    target: 'cama',
  },
  {
    id: 's8',
    words: [
      { id: 'luna',  label: 'Luna',  category: 'Naturaleza', icon: 'nightlight',     color: '#ede9fe', file: require('../assets/audio/module3/luna.mp3') },
      { id: 'duna',  label: 'Duna',  category: 'Naturaleza', icon: 'landscape',      color: '#fef3c7', file: require('../assets/audio/module3/duna.mp3') },
      { id: 'tuna',  label: 'Tuna',  category: 'Comida',     icon: 'set_meal',       color: '#dcfce7', file: require('../assets/audio/module3/tuna.mp3') },
    ],
    target: 'luna',
  },
  {
    id: 's9',
    words: [
      { id: 'toro',  label: 'Toro',  category: 'Animal',     icon: 'cruelty_free',   color: '#fef3c7', file: require('../assets/audio/module3/toro.mp3') },
      { id: 'foro',  label: 'Foro',  category: 'Lugar',      icon: 'forum',          color: '#dbeafe', file: require('../assets/audio/module3/foro.mp3') },
      { id: 'moro',  label: 'Moro',  category: 'Persona',    icon: 'person',         color: '#fce7f3', file: require('../assets/audio/module3/moro.mp3') },
    ],
    target: 'toro',
  },
  {
    id: 's10',
    words: [
      { id: 'beso',  label: 'Beso',  category: 'Emoción',    icon: 'favorite',       color: '#fce7f3', file: require('../assets/audio/module3/beso.mp3') },
      { id: 'peso',  label: 'Peso',  category: 'Medida',     icon: 'monitor_weight', color: '#dbeafe', file: require('../assets/audio/module3/peso.mp3') },
      { id: 'meso',  label: 'Meso',  category: 'Prefijo',    icon: 'layers',         color: '#dcfce7', file: require('../assets/audio/module3/meso.mp3') },
    ],
    target: 'beso',
  },
] as const;

// Feedback audio
export const FEEDBACK_AUDIO = {
  correct:   require('../assets/audio/feedback/correct.mp3'),
  incorrect: require('../assets/audio/feedback/incorrect.mp3'),
};
