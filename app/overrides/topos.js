// Topos 100 % táctil:
// - Empieza solo, tras una cuenta atrás (el botón START está oculto).
// - Al tocar un topo desaparece al momento, suena y suma un punto.
// - Un reloj cuenta hacia atrás los 30 s; al acabar se anuncia el resultado con
//   un botón para volver a jugar.
// El tablero (600x400 px) se escala para ocupar la pantalla.
(function () {
  var DESIGN_WIDTH = 640;

  function fit() {
    document.body.style.zoom = '';
    var h = document.body.scrollHeight + 60;
    var zoom = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / h);
    document.body.style.zoom = Math.max(0.5, zoom);
  }
  fit();
  window.addEventListener('resize', fit);

  var startBtn = document.getElementById('btnStart');
  if (!startBtn || typeof WhackAMole === 'undefined') return;

  // El juego llama a this.startGame/bonk/renderBestScores en el momento del
  // evento, así que basta con cambiar el prototipo (init ya se ha ejecutado).
  var game = null;
  var playing = false;
  var proto = WhackAMole.prototype;

  // Reloj de cuenta atrás junto al marcador; los últimos segundos, en rojo.
  var GAME_SECONDS = 30;
  var clock = document.createElement('span');
  clock.className = 'bg-clock';
  clock.textContent = '⏱️ ' + GAME_SECONDS;
  var title = document.querySelector('.title');
  if (title) title.appendChild(clock);
  fit();
  var clockTimer = 0;

  function runClock() {
    var end = Date.now() + GAME_SECONDS * 1000;
    var shown = GAME_SECONDS;
    clearInterval(clockTimer);
    clock.classList.remove('hurry');
    clock.textContent = '⏱️ ' + shown;
    clockTimer = setInterval(function () {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      if (left === shown) return;
      shown = left;
      clock.textContent = '⏱️ ' + left;
      if (left <= 5) {
        clock.classList.add('hurry');
        if (left > 0) BabyGames.sound('tick');
      }
      if (left === 0) clearInterval(clockTimer);
    }, 200);
  }

  var startGame = proto.startGame;
  proto.startGame = function (e) {
    game = this;
    playing = true;
    startGame.call(this, e);
    runClock();
  };

  // El original quitaba "up" al topo en vez de a su agujero (y no se escondía).
  proto.bonk = function () {};

  var renderBestScores = proto.renderBestScores;
  proto.renderBestScores = function () {
    renderBestScores.call(this);
    if (playing && this.timeUp) {
      playing = false;
      finish(this.score);
    }
  };

  function whack(e) {
    var hole = e.currentTarget.parentNode;
    if (!playing || !game || game.timeUp || !hole.classList.contains('up')) return;
    e.preventDefault();
    hole.classList.remove('up');
    hole.classList.remove('bonked');
    void hole.offsetWidth; // reinicia la animación
    hole.classList.add('bonked');
    game.score++;
    game.scoreBoard.textContent = game.score;
    BabyGames.sound('bonk');
  }

  document.querySelectorAll('.mole').forEach(function (mole) {
    mole.addEventListener('pointerdown', whack);
  });

  function finish(score) {
    BabyGames.endScreen({
      emoji: '🐹',
      title: '¡Se acabó!',
      detail: '⭐ ' + score,
      say: score === 1 ? '¡Se acabó! ¡Has atrapado un topo!' : '¡Se acabó! ¡Has atrapado ' + score + ' topos!',
      onRestart: start,
    });
  }

  function start() {
    BabyGames.countdown(function () { startBtn.click(); });
  }

  // Un momento para que desaparezca la pantalla de carga de BabyGames.
  setTimeout(start, 700);
})();
