// Magia: al mover el dedo por la pantalla van saliendo formas de colores que
// suenan y se desvanecen (vale con varios dedos). Cada 10 formas se llena una
// bolita del marcador; con las 8 llenas = fin.
(function () {
  var S = window.BabyShapes;
  var paper = document.getElementById('paper');
  var ask = document.getElementById('ask');
  var DOTS = 8;
  var PER_DOT = 10;
  var stamps = 0;
  var playing = false;
  var progress;
  var colorIndex = 0;
  var pointers = {};
  var lastSound = 0;

  function vmin() { return Math.min(innerWidth, innerHeight) / 100; }

  function stamp(x, y) {
    var color = S.colors[colorIndex++ % S.colors.length];
    var el = document.createElement('div');
    el.className = 'stamp';
    el.innerHTML = S.svg(S.random(S.shapes), color.hex);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--s', (7 + Math.random() * 6) * vmin() + 'px');
    el.style.setProperty('--r', (Math.random() * 120 - 60) + 'deg');
    document.body.appendChild(el);
    setTimeout(el.remove.bind(el), 2500);
    var now = performance.now();
    if (now - lastSound > 90) {
      lastSound = now;
      BabyGames.sound('pop', stamps);
    }
    if (!playing) return;
    stamps++;
    if (stamps % PER_DOT === 0) progress.fill(stamps / PER_DOT - 1);
    if (stamps === DOTS * PER_DOT) finish();
  }

  paper.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { paper.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    stamp(e.clientX, e.clientY);
  });

  paper.addEventListener('pointermove', function (e) {
    var p = pointers[e.pointerId];
    if (!p) return;
    // Una forma cada poco recorrido, para que el rastro no dependa de la velocidad.
    var step = 6 * vmin();
    var dx = e.clientX - p.x;
    var dy = e.clientY - p.y;
    var d = Math.hypot(dx, dy);
    if (d < step) return;
    var n = Math.floor(d / step);
    for (var i = 1; i <= n; i++) stamp(p.x + (dx * i * step) / d, p.y + (dy * i * step) / d);
    p.x += (dx * n * step) / d;
    p.y += (dy * n * step) / d;
  });

  function lift(e) { delete pointers[e.pointerId]; }
  paper.addEventListener('pointerup', lift);
  paper.addEventListener('pointercancel', lift);

  function finish() {
    playing = false;
    pointers = {};
    BabyGames.sound('star');
    setTimeout(function () {
      BabyGames.endScreen({ emoji: '✨', title: '¡Qué magia!', say: '¡Muy bien! ¡Has hecho mucha magia!', onRestart: start });
    }, 1200);
  }

  function start() {
    stamps = 0;
    progress = S.dots(document.getElementById('dots'), DOTS);
    playing = true;
    ask.innerHTML = '<span class="bubble">¡Mueve el dedo! ✨</span>';
    BabyGames.say('¡Mueve el dedo por la pantalla y haz magia!');
  }

  BabyGames.music('burbujas');
  start();
})();
