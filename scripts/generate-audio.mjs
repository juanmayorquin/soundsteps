#!/usr/bin/env node
/**
 * SoundSteps — Audio Generation Script
 *
 * Strategy:
 *   - Module 1 (10 everyday sounds)        → Sound Effects API (realistic sounds)
 *   - Module 2 noise loops (3 backgrounds)  → Sound Effects API (looping ambient, 30s)
 *   - Module 2 pairs (30 syllables)         → TTS API (River voice, clear & slow)
 *   - Module 3 words (30 Spanish words)     → TTS API (River voice)
 *   - Feedback (2 chimes)                   → Sound Effects API (short UI sounds)
 *
 * Usage:
 *   ELEVENLABS_API_KEY=your_key node scripts/generate-audio.mjs
 *
 * Skips files that are already real (> 50 KB).
 * Re-run to retry any failures.
 */

import { writeFileSync, mkdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Set ELEVENLABS_API_KEY env var first.');
  process.exit(1);
}

// Voice River — calm, neutral, clear Spanish pronunciation
const VOICE_ID = 'SAz9YHcvj6GT2YYXdXww';
const MODEL = 'eleven_multilingual_v2';
const PLACEHOLDER_THRESHOLD_BYTES = 50 * 1024; // 50 KB

// ─── Manifests ──────────────────────────────────────────────────────────────

const SOUND_EFFECT_FILES = [
  // Module 1 — Sound Detection (realistic everyday sounds)
  {
    path: 'assets/audio/module1/doorbell.mp3',
    text: 'Doorbell ringing twice, classic ding dong chime, clear and distinct',
    duration: 4.0,
    prompt_influence: 0.7,
  },
  {
    path: 'assets/audio/module1/phone_ring.mp3',
    text: 'Old telephone ringing, classic ring ring sound, landline phone',
    duration: 4.0,
    prompt_influence: 0.7,
  },
  {
    path: 'assets/audio/module1/clapping.mp3',
    text: 'Group of people clapping applause, enthusiastic clapping hands',
    duration: 4.0,
    prompt_influence: 0.7,
  },
  {
    path: 'assets/audio/module1/dog_bark.mp3',
    text: 'Dog barking three times, medium sized dog, clear bark woof woof woof',
    duration: 3.0,
    prompt_influence: 0.8,
  },
  {
    path: 'assets/audio/module1/rain.mp3',
    text: 'Heavy rain falling on a window, steady rain drops pattering',
    duration: 5.0,
    prompt_influence: 0.6,
  },
  {
    path: 'assets/audio/module1/car_horn.mp3',
    text: 'Car horn honking twice, short car horn beep beep',
    duration: 2.5,
    prompt_influence: 0.8,
  },
  {
    path: 'assets/audio/module1/baby_cry.mp3',
    text: 'Baby crying, infant wailing, newborn crying sound',
    duration: 4.0,
    prompt_influence: 0.8,
  },
  {
    path: 'assets/audio/module1/thunder.mp3',
    text: 'Loud thunderclap, deep booming thunder rumble in the distance',
    duration: 4.0,
    prompt_influence: 0.7,
  },
  {
    path: 'assets/audio/module1/keyboard.mp3',
    text: 'Mechanical keyboard typing rapidly, multiple keystrokes clacking',
    duration: 4.0,
    prompt_influence: 0.7,
  },
  {
    path: 'assets/audio/module1/birds.mp3',
    text: 'Birds chirping in nature, multiple birds singing tweets and whistles',
    duration: 5.0,
    prompt_influence: 0.6,
  },

  // Module 2 — Background noise loops (seamlessly loopable, 30s)
  {
    path: 'assets/audio/module2/noise_low.mp3',
    text: 'Quiet café ambiance, soft background murmur, distant conversation, very subtle background noise',
    duration: 30.0,
    prompt_influence: 0.4,
    loop: true,
  },
  {
    path: 'assets/audio/module2/noise_medium.mp3',
    text: 'Busy street ambient noise, moderate traffic, people talking, urban environment',
    duration: 30.0,
    prompt_influence: 0.4,
    loop: true,
  },
  {
    path: 'assets/audio/module2/noise_high.mp3',
    text: 'Loud busy restaurant noise, many people talking loudly, dishes clattering, high background noise',
    duration: 30.0,
    prompt_influence: 0.4,
    loop: true,
  },

  // Feedback — UI sounds
  {
    path: 'assets/audio/feedback/correct.mp3',
    text: 'Short positive chime, success sound, bright uplifting bell ding, cheerful notification',
    duration: 1.5,
    prompt_influence: 0.8,
  },
  {
    path: 'assets/audio/feedback/incorrect.mp3',
    text: 'Short neutral low tone, soft error sound, gentle low beep, calm neutral notification',
    duration: 1.5,
    prompt_influence: 0.8,
  },
];

const TTS_FILES = [
  // Module 2 — Minimal Pairs (syllables — clear, slightly slow for cochlear rehab)
  { path: 'assets/audio/module2/pair1_a.mp3',  text: 'ba', speed: 0.75 },
  { path: 'assets/audio/module2/pair1_b.mp3',  text: 'pa', speed: 0.75 },
  { path: 'assets/audio/module2/pair2_a.mp3',  text: 'ta', speed: 0.75 },
  { path: 'assets/audio/module2/pair2_b.mp3',  text: 'ta', speed: 0.75 },
  { path: 'assets/audio/module2/pair3_a.mp3',  text: 'da', speed: 0.75 },
  { path: 'assets/audio/module2/pair3_b.mp3',  text: 'ta', speed: 0.75 },
  { path: 'assets/audio/module2/pair4_a.mp3',  text: 'ka', speed: 0.75 },
  { path: 'assets/audio/module2/pair4_b.mp3',  text: 'ka', speed: 0.75 },
  { path: 'assets/audio/module2/pair5_a.mp3',  text: 'sa', speed: 0.75 },
  { path: 'assets/audio/module2/pair5_b.mp3',  text: 'za', speed: 0.75 },
  { path: 'assets/audio/module2/pair6_a.mp3',  text: 'ma', speed: 0.75 },
  { path: 'assets/audio/module2/pair6_b.mp3',  text: 'ma', speed: 0.75 },
  { path: 'assets/audio/module2/pair7_a.mp3',  text: 'ra', speed: 0.75 },
  { path: 'assets/audio/module2/pair7_b.mp3',  text: 'la', speed: 0.75 },
  { path: 'assets/audio/module2/pair8_a.mp3',  text: 'fa', speed: 0.75 },
  { path: 'assets/audio/module2/pair8_b.mp3',  text: 'fa', speed: 0.75 },
  { path: 'assets/audio/module2/pair9_a.mp3',  text: 'na', speed: 0.75 },
  { path: 'assets/audio/module2/pair9_b.mp3',  text: 'ña', speed: 0.75 },
  { path: 'assets/audio/module2/pair10_a.mp3', text: 'si', speed: 0.75 },
  { path: 'assets/audio/module2/pair10_b.mp3', text: 'si', speed: 0.75 },
  { path: 'assets/audio/module2/pair11_a.mp3', text: 'bo', speed: 0.75 },
  { path: 'assets/audio/module2/pair11_b.mp3', text: 'po', speed: 0.75 },
  { path: 'assets/audio/module2/pair12_a.mp3', text: 'ge', speed: 0.75 },
  { path: 'assets/audio/module2/pair12_b.mp3', text: 'ge', speed: 0.75 },
  { path: 'assets/audio/module2/pair13_a.mp3', text: 'de', speed: 0.75 },
  { path: 'assets/audio/module2/pair13_b.mp3', text: 'te', speed: 0.75 },
  { path: 'assets/audio/module2/pair14_a.mp3', text: 've', speed: 0.75 },
  { path: 'assets/audio/module2/pair14_b.mp3', text: 'be', speed: 0.75 },
  { path: 'assets/audio/module2/pair15_a.mp3', text: 'lo', speed: 0.75 },
  { path: 'assets/audio/module2/pair15_b.mp3', text: 'lo', speed: 0.75 },

  // Module 3 — Word Identification (Spanish words, clear pronunciation)
  { path: 'assets/audio/module3/gato.mp3',  text: 'gato',  speed: 0.85 },
  { path: 'assets/audio/module3/pato.mp3',  text: 'pato',  speed: 0.85 },
  { path: 'assets/audio/module3/rato.mp3',  text: 'rato',  speed: 0.85 },
  { path: 'assets/audio/module3/sol.mp3',   text: 'sol',   speed: 0.85 },
  { path: 'assets/audio/module3/col.mp3',   text: 'col',   speed: 0.85 },
  { path: 'assets/audio/module3/rol.mp3',   text: 'rol',   speed: 0.85 },
  { path: 'assets/audio/module3/boca.mp3',  text: 'boca',  speed: 0.85 },
  { path: 'assets/audio/module3/roca.mp3',  text: 'roca',  speed: 0.85 },
  { path: 'assets/audio/module3/loca.mp3',  text: 'loca',  speed: 0.85 },
  { path: 'assets/audio/module3/pan.mp3',   text: 'pan',   speed: 0.85 },
  { path: 'assets/audio/module3/van.mp3',   text: 'van',   speed: 0.85 },
  { path: 'assets/audio/module3/dan.mp3',   text: 'dan',   speed: 0.85 },
  { path: 'assets/audio/module3/mar.mp3',   text: 'mar',   speed: 0.85 },
  { path: 'assets/audio/module3/par.mp3',   text: 'par',   speed: 0.85 },
  { path: 'assets/audio/module3/bar.mp3',   text: 'bar',   speed: 0.85 },
  { path: 'assets/audio/module3/vino.mp3',  text: 'vino',  speed: 0.85 },
  { path: 'assets/audio/module3/fino.mp3',  text: 'fino',  speed: 0.85 },
  { path: 'assets/audio/module3/pino.mp3',  text: 'pino',  speed: 0.85 },
  { path: 'assets/audio/module3/cama.mp3',  text: 'cama',  speed: 0.85 },
  { path: 'assets/audio/module3/tama.mp3',  text: 'tama',  speed: 0.85 },
  { path: 'assets/audio/module3/fama.mp3',  text: 'fama',  speed: 0.85 },
  { path: 'assets/audio/module3/luna.mp3',  text: 'luna',  speed: 0.85 },
  { path: 'assets/audio/module3/duna.mp3',  text: 'duna',  speed: 0.85 },
  { path: 'assets/audio/module3/tuna.mp3',  text: 'tuna',  speed: 0.85 },
  { path: 'assets/audio/module3/toro.mp3',  text: 'toro',  speed: 0.85 },
  { path: 'assets/audio/module3/foro.mp3',  text: 'foro',  speed: 0.85 },
  { path: 'assets/audio/module3/moro.mp3',  text: 'moro',  speed: 0.85 },
  { path: 'assets/audio/module3/beso.mp3',  text: 'beso',  speed: 0.85 },
  { path: 'assets/audio/module3/peso.mp3',  text: 'peso',  speed: 0.85 },
  { path: 'assets/audio/module3/meso.mp3',  text: 'meso',  speed: 0.85 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function isPlaceholder(filePath) {
  const full = join(ROOT, filePath);
  if (!existsSync(full)) return true;
  const { size } = statSync(full);
  return size < PLACEHOLDER_THRESHOLD_BYTES;
}

function saveFile(filePath, buffer) {
  const full = join(ROOT, filePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, buffer);
  return buffer.length;
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── API calls ──────────────────────────────────────────────────────────────

async function generateSoundEffect({ path, text, duration = null, prompt_influence = 0.3, loop = false }) {
  const body = { text, prompt_influence };
  if (duration !== null) body.duration_seconds = duration;
  if (loop) body.loop = true;

  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return saveFile(path, buffer);
}

async function generateTTS({ path, text, speed = 1.0 }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      language_code: 'es',
      voice_settings: {
        stability: 0.9,
        similarity_boost: 0.8,
        style: 0.0,
        speed,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return saveFile(path, buffer);
}

// ─── Main ───────────────────────────────────────────────────────────────────

const sfxNeeded = SOUND_EFFECT_FILES.filter((f) => isPlaceholder(f.path));
const ttsNeeded = TTS_FILES.filter((f) => isPlaceholder(f.path));
const total = sfxNeeded.length + ttsNeeded.length;

console.log(`\nSoundSteps Audio Generator`);
console.log(`  Sound Effects : ${sfxNeeded.length} files`);
console.log(`  TTS (River)   : ${ttsNeeded.length} files`);
console.log(`  Total         : ${total} files to generate`);
console.log(`  Skipping      : ${SOUND_EFFECT_FILES.length + TTS_FILES.length - total} already real\n`);

if (total === 0) {
  console.log('All files already generated.');
  process.exit(0);
}

let ok = 0;
let fail = 0;

// Sound Effects
if (sfxNeeded.length > 0) {
  console.log('--- Sound Effects ---');
  for (const file of sfxNeeded) {
    const tag = file.loop ? ' [loop]' : '';
    process.stdout.write(`  ${file.path}${tag} ... `);
    try {
      const bytes = await generateSoundEffect(file);
      console.log(`ok (${(bytes / 1024).toFixed(1)} KB)`);
      ok++;
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      fail++;
    }
    await delay(800);
  }
}

// TTS
if (ttsNeeded.length > 0) {
  console.log('\n--- TTS (River voice) ---');
  for (const file of ttsNeeded) {
    process.stdout.write(`  ${file.path} ["${file.text}"] ... `);
    try {
      const bytes = await generateTTS(file);
      console.log(`ok (${(bytes / 1024).toFixed(1)} KB)`);
      ok++;
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      fail++;
    }
    await delay(500);
  }
}

console.log(`\nDone: ${ok} generated, ${fail} failed.`);
if (fail > 0) {
  console.log('Re-run to retry failed files.');
  process.exit(1);
}
