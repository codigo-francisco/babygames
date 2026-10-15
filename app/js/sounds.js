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

function noise({ dur = 0.12, gain = 0.25, from = 3000, to = 600, delay = 0, at = null, out = null }) {
  const ac = audio();
  if (!ac) return;
  const t0 = at ?? ac.currentTime + delay;
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
  src.connect(filter).connect(g).connect(out || master);
  src.start(t0);
}

// ---- Sonidos de animales (estilo dibujos animados) ------------------------
// Una "voz" sintetizada: oscilador -> dos filtros de formante (las vocales) ->
// envolvente. Las curvas son listas de [fracción de la duración, valor].
function curve(param, points, t0, dur) {
  param.setValueAtTime(points[0][1], t0);
  for (let i = 1; i < points.length; i++) param.linearRampToValueAtTime(points[i][1], t0 + points[i][0] * dur);
}

function voc({ delay = 0, dur = 0.4, f0, formants, wave = 'sawtooth', q = 6, gain = 0.4, attack = 0.03, wobble = null, vibrato = null, out = null }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  osc.type = wave;
  curve(osc.frequency, f0, t0, dur);
  if (vibrato) {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = vibrato.rate;
    depth.gain.value = vibrato.depth;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.1);
  }
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  env.gain.setValueAtTime(gain, t0 + dur * 0.7);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  // Ronquido/croar: el volumen tiembla rápido.
  let sink = env;
  if (wobble) {
    const am = ac.createGain();
    am.gain.value = 1 - wobble.depth;
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = wobble.rate;
    depth.gain.value = wobble.depth;
    lfo.connect(depth).connect(am.gain);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.1);
    am.connect(env);
    sink = am;
  }
  formants.forEach((points, i) => {
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    curve(f.frequency, points, t0, dur);
    const g = ac.createGain();
    g.gain.value = i === 0 ? 1.6 : 0.9;
    osc.connect(f).connect(g).connect(sink);
  });
  env.connect(out || master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.1);
}

const ANIMAL_SOUNDS = {
  perro() {
    [0, 0.32].forEach((d) => {
      noise({ dur: 0.05, gain: 0.25, from: 1800, to: 900, delay: d });
      voc({ delay: d, dur: 0.2, f0: [[0, 420], [0.3, 620], [1, 330]], formants: [[[0, 650], [0.4, 900], [1, 500]], [[0, 1300], [0.4, 1600], [1, 1000]]], q: 5, gain: 0.55, attack: 0.012 });
    });
  },
  gato() {
    voc({ dur: 0.8, f0: [[0, 520], [0.35, 760], [1, 480]], formants: [[[0, 320], [0.3, 900], [0.75, 700], [1, 380]], [[0, 2300], [0.3, 1500], [0.75, 1100], [1, 800]]], q: 7, gain: 0.45, attack: 0.06, vibrato: { rate: 6, depth: 12 } });
  },
  cerdo() {
    [0, 0.3].forEach((d) => {
      noise({ dur: 0.08, gain: 0.2, from: 500, to: 250, delay: d });
      voc({ delay: d + 0.03, dur: 0.22, f0: [[0, 280], [0.4, 420], [1, 250]], wave: 'square', formants: [[[0, 520], [1, 450]], [[0, 1600], [1, 1400]]], q: 10, gain: 0.5, attack: 0.02 });
    });
  },
  vaca() {
    voc({ dur: 1.3, f0: [[0, 115], [0.4, 150], [1, 105]], formants: [[[0, 300], [0.25, 650], [1, 380]], [[0, 800], [0.25, 1050], [1, 700]]], q: 4, gain: 0.6, attack: 0.15, vibrato: { rate: 5, depth: 3 } });
  },
  leon() {
    noise({ dur: 0.9, gain: 0.12, from: 400, to: 150 });
    voc({ dur: 1.0, f0: [[0, 95], [0.3, 160], [1, 80]], formants: [[[0, 400], [0.3, 700], [1, 350]], [[0, 900], [1, 700]]], q: 3, gain: 0.55, attack: 0.1, wobble: { rate: 28, depth: 0.5 } });
  },
  rana() {
    [0, 0.38].forEach((d) => {
      voc({ delay: d, dur: 0.28, f0: [[0, 95], [1, 120]], wave: 'square', formants: [[[0, 450], [1, 380]], [[0, 1200], [1, 1000]]], q: 5, gain: 0.55, attack: 0.01, wobble: { rate: 45, depth: 0.9 } });
    });
  },
  oso() {
    voc({ dur: 0.7, f0: [[0, 85], [0.4, 120], [1, 75]], formants: [[[0, 380], [0.4, 600], [1, 330]], [[0, 800], [1, 650]]], q: 3, gain: 0.55, attack: 0.08, wobble: { rate: 22, depth: 0.45 } });
  },
  pollito() {
    [0, 0.2, 0.42].forEach((d) => {
      voc({ delay: d, dur: 0.13, f0: [[0, 2600], [0.5, 3500], [1, 3000]], wave: 'sine', formants: [[[0, 3000], [1, 3200]]], q: 1, gain: 0.35, attack: 0.01 });
    });
  },
};

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
  // Carrera: silbato de salida y aplausos del público en la meta.
  whistle() {
    voc({ dur: 0.5, f0: [[0, 2100], [0.2, 2300], [1, 2250]], wave: 'sine', formants: [[[0, 2200], [1, 2200]]], q: 1, gain: 0.3, attack: 0.02, wobble: { rate: 32, depth: 0.6 } });
  },
  cheer() {
    for (let i = 0; i < 18; i++) noise({ dur: 0.05, gain: 0.18, from: 2500 + Math.random() * 1500, to: 1200, delay: i * 0.07 + Math.random() * 0.04 });
    voc({ dur: 1.2, f0: [[0, 400], [0.5, 520], [1, 380]], formants: [[[0, 700], [1, 600]], [[0, 1200], [1, 1000]]], q: 2, gain: 0.12, attack: 0.2, vibrato: { rate: 7, depth: 25 } });
  },
  // Sonido del animal (perro, gato, cerdo, vaca, leon, rana, oso, pollito).
  animal(id) {
    const play = ANIMAL_SOUNDS[id];
    if (play) play();
  },
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
  // Carrera: tres canciones alegres con batería; cada carrera suena una (ver VARIANTS).
  // drums: un carácter por corchea — k bombo, s palmada, h platillo, c "cloc" de cascos.
  carrera_galope: {
    bpm: 150,
    wave: 'square',
    melody: [
      12, 12, 12, null, 12, 12, 12, null, 12, 12, 16, 19, 16, null, 12, null,
      14, 14, 14, null, 14, 14, 14, null, 14, 14, 17, 21, 19, null, null, null,
      19, 19, 19, null, 19, 21, 19, 17, 16, null, 14, null, 12, null, 16, null,
      14, 14, 16, 14, 12, null, 7, null, 12, null, null, null, null, null, null, null,
    ],
    bass: [-12, -12, -10, -10, -5, -15, -10, -12],
    drums: 'kcckckcckcckkcch',
  },
  carrera_circo: {
    bpm: 132,
    wave: 'triangle',
    melody: [
      19, null, 18, 19, 21, 19, 16, null, 17, null, 16, 17, 19, 17, 14, null,
      12, 14, 16, 17, 19, null, 21, null, 19, 16, 14, 12, 12, null, null, null,
      24, null, 23, 24, 26, 24, 21, null, 22, null, 21, 22, 24, 22, 19, null,
      17, 19, 21, 22, 24, null, 26, null, 24, 21, 19, 17, 12, null, null, null,
    ],
    bass: [-12, -5, -10, -5, -7, -12, -10, -17],
    drums: 'k.s.k.s.k.s.kks.',
  },
  carrera_fiesta: {
    bpm: 140,
    wave: 'square',
    melody: [
      12, 16, 19, 24, 21, 19, 16, 19, 17, 21, 24, 21, 19, null, null, null,
      16, 19, 23, 26, 24, 21, 19, 16, 14, 17, 21, 17, 12, null, null, null,
      12, 16, 19, 24, 21, 19, 16, 19, 17, 21, 24, 21, 19, null, 16, null,
      14, null, 17, null, 19, null, 23, null, 24, null, null, null, null, null, null, null,
    ],
    bass: [-12, -15, -7, -12, -12, -15, -10, -5],
    drums: 'k.hsk.hskkhsk.hs',
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

// Batería sintetizada para las canciones que la tienen.
function drum(kind, at) {
  const out = musicGain;
  if (kind === 'k') tone({ freq: 150, to: 45, type: 'sine', dur: 0.18, gain: 0.5, at, out });
  else if (kind === 's') noise({ dur: 0.12, gain: 0.22, from: 2200, to: 1200, at, out });
  else if (kind === 'h') noise({ dur: 0.04, gain: 0.12, from: 9000, to: 7000, at, out });
  else if (kind === 'c') tone({ freq: 900 + Math.random() * 150, to: 650, type: 'triangle', dur: 0.05, gain: 0.22, at, out });
}

// Nombres con varias canciones: cada vez suena una distinta.
const VARIANTS = { carrera: ['carrera_galope', 'carrera_circo', 'carrera_fiesta'] };
const lastVariant = {};

function pickTune(name) {
  const list = VARIANTS[name];
  if (!list) return name;
  const options = list.filter((v) => v !== lastVariant[name]);
  lastVariant[name] = options[Math.floor(Math.random() * options.length)];
  return lastVariant[name];
}

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
    if (tune.drums) drum(tune.drums[step % tune.drums.length], nextTime);
    nextTime += stepDur;
    step++;
  }
}

export const music = {
  play(name) {
    music.stop();
    name = pickTune(name);
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
// Una frase nueva no corta la que se está diciendo: espera a que acabe. Si llegan
// muchas seguidas (toques rápidos) solo se guarda la última, y se olvida si tiene
// que esperar demasiado.
const SAY_MAX_WAIT_MS = 5000;
let pendingSay = null;
let sayTimer = 0;

export function say(text) {
  if (!voiceOn || !spanishVoice || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  if (!synth.speaking) {
    speakNow(text);
    return;
  }
  pendingSay = { text, at: Date.now() };
  if (sayTimer) return;
  sayTimer = setInterval(() => {
    if (synth.speaking) return;
    clearInterval(sayTimer);
    sayTimer = 0;
    const next = pendingSay;
    pendingSay = null;
    if (next && voiceOn && !paused && Date.now() - next.at < SAY_MAX_WAIT_MS) speakNow(next.text);
  }, 120);
}

function speakNow(text) {
  const synth = window.speechSynthesis;
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
  pendingSay = null;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function resumeAudio() {
  paused = false;
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
