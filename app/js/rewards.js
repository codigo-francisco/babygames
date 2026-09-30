// Progreso del niño (estrellas, pegatinas, globos) y ajustes, en localStorage.
// WebView2 guarda localStorage en %LOCALAPPDATA%\BabyGames, así que persiste.

const KEY = 'babygames.v1';

const DEFAULTS = {
  stars: 0,
  balloons: 0,
  stickers: {},
  settings: { volume: 0.7, voice: true, balloons: true },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const data = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS),
      ...data,
      settings: { ...DEFAULTS.settings, ...(data.settings || {}) },
      stickers: { ...(data.stickers || {}) },
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

const state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Sin almacenamiento el juego sigue funcionando, solo no recuerda el progreso.
  }
}

export const rewards = {
  get stars() { return state.stars; },
  get balloons() { return state.balloons; },
  get settings() { return state.settings; },
  hasSticker(id) { return !!state.stickers[id]; },
  stickerCount() { return Object.keys(state.stickers).length; },

  addStar() {
    state.stars += 1;
    save();
    return state.stars;
  },

  // Devuelve true si la pegatina es nueva.
  unlockSticker(id) {
    if (state.stickers[id]) return false;
    state.stickers[id] = Date.now();
    save();
    return true;
  },

  // Cuenta un globo explotado; devuelve true cada 10 (premio).
  popBalloon() {
    state.balloons += 1;
    save();
    return state.balloons % 10 === 0;
  },

  setSetting(name, value) {
    state.settings[name] = value;
    save();
  },

  reset() {
    const settings = state.settings;
    Object.assign(state, structuredClone(DEFAULTS), { settings });
    save();
  },
};
