// Fuegos: el cielo de noche. Al tocar en cualquier sitio sube un cohete y estalla
// en formas de un color (estrellas, corazones…), y Bubu dice el color. Vale tocar
// con varios dedos. 10 fuegos = fin.
(function () {
  var S = window.BabyShapes;
  var sky = document.getElementById('sky');
  var ask = document.getElementById('ask');
  var GOAL = 10;
  var fired = 0;
  var playing = false;
  var progress;
  var lastSay = 0;

  function vmin() { return Math.min(innerWidth, innerHeight) / 100; }

  function launch(x, y) {
    var color = S.random(S.colors);
    var rocket = document.createElement('div');
    rocket.className = 'rocket';
    rocket.style.setProperty('--c', color.hex);
    rocket.style.left = x + 'px';
    rocket.style.top = innerHeight + 'px';
    document.body.appendChild(rocket);
    void rocket.offsetWidth;
    rocket.style.top = y + 'px';
    BabyGames.sound('whoosh');
    setTimeout(function () {
      rocket.remove();
      burst(x, y, color);
    }, 560);
  }

  function burst(x, y, color) {
    var shape = S.random(S.shapes);
    var n = 14;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
      var d = (14 + Math.random() * 12) * vmin();
      var s = document.createElement('div');
      s.className = 'spark';
      s.innerHTML = S.svg(shape, color.hex, '#fff');
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--s', (6 + Math.random() * 3) * vmin() + 'px');
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      s.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg');
      document.body.appendChild(s);
      setTimeout(s.remove.bind(s), 1400);
    }
    BabyGames.sound('pop', fired);
    // Con muchos toques seguidos, Bubu no habla en cada fuego.
    var now = Date.now();
    if (now - lastSay > 1300) {
      lastSay = now;
      BabyGames.say(S.cap(color.name));
    }
  }

  sky.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (!playing) return;
    // El cohete no estalla demasiado abajo, para que se vea subir.
    launch(e.clientX, Math.min(e.clientY, innerHeight * 0.8));
    progress.fill(fired);
    fired++;
    if (fired === GOAL) {
      playing = false;
      setTimeout(function () { BabyGames.sound('cheer'); }, 700);
      setTimeout(function () {
        BabyGames.endScreen({ emoji: '🎆', title: '¡Qué fuegos tan bonitos!', say: '¡Muy bien! ¡Qué fiesta de colores!', onRestart: start });
      }, 2000);
    }
  });

  function start() {
    fired = 0;
    progress = S.dots(document.getElementById('dots'), GOAL);
    playing = true;
    ask.innerHTML = '<span class="bubble">¡Toca el cielo! 🎆</span>';
    BabyGames.say('¡Toca el cielo para lanzar fuegos artificiales!');
  }

  BabyGames.music('pompas');
  start();
})();
