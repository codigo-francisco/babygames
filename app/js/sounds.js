// Efectos de sonido sintetizados con WebAudio (sin archivos) y voz en español.

let ctx = null;
let master = null;
let volume = 0.7;
let paused = false; // la app está en segundo plano (pauseAudio)

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended' && !paused) ctx.resume();
  return ctx;
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = volume;
}

// `at` (opcional) es un instante absoluto del reloj de WebAudio; `out`, la
// salida (por defecto, el volumen general).
function tone({ freq = 440, to = null, type = 'sine', dur = 0.15, gain = 0.3, delay = 0, at = null, out = null }) {
  const ac = audio();
  if (!ac) return;
  const t0 = at ?? ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(out || master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.12, gain = 0.25, from = 3000, to = 600, delay = 0 }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0);
}

// Escala pentatónica: cualquier combinación suena bien.
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

export const sfx = {
  tap() { tone({ freq: 520, to: 780, type: 'triangle', dur: 0.12, gain: 0.25 }); },
  pop(step = 0) {
    noise({ dur: 0.09, gain: 0.35, from: 2500, to: 400 });
    tone({ freq: PENTA[step % PENTA.length], type: 'triangle', dur: 0.35, gain: 0.22, delay: 0.02 });
  },
  giggle() {
    [0, 1, 2, 3].forEach((i) => tone({ freq: 700 + i * 120, to: 900 + i * 140, type: 'sine', dur: 0.08, gain: 0.18, delay: i * 0.09 }));
  },
  whoosh() { noise({ dur: 0.35, gain: 0.18, from: 400, to: 3500 }); },
  back() { tone({ freq: 700, to: 350, type: 'triangle', dur: 0.2, gain: 0.22 }); },
  star() {
    [0, 2, 4, 5].forEach((n, i) => tone({ freq: PENTA[n], type: 'triangle', dur: 0.25, gain: 0.22, delay: i * 0.1 }));
    tone({ freq: PENTA[7], type: 'sine', dur: 0.6, gain: 0.18, delay: 0.42 });
  },
  fanfare() {
    [0, 2, 4, 7, 4, 7].forEach((n, i) => tone({ freq: PENTA[n], type: 'square', dur: 0.18, gain: 0.08, delay: i * 0.12 }));
    [0, 2, 4, 7, 4, 7].forEach((n, i) => tone({ freq: PENTA[n] / 2, type: 'triangle', dur: 0.2, gain: 0.15, delay: i * 0.12 }));
  },
  tick() { tone({ freq: 1200, type: 'sine', dur: 0.04, gain: 0.08 }); },
  // Cuenta atrás de los juegos: 3, 2, 1… ¡Ya!
  count() { tone({ freq: PENTA[2], type: 'triangle', dur: 0.18, gain: 0.25 }); },
  go() {
    tone({ freq: PENTA[5], type: 'triangle', dur: 0.4, gain: 0.25 });
    tone({ freq: PENTA[7], type: 'sine', dur: 0.4, gain: 0.15, delay: 0.05 });
  },
  // Topo atrapado: golpe blandito y un "boing" hacia arriba.
  bonk() {
    noise({ dur: 0.08, gain: 0.35, from: 900, to: 200 });
    tone({ freq: 260, to: 820, type: 'triangle', dur: 0.22, gain: 0.25, delay: 0.03 });
    tone({ freq: PENTA[Math.floor(Math.random() * PENTA.length)], type: 'sine', dur: 0.25, gain: 0.12, delay: 0.12 });
  },
  // Burbujas: disparo y burbuja que se pega.
  shoot() {
    tone({ freq: 420, to: 1100, type: 'sine', dur: 0.14, gain: 0.22 });
    noise({ dur: 0.1, gain: 0.08, from: 1500, to: 4000 });
  },
  tock() { tone({ freq: 330, to: 260, type: 'triangle', dur: 0.08, gain: 0.25 }); },
  // Colores: intercambio y cambio que no vale.
  swap() { noise({ dur: 0.16, gain: 0.12, from: 600, to: 2400 }); },
  wrong() { tone({ freq: 420, to: 180, type: 'triangle', dur: 0.3, gain: 0.22 }); },
  // Fin de partida sin ganar: tres notas que bajan, sin dramatismo.
  sad() {
    [4, 2, 0].forEach((n, i) => tone({ freq: PENTA[n], type: 'triangle', dur: 0.3, gain: 0.2, delay: i * 0.22 }));
  },
  // Juegos de animales: salto, pieza encajada, bote de pintura y pasito de carrera.
  boing() {
    tone({ freq: 220, to: 660, type: 'sine', dur: 0.18, gain: 0.25 });
    tone({ freq: 660, to: 330, type: 'sine', dur: 0.2, gain: 0.15, delay: 0.16 });
  },
  snap() {
    noise({ dur: 0.05, gain: 0.3, from: 3000, to: 900 });
    tone({ freq: PENTA[5], type: 'triangle', dur: 0.2, gain: 0.22, delay: 0.03 });
  },
  paint() {
    noise({ dur: 0.18, gain: 0.14, from: 800, to: 300 });
    tone({ freq: PENTA[Math.floor(Math.random() * PENTA.length)], type: 'sine', dur: 0.25, gain: 0.18, delay: 0.05 });
  },
  step() { tone({ freq: 500 + Math.random() * 200, type: 'triangle', dur: 0.06, gain: 0.12 }); },
};

// ---- Música de los juegos ------------------------------------------------
// Melodías cortas en bucle (pentatónica de Do), en corcheas. Las notas se
// programan con un poco de antelación sobre el reloj de WebAudio para que el
// ritmo no dependa de los saltos del temporizador. null = silencio.

const NOTE = (semitones) => 261.63 * Math.pow(2, semitones / 12); // desde Do4

const TUNES = {
  burbujas: {
    bpm: 96,
    wave: 'sine',
    melody: [
      12, null, 16, null, 19, 16, 14, null,
      12, null, 9, null, 7, null, null, null,
      9, null, 12, null, 14, 12, 9, null,
      7, 9, 12, null, 12, null, null, null,
    ],
    bass: [-12, -15, -20, -17],
  },
  colores: {
    bpm: 112,
    wave: 'triangle',
    melody: [
      16, 19, 21, 19, 16, null, 14, null,
      12, 14, 16, null, 19, null, null, null,
      21, 19, 16, 14, 12, null, 14, null,
      16, null, 14, null, 12, null, null, null,
    ],
    bass: [-12, -20, -15, -17],
  },
  granja: {
    bpm: 100,
    wave: 'triangle',
    melody: [
      12, null, 12, null, 12, null, 7, null,
      9, null, 9, null, 7, null, null, null,
      16, null, 16, null, 14, null, 14, null,
      12, null, null, null, null, null, null, null,
    ],
    bass: [-12, -15, -20, -12],
  },
  carrera: {
    bpm: 140,
    wave: 'square',
    melody: [
      12, 16, 19, 16, 12, 16, 19, 24,
      21, 19, 16, 19, 21, null, 19, null,
      12, 16, 19, 16, 12, 16, 19, 24,
      21, 19, 16, 14, 12, null, null, null,
    ],
    bass: [-12, -20, -15, -17],
  },
  calma: {
    bpm: 84,
    wave: 'sine',
    melody: [
      16, null, 19, null, 21, null, 19, null,
      16, null, 14, null, 12, null, null, null,
      14, null, 16, null, 19, null, 16, null,
      14, null, 12, null, 9, null, null, null,
    ],
    bass: [-12, -15, -20, -17],
  },
};

const MUSIC_GAIN = 0.35;
let musicOn = true;
let musicGain = null;
let musicTimer = 0;
let tune = null;
let step = 0;
let nextTime = 0;

function scheduleMusic() {
  const stepDur = 60 / tune.bpm / 2;
  while (nextTime < ctx.currentTime + 0.15) {
    const i = step % tune.melody.length;
    const n = tune.melody[i];
    if (n !== null) {
      tone({ freq: NOTE(n), type: tune.wave, dur: stepDur * 1.6, gain: 0.22, at: nextTime, out: musicGain });
    }
    if (i % 4 === 0) {
      const bass = tune.bass[Math.floor(i / 8) % tune.bass.length];
      tone({ freq: NOTE(bass), type: 'triangle', dur: stepDur * 3, gain: 0.16, at: nextTime, out: musicGain });
    }
    nextTime += stepDur;
    step++;
  }
}

export const music = {
  play(name) {
    music.stop();
    if (!musicOn || !TUNES[name]) return;
    const ac = audio();
    if (!ac) return;
    if (!musicGain) {
      musicGain = ac.createGain();
      musicGain.connect(master);
    }
    musicGain.gain.setValueAtTime(MUSIC_GAIN, ac.currentTime);
    tune = TUNES[name];
    step = 0;
    nextTime = ac.currentTime + 0.1;
    scheduleMusic();
    musicTimer = setInterval(scheduleMusic, 25);
  },
  stop() {
    if (!musicTimer) return;
    clearInterval(musicTimer);
    musicTimer = 0;
    // Silencia también las notas que ya estaban programadas.
    musicGain.gain.setValueAtTime(0, ctx.currentTime);
  },
};

export function setMusic(on) {
  musicOn = !!on;
  if (!musicOn) music.stop();
}

// ---- Voz ----------------------------------------------------------------

let voiceOn = true;
let spanishVoice = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const spanish = window.speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
  // Preferimos voces femeninas suaves (España o México); si no, cualquiera en español.
  spanishVoice =
    spanish.find((v) => /helena|laura|elvira|sabina|dalia|paloma/i.test(v.name)) ||
    spanish.find((v) => v.lang === 'es-ES') ||
    spanish[0] ||
    null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function setVoice(on) {
  voiceOn = !!on;
  if (!voiceOn && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function hasSpanishVoice() {
  return !!spanishVoice;
}

// Solo habla si hay una voz en español instalada (una voz inglesa leyendo
// español confunde más que ayuda).
export function say(text) {
  if (!voiceOn || !spanishVoice || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = spanishVoice;
  u.lang = spanishVoice.lang;
  u.rate = 0.95;
  u.pitch = 1.3;
  u.volume = Math.max(0.2, volume);
  synth.speak(u);
}

export function unlockAudio() {
  audio();
}

// La app pasa a segundo plano: se congela todo el sonido (la música sigue donde
// estaba al volver) y Bubu se calla.
export function pauseAudio() {
  paused = true;
  if (ctx && ctx.state === 'running') ctx.suspend();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function resumeAudio() {
  paused = false;
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
