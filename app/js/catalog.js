// Los 10 juegos del menú. `entry` es relativo a app/. Los ajustes propios de
// cada juego están en app/overrides/<id>.css y .js (los enlaza fetch-games.ps1).
// `home: 'right'` pone el botón de la casita a la derecha si a la izquierda estorba.
export const GAMES = [
  {
    id: 'memoria', name: 'Memoria', emoji: '🃏', say: '¡Memoria! Busca las parejas.',
    colors: ['#ff8a80', '#ff5277'], entry: 'games/memoria/index.html',
    author: 'Bence A. Tóth', repo: 'bence-toth/daniel-memory-game',
  },
  {
    id: 'pintar', name: 'Pintar', emoji: '🎨', say: '¡A pintar!',
    colors: ['#ffd54f', '#ff9f1c'], entry: 'games/pintar/index.html',
    author: 'Vikrum Nijjar', repo: 'vikrum/kiddopaint',
  },
  {
    id: 'piano', name: 'Piano', emoji: '🎹', say: '¡El piano! Toca las teclas.',
    colors: ['#b388ff', '#7c4dff'], entry: 'games/piano/index.html',
    author: 'eagnespuerto', repo: 'eagnespuerto/librepiano',
  },
  {
    id: 'topos', name: 'Topos', emoji: '🐹', say: '¡Atrapa a los topos!',
    colors: ['#a1887f', '#6d4c41'], entry: 'games/topos/index.html',
    author: 'Jivko Jelev', repo: 'JivkoJelev91/Whack-A-Mole',
  },
  {
    id: 'torre', name: 'Torre', emoji: '🏢', say: '¡Construye una torre muy alta!',
    colors: ['#ff8a65', '#f4511e'], entry: 'games/torre/index.html',
    author: 'BMQB, Inc. (iamkun)', repo: 'iamkun/tower_game',
  },
  {
    id: 'bloques', name: 'Bloques', emoji: '🧱', say: '¡Bloques de colores!',
    colors: ['#80d8ff', '#2979ff'], entry: 'games/bloques/index.html',
    author: 'Tiny Tetris Land Contributors', repo: 'kidseek/tiny-tetris-land',
  },
  {
    id: 'puzle', name: 'Puzle', emoji: '🧩', say: '¡Un puzle! Pon cada pieza en su sitio.',
    colors: ['#69f0ae', '#00b86b'], entry: 'games/puzle/index.html',
    author: 'PlayJigsaw.net', repo: 'playjigsaw/play-jigsaw-puzzles-online',
  },
  {
    id: 'burbujas', name: 'Burbujas', emoji: '🫧', say: '¡Burbujas! Junta tres del mismo color.',
    colors: ['#84ffff', '#00b8d4'], entry: 'games/burbujas/bubble-shooter.html',
    author: 'Rembound.com', repo: 'rembound/Bubble-Shooter-HTML5',
  },
  {
    id: 'colores', name: 'Colores', emoji: '🌈', say: '¡Colores! Junta tres iguales.',
    colors: ['#f48fb1', '#d81b60'], entry: 'games/colores/match3.html',
    author: 'Rembound.com', repo: 'rembound/Match-3-Game-HTML5',
  },
  {
    id: 'dino', name: 'Dino', emoji: '🦖', say: '¡El dinosaurio! Toca para saltar.',
    colors: ['#c5e1a5', '#7cb342'], entry: 'games/dino/index.html',
    author: 'The Chromium Authors, wayou', repo: 'wayou/t-rex-runner',
  },
];

export const gameById = (id) => GAMES.find((g) => g.id === id);
