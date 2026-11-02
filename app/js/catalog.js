// Los 29 juegos del menú (el Rincón de mayores puede ocultar algunos). `entry` es relativo a app/. Los ajustes propios de
// cada juego están en app/overrides/<id>.css y .js (los enlaza fetch-games.ps1).
// `home: 'right'` pone el botón de la casita a la derecha si a la izquierda estorba.
export const GAMES = [
  // Juegos propios de BabyGames (no se descargan: viven en app/games/<id>/ y
  // comparten los dibujos de app/shared/animals.js).
  // Los quince primeros, pensados para los más pequeños (unos 2 años): un toque,
  // una reacción, sin fallos ni prisas. Los diez últimos de ellos son de colores y
  // formas (comparten app/shared/shapes.js).
  {
    id: 'pompas', name: 'Pompas', emoji: '🧼', say: '¡Pompas de jabón! Explótalas.',
    colors: ['#b3e5fc', '#4fc3f7'], entry: 'games/pompas/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'cucu', name: 'Cucú', emoji: '🙈', say: '¡Cucú! ¿Quién se esconde?',
    colors: ['#c8e6c9', '#43a047'], entry: 'games/cucu/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'formas', name: 'Formas', emoji: '🔷', say: '¡Formas! Pon cada una en su casita.',
    colors: ['#90caf9', '#1e88e5'], entry: 'games/formas/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'bano', name: 'Baño', emoji: '🛁', say: '¡A bañar a los animales!',
    colors: ['#80deea', '#00acc1'], entry: 'games/bano/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'vehiculos', name: 'Vehículos', emoji: '🚗', say: '¡Coches, trenes y aviones!',
    colors: ['#fff176', '#fbc02d'], entry: 'games/vehiculos/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'quecolor', name: '¿Qué color?', emoji: '🔴', say: '¿Qué color? ¡Busca el color!',
    colors: ['#ffcdd2', '#e53935'], entry: 'games/quecolor/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'queforma', name: '¿Qué forma?', emoji: '🔺', say: '¿Qué forma? ¡Busca la forma!',
    colors: ['#bbdefb', '#1976d2'], entry: 'games/queforma/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'iguales', name: 'Iguales', emoji: '🧦', say: '¡Busca las parejas iguales!',
    colors: ['#e1bee7', '#8e24aa'], entry: 'games/iguales/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'tamanos', name: 'Tamaños', emoji: '🪆', say: '¡Grande y pequeño!',
    colors: ['#c8e6c9', '#388e3c'], entry: 'games/tamanos/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'cubos', name: 'Cubos', emoji: '🪣', say: '¡Cada pelota a su cubo!',
    colors: ['#b2ebf2', '#0097a7'], entry: 'games/cubos/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'mezclar', name: 'Mezclar', emoji: '🧪', say: '¡A mezclar colores!',
    colors: ['#ffe0b2', '#f57c00'], entry: 'games/mezclar/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'luces', name: 'Luces', emoji: '💡', say: '¡Enciende las luces de colores!',
    colors: ['#90a4ae', '#37474f'], entry: 'games/luces/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'fuegos', name: 'Fuegos', emoji: '🎆', say: '¡Fuegos artificiales de colores!',
    colors: ['#9fa8da', '#283593'], entry: 'games/fuegos/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'collar', name: 'Collar', emoji: '📿', say: '¡Haz un collar de colores!',
    colors: ['#f8bbd0', '#d81b60'], entry: 'games/collar/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'magia', name: 'Magia', emoji: '✨', say: '¡Magia de colores y formas!',
    colors: ['#d1c4e9', '#5e35b1'], entry: 'games/magia/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'rompecabezas', name: 'Rompecabezas', emoji: '🦁', say: '¡Rompecabezas de animales!',
    colors: ['#ffcc80', '#ef6c00'], entry: 'games/rompecabezas/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'colorear', name: 'Colorear', emoji: '🖍️', say: '¡A colorear animales!',
    colors: ['#ea80fc', '#aa00ff'], entry: 'games/colorear/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'granja', name: 'Granja', emoji: '🐮', say: '¡La granja! ¿Dónde están los animales?',
    colors: ['#a5d6a7', '#2e7d32'], entry: 'games/granja/index.html',
    author: 'BabyGames', repo: null,
  },
  {
    id: 'carrera', name: 'Carrera', emoji: '🏁', say: '¡Una carrera de animales!',
    colors: ['#ffab91', '#e53935'], entry: 'games/carrera/index.html',
    author: 'BabyGames', repo: null,
  },
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

// Los juegos del menú, sin los que se han ocultado en el Rincón de mayores.
export const visibleGames = (hidden = []) => GAMES.filter((g) => !hidden.includes(g.id));
