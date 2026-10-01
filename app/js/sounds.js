// Efectos de sonido sintetizados con WebAudio (sin archivos) y voz en español.

let ctx = null;
let master = null;
let volume = 0.7;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = volume;
}

function tone({ freq = 440, to = null, type = 'sine', dur = 0.15, gain = 0.3, delay = 0 }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
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
};

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
