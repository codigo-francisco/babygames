import { GAMES } from './catalog.js';
import { sfx, say, music, setVolume, setVoice, setMusic, hasSpanishVoice, unlockAudio } from './sounds.js';
import { rewards } from './rewards.js';
import { createBalloons } from './balloons.js';
import { burst } from './confetti.js';
import { exitApp, toggleFullscreen } from './bridge.js';

// Segundos de juego para ganar una estrella (y la pegatina del juego).
const PLAY_SECONDS = 20;
const HOLD_HOME_MS = 500;
const HOLD_ADULT_MS = 2500;

const $ = (sel) => document.querySelector(sel);

// Los juegos (iframes del mismo origen) usan la voz, los sonidos y la música del anfitrión:
// así respetan el volumen y la voz del Rincón de mayores (ver shared/game-inject.js).
window.BabyGamesHost = { say, sfx, music };

// ---- Bubu, la mascota ------------------------------------------------------

let mascotCount = 0;
function mascotSVG() {
  const id = `bubu-${mascotCount++}`;
  return `
<svg viewBox="0 0 200 200" aria-hidden="true">
  <defs>
    <radialGradient id="${id}" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#fff59d"/><stop offset=".55" stop-color="#ffd54f"/><stop offset="1" stop-color="#ffb300"/>
    </radialGradient>
  </defs>
  <path d="M82 46 Q72 22 60 18" stroke="#f9a825" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M118 46 Q128 22 140 18" stroke="#f9a825" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="60" cy="18" r="11" fill="#ff5277"/>
  <circle cx="140" cy="18" r="11" fill="#40c4ff"/>
  <ellipse cx="30" cy="122" rx="13" ry="20" fill="#ffca28" transform="rotate(-28 30 122)"/>
  <ellipse cx="170" cy="122" rx="13" ry="20" fill="#ffca28" transform="rotate(28 170 122)"/>
  <ellipse cx="72" cy="184" rx="23" ry="12" fill="#ff9800"/>
  <ellipse cx="128" cy="184" rx="23" ry="12" fill="#ff9800"/>
  <circle cx="100" cy="112" r="74" fill="url(#${id})" stroke="#f9a825" stroke-width="4"/>
  <ellipse cx="54" cy="128" rx="14" ry="9" fill="#ff8a80" opacity=".75"/>
  <ellipse cx="146" cy="128" rx="14" ry="9" fill="#ff8a80" opacity=".75"/>
  <g class="eye"><ellipse cx="76" cy="100" rx="14" ry="18" fill="#fff"/><circle cx="79" cy="104" r="9" fill="#2b2d42"/><circle cx="82" cy="100" r="3.5" fill="#fff"/></g>
  <g class="eye"><ellipse cx="124" cy="100" rx="14" ry="18" fill="#fff"/><circle cx="127" cy="104" r="9" fill="#2b2d42"/><circle cx="130" cy="100" r="3.5" fill="#fff"/></g>
  <path d="M78 134 Q100 162 122 134 Z" fill="#ff5277" stroke="#2b2d42" stroke-width="5" stroke-linejoin="round"/>
</svg>`;
}

const PHRASES = ['¡Hola!', '¡Qué cosquillas!', '¡Jiji!', '¿Jugamos?', '¡Me encanta jugar contigo!'];

function wiggle(el) {
  el.classList.remove('giggle');
  void el.offsetWidth;
  el.classList.add('giggle');
  el.addEventListener('animationend', () => el.classList.remove('giggle'), { once: true });
}

function giggle(el) {
  wiggle(el);
  sfx.giggle();
  say(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
}

// ---- Pantallas ---------------------------------------------------------------

const screens = {
  start: $('#screen-start'),
  menu: $('#screen-menu'),
  album: $('#screen-album'),
  game: $('#screen-game'),
};
let currentScreen = 'start';

function show(name) {
  currentScreen = name;
  for (const [key, el] of Object.entries(screens)) el.classList.toggle('active', key === name);
  if (name === 'menu' && rewards.settings.balloons) balloons.start();
  else balloons.stop();
}

// ---- "Mantener pulsado" ------------------------------------------------------

function holdButton(el, ms, onDone, onTap) {
  let active = false;
  let start = 0;
  let raf = 0;
  let timer = 0;
  const setProgress = (p) => el.style.setProperty('--p', p);
  const cancel = () => {
    if (!active) return;
    active = false;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    el.classList.remove('holding');
    setProgress(0);
  };
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    active = true;
    start = performance.now();
    el.classList.add('holding');
    try { el.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    // El temporizador decide; la animación solo dibuja el anillo.
    timer = setTimeout(() => {
      cancel();
      onDone();
    }, ms);
    const step = (t) => {
      if (!active) return;
      setProgress(Math.min(1, (t - start) / ms));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
  el.addEventListener('pointerup', () => {
    if (active && onTap) onTap();
    cancel();
  });
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  // Con teclado (adultos en PC) se activa directamente.
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDone();
    }
  });
}

// ---- Inicio ----------------------------------------------------------------

function buildLogo() {
  const colors = ['#ff5277', '#ff9f1c', '#ffc233', '#00c853', '#00b8d4', '#2979ff', '#7c4dff', '#d81b60', '#ff6d00'];
  $('.logo').innerHTML = [...'BabyGames']
    .map((ch, i) => `<span style="--c:${colors[i % colors.length]};--i:${i}">${ch}</span>`)
    .join('');
}

let started = false;
function startPlaying() {
  if (started) return;
  started = true;
  unlockAudio();
  sfx.fanfare();
  say('¡Hola! ¿A qué jugamos?');
  show('menu');
}

// ---- Menú --------------------------------------------------------------------

const grid = $('#grid');
const starCount = $('#star-count');
let launching = false;

function renderGrid() {
  grid.innerHTML = '';
  GAMES.forEach((game, i) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.dataset.id = game.id;
    tile.style.setProperty('--c1', game.colors[0]);
    tile.style.setProperty('--c2', game.colors[1]);
    tile.style.setProperty('--i', i);
    tile.setAttribute('aria-label', game.name);
    tile.innerHTML = `
      <span class="tile-emoji" aria-hidden="true">${game.emoji}</span>
      <span class="tile-name">${game.name}</span>
      <span class="tile-badge" aria-hidden="true" ${rewards.hasSticker(game.id) ? '' : 'hidden'}>⭐</span>`;
    tile.addEventListener('click', () => launch(game, tile));
    grid.appendChild(tile);
  });
}

function refreshBadges() {
  grid.querySelectorAll('.tile').forEach((tile) => {
    tile.querySelector('.tile-badge').hidden = !rewards.hasSticker(tile.dataset.id);
  });
}

function updateStars(bump = false) {
  starCount.textContent = rewards.stars;
  if (bump) {
    const counter = starCount.parentElement;
    counter.classList.remove('bump');
    void counter.offsetWidth;
    counter.classList.add('bump');
  }
}

function launch(game, tile) {
  if (launching) return;
  launching = true;
  unlockAudio();
  sfx.tap();
  say(game.say);
  tile.classList.add('launch');
  setTimeout(() => sfx.whoosh(), 200);
  setTimeout(() => {
    tile.classList.remove('launch');
    launching = false;
    openGame(game);
  }, 480);
}

grid.addEventListener('keydown', (e) => {
  const tiles = [...grid.children];
  const i = tiles.indexOf(document.activeElement);
  if (i < 0) return;
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
  if (!delta) return;
  e.preventDefault();
  tiles[i + delta]?.focus();
});

const balloons = createBalloons($('#balloons'), {
  onPop({ x, y, step }) {
    sfx.pop(step);
    burst(x, y, 24);
    if (rewards.popBalloon()) {
      rewards.addStar();
      updateStars(true);
      setTimeout(() => sfx.star(), 150);
      say('¡Diez globos! ¡Una estrella!');
    }
  },
});

// ---- Juego ---------------------------------------------------------------------

const frame = $('#game-frame');
const loading = $('#game-loading');
let current = null;
let playTimer = null;
let earned = null;

function openGame(game) {
  current = game;
  earned = null;
  loading.style.setProperty('--c1', game.colors[0]);
  loading.style.setProperty('--c2', game.colors[1]);
  loading.querySelector('.loading-emoji').textContent = game.emoji;
  loading.classList.remove('done');
  screens.game.classList.toggle('home-right', game.home === 'right');
  frame.src = game.entry;
  show('game');
  playTimer = setTimeout(() => {
    earned = { newSticker: rewards.unlockSticker(game.id) };
    rewards.addStar();
  }, PLAY_SECONDS * 1000);
}

frame.addEventListener('load', () => {
  if (!current) return;
  setTimeout(() => loading.classList.add('done'), 300);
  try {
    frame.contentWindow.focus();
  } catch {
    // El juego es del mismo origen; si no, simplemente no se enfoca.
  }
});

function closeGame() {
  if (!current) return;
  clearTimeout(playTimer);
  const game = current;
  current = null;
  frame.src = 'about:blank';
  music.stop();
  sfx.back();
  refreshBadges();
  updateStars();
  show('menu');
  if (earned) {
    celebrate(game, earned.newSticker);
    earned = null;
  }
}

const homeHint = $('#home-hint');
let hintTimer = null;
holdButton($('#btn-home'), HOLD_HOME_MS, closeGame, () => {
  homeHint.classList.add('show');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => homeHint.classList.remove('show'), 1600);
});

// ---- Celebración -------------------------------------------------------------

const celebration = $('#celebration');
let celebrationTimer = null;

function celebrate(game, isNewSticker) {
  const sticker = $('#celebration-sticker');
  if (isNewSticker) {
    sticker.style.setProperty('--c1', game.colors[0]);
    sticker.style.setProperty('--c2', game.colors[1]);
    sticker.innerHTML = `<span>${game.emoji}</span>`;
    $('#celebration-text').textContent = '¡Pegatina nueva!';
    say(`¡Muy bien! ¡Tienes la pegatina de ${game.name}!`);
  } else {
    sticker.style.setProperty('--c1', '#fff59d');
    sticker.style.setProperty('--c2', '#ffb300');
    sticker.innerHTML = '<span>⭐</span>';
    $('#celebration-text').textContent = '¡Una estrella!';
    say('¡Muy bien! ¡Una estrella!');
  }
  celebration.hidden = false;
  balloons.stop();
  sfx.fanfare();
  burst(innerWidth / 2, innerHeight / 2, 160);
  updateStars(true);
  clearTimeout(celebrationTimer);
  celebrationTimer = setTimeout(endCelebration, 4000);
}

function endCelebration() {
  if (celebration.hidden) return;
  clearTimeout(celebrationTimer);
  celebration.hidden = true;
  if (currentScreen === 'menu' && rewards.settings.balloons) balloons.start();
}

celebration.addEventListener('pointerdown', endCelebration);

// ---- Álbum -------------------------------------------------------------------

function renderAlbum() {
  const album = $('#album');
  album.innerHTML = '';
  GAMES.forEach((game, i) => {
    const unlocked = rewards.hasSticker(game.id);
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'album-slot';
    slot.setAttribute('aria-label', unlocked ? `Pegatina de ${game.name}` : `${game.name}: pegatina por conseguir`);
    slot.innerHTML = `
      <span class="sticker ${unlocked ? '' : 'locked'}"
            style="--c1:${game.colors[0]};--c2:${game.colors[1]};--r:${(i % 2 ? 1 : -1) * (3 + (i % 4) * 2)}deg">
        <span>${game.emoji}</span>
      </span>
      <span class="album-name">${game.name}</span>`;
    slot.addEventListener('click', () => {
      wiggle(slot.querySelector('.sticker'));
      if (unlocked) {
        sfx.star();
        say(game.name);
      } else {
        sfx.tap();
        say(`Juega a ${game.name} para conseguirla`);
      }
    });
    album.appendChild(slot);
  });
  $('#album-count').textContent = `${rewards.stickerCount()} / ${GAMES.length}`;
}

$('#btn-album').addEventListener('click', () => {
  sfx.tap();
  renderAlbum();
  say('¡Mis pegatinas!');
  show('album');
});

$('#btn-album-back').addEventListener('click', () => {
  sfx.back();
  show('menu');
});

// ---- Rincón de mayores ---------------------------------------------------------

const panel = $('#adult-panel');
const volumeInput = $('#set-volume');
const voiceInput = $('#set-voice');
const balloonsInput = $('#set-balloons');
const musicInput = $('#set-music');

function openPanel() {
  const s = rewards.settings;
  volumeInput.value = Math.round(s.volume * 100);
  balloonsInput.checked = s.balloons;
  musicInput.checked = s.music;
  const spanish = hasSpanishVoice();
  voiceInput.checked = s.voice && spanish;
  voiceInput.disabled = !spanish;
  $('#voice-note').textContent = spanish ? '' : 'No hay ninguna voz en español instalada en Windows.';
  $('#credits').hidden = true;
  resetArmed = false;
  $('#btn-reset').textContent = '♻️ Borrar progreso';
  balloons.stop();
  panel.hidden = false;
}

function closePanel() {
  panel.hidden = true;
  if (currentScreen === 'menu' && rewards.settings.balloons) balloons.start();
}

holdButton($('#btn-adult'), HOLD_ADULT_MS, openPanel, () => sfx.tick());
$('#panel-close').addEventListener('click', closePanel);
panel.addEventListener('pointerdown', (e) => {
  if (e.target === panel) closePanel();
});

volumeInput.addEventListener('input', () => {
  const v = volumeInput.value / 100;
  setVolume(v);
  rewards.setSetting('volume', v);
});
volumeInput.addEventListener('change', () => sfx.tap());

voiceInput.addEventListener('change', () => {
  setVoice(voiceInput.checked);
  rewards.setSetting('voice', voiceInput.checked);
  if (voiceInput.checked) say('¡Hola!');
});

balloonsInput.addEventListener('change', () => {
  rewards.setSetting('balloons', balloonsInput.checked);
});

musicInput.addEventListener('change', () => {
  setMusic(musicInput.checked);
  rewards.setSetting('music', musicInput.checked);
});

$('#btn-fullscreen').addEventListener('click', toggleFullscreen);
$('#btn-exit').addEventListener('click', exitApp);

let resetArmed = false;
$('#btn-reset').addEventListener('click', (e) => {
  if (!resetArmed) {
    resetArmed = true;
    e.currentTarget.textContent = '⚠️ ¿Seguro? Pulsa otra vez';
    return;
  }
  rewards.reset();
  resetArmed = false;
  e.currentTarget.textContent = '✅ Progreso borrado';
  updateStars();
  refreshBadges();
});

$('#btn-credits').addEventListener('click', async () => {
  const box = $('#credits');
  box.hidden = !box.hidden;
  if (box.hidden || box.dataset.ready) return;
  let meta = [];
  try {
    meta = await (await fetch('games/credits.json')).json();
  } catch {
    // Sin credits.json se muestran los datos del catálogo.
  }
  const items = GAMES.map((g) => {
    const m = meta.find((x) => x.id === g.id) || {};
    return `<li><b>${g.emoji} ${g.name}</b> — ${g.author}<br>
      github.com/${g.repo} · ${m.license || ''} ${m.commit ? `<code>${m.commit.slice(0, 7)}</code>` : ''}</li>`;
  }).join('');
  box.innerHTML = `
    <h3>Juegos</h3><ul>${items}</ul>
    <h3>Otros recursos</h3>
    <ul>
      <li>Fuente Fredoka — The Fredoka Project Authors, SIL Open Font License 1.1</li>
      <li>Iconos de Memoria — game-icons.net (Delapouite, Lorc), CC BY 3.0</li>
      <li>Sonidos de BabyGames — sintetizados en el propio juego</li>
    </ul>
    <p>Las licencias completas están en la carpeta de cada juego (app/games/&lt;juego&gt;/LICENSE).</p>`;
  box.dataset.ready = '1';
});

// ---- Teclado (adultos en PC) -----------------------------------------------------

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!panel.hidden) closePanel();
    else if (!celebration.hidden) endCelebration();
    else if (currentScreen === 'game') closeGame();
    else if (currentScreen === 'album') show('menu');
    return;
  }
  if (currentScreen === 'start' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    startPlaying();
    return;
  }
  if (currentScreen === 'menu' && panel.hidden && e.key.startsWith('Arrow') && !grid.contains(document.activeElement)) {
    e.preventDefault();
    grid.firstElementChild?.focus();
  }
});

// ---- Arranque ------------------------------------------------------------------

function init() {
  setVolume(rewards.settings.volume);
  setVoice(rewards.settings.voice);
  setMusic(rewards.settings.music);
  document.querySelectorAll('[data-mascot]').forEach((el) => {
    el.innerHTML = mascotSVG();
  });
  buildLogo();
  renderGrid();
  updateStars();

  $('#btn-play').addEventListener('click', startPlaying);
  screens.start.addEventListener('click', (e) => {
    if (e.target.closest('.mascot')) giggle(e.target.closest('.mascot'));
    else startPlaying();
  });
  $('#menu-mascot').addEventListener('click', (e) => giggle(e.currentTarget));
}

init();
