// Mezclar: tres botes de pintura (rojo, amarillo y azul). Al tocar uno, cae su
// pintura en el cuenco; al tocar un segundo, los colores se mezclan y sale otro:
// rojo y amarillo hacen naranja, azul y amarillo verde, rojo y azul morado. Con el
// mismo color dos veces sale "¡Más rojo!". 4 mezclas = fin.
(function () {
  var A = window.BabyAnimals;
  var S = window.BabyShapes;
  var potsEl = document.getElementById('pots');
  var bowl = document.getElementById('bowl');
  var ask = document.getElementById('ask');
  var ROUNDS = 4;
  var BASE = ['rojo', 'amarillo', 'azul'].map(function (id) { return S.byId(S.colors, id); });
  var MIX = { 'amarillo+rojo': 'naranja', 'amarillo+azul': 'verde', 'azul+rojo': 'morado' };
  var paint;
  var first = null;
  var busy = false;
  var mixes = 0;
  var progress;

  function potSVG(color) {
    return '<svg viewBox="0 0 100 110" aria-hidden="true">' +
      '<path d="M14 30 H86 V96 Q86 106 76 106 H24 Q14 106 14 96 Z" fill="#fafafa" stroke="' + A.ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M14 50 H86 V96 Q86 106 76 106 H24 Q14 106 14 96 Z" fill="' + color.hex + '" stroke="' + A.ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<rect x="8" y="20" width="84" height="14" rx="5" fill="' + color.hex + '" stroke="' + A.ink + '" stroke-width="4"/>' +
      '<path d="M20 20 Q24 4 34 20" fill="' + color.hex + '" stroke="' + A.ink + '" stroke-width="3"/>' +
      '</svg>';
  }

  function build() {
    potsEl.innerHTML = '';
    BASE.forEach(function (color) {
      var el = document.createElement('div');
      el.className = 'pot';
      el.innerHTML = potSVG(color);
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        pour(color, el);
      });
      potsEl.appendChild(el);
    });
    bowl.innerHTML = '<div class="paint"></div>';
    paint = bowl.firstChild;
  }

  function pour(color, pot) {
    if (busy) return;
    busy = true;
    pot.classList.add('pour');
    BabyGames.sound('paint');
    // Gota del bote al cuenco.
    var p = S.center(pot);
    var b = S.center(bowl);
    var drop = document.createElement('div');
    drop.className = 'drop';
    drop.style.background = color.hex;
    drop.style.left = p.x + 'px';
    drop.style.top = p.y + 'px';
    document.body.appendChild(drop);
    void drop.offsetWidth;
    drop.style.left = b.x + 'px';
    drop.style.top = b.y + 'px';
    setTimeout(function () {
      drop.remove();
      pot.classList.remove('pour');
      if (!first) {
        first = color;
        paint.style.setProperty('--paint', color.hex);
        paint.className = 'paint half';
        BabyGames.say(S.cap(color.name) + '. ¿Y ahora?');
        ask.innerHTML = '<span class="bubble"><span class="swatch" style="background:' + color.hex + '"></span> + ?</span>';
        busy = false;
        return;
      }
      mix(first, color);
    }, 550);
  }

  function mix(a, b) {
    var key = [a.id, b.id].sort().join('+');
    var result = a === b ? a : S.byId(S.colors, MIX[key]);
    paint.style.setProperty('--a', a.hex);
    paint.style.setProperty('--b', b.hex);
    paint.className = 'paint full swirl';
    BabyGames.sound('swap');
    setTimeout(function () {
      paint.style.setProperty('--paint', result.hex);
      paint.className = 'paint full';
      BabyGames.sound('star');
      var c = S.center(bowl);
      A.sparkle(c.x, c.y - c.h / 2, 18);
      if (a === b) {
        BabyGames.say('¡Más ' + a.name + '!');
      } else {
        BabyGames.say('¡' + S.cap(a.name) + ' y ' + b.name + ' hacen ' + result.name + '!');
      }
      ask.innerHTML = '<span class="bubble"><span class="swatch" style="background:' + a.hex + '"></span> + ' +
        '<span class="swatch" style="background:' + b.hex + '"></span> = <span class="swatch" style="background:' + result.hex + '"></span></span>';
      progress.fill(mixes);
      mixes++;
    }, 900);
    setTimeout(function () {
      if (mixes === ROUNDS) {
        BabyGames.endScreen({ emoji: '🧪', title: '¡Qué colores!', say: '¡Muy bien! ¡Eres un artista de los colores!', onRestart: start });
        return;
      }
      empty();
    }, 3000);
  }

  function empty() {
    first = null;
    paint.className = 'paint';
    ask.innerHTML = '<span class="bubble">¡Toca dos botes!</span>';
    busy = false;
  }

  function start() {
    mixes = 0;
    progress = S.dots(document.getElementById('dots'), ROUNDS);
    build();
    empty();
    BabyGames.say('¡Toca dos botes de pintura y mira qué color sale!');
  }

  BabyGames.music('colores');
  start();
})();
