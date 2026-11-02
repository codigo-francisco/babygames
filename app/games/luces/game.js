// Luces: seis formas apagadas en una habitación a oscuras. Al tocar una se
// enciende con su color y una nota musical, y Bubu dice el color. Tocar una ya
// encendida vuelve a sonar. Con las seis encendidas = fin.
(function () {
  var S = window.BabyShapes;
  var lightsEl = document.getElementById('lights');
  var ask = document.getElementById('ask');
  var OFF = '#546e7a';
  var lights = [];
  var lit = 0;
  var progress;

  function build() {
    lightsEl.innerHTML = '';
    var colors = S.pick(S.colors, 6);
    lights = colors.map(function (color, i) {
      var shape = S.shapes[i % S.shapes.length];
      var el = document.createElement('div');
      el.className = 'light';
      el.style.setProperty('--glow', color.hex);
      el.innerHTML = S.svg(shape, OFF, '#90a4ae');
      var light = { el: el, shape: shape, color: color, on: false, note: i };
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        tap(light);
      });
      lightsEl.appendChild(el);
      return light;
    });
    window.BabyAnimals.shuffle(lights).forEach(function (l) { lightsEl.appendChild(l.el); });
  }

  function tap(light) {
    BabyGames.sound('pop', light.note);
    S.animate(light.el, 'wiggle');
    if (light.on) return;
    light.on = true;
    light.el.classList.add('on');
    light.el.innerHTML = S.svg(light.shape, light.color.hex);
    BabyGames.say(S.cap(light.color.name));
    progress.fill(lit);
    lit++;
    if (lit === lights.length) {
      ask.innerHTML = '<span class="bubble">¡Todo encendido! 💡</span>';
      setTimeout(function () { BabyGames.sound('star'); }, 400);
      setTimeout(function () {
        BabyGames.endScreen({ emoji: '💡', title: '¡Todas encendidas!', say: '¡Muy bien! ¡Has encendido todas las luces!', onRestart: start });
      }, 1500);
    }
  }

  function start() {
    lit = 0;
    progress = S.dots(document.getElementById('dots'), 6);
    build();
    ask.innerHTML = '<span class="bubble">¡Enciende las luces!</span>';
    BabyGames.say('¡Está muy oscuro! ¡Toca las formas para encender las luces!');
  }

  BabyGames.music('calma');
  start();
})();
