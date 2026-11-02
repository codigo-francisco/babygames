// Cubos: tres cubos de colores y una pelota. Se arrastra la pelota al cubo de su
// mismo color (basta con acercarla). Si se suelta en otro cubo, vuelve y Bubu dice
// de qué color es ese cubo. Tocar la pelota dice su color y hace brillar su cubo.
// 6 pelotas guardadas = fin.
(function () {
  var A = window.BabyAnimals;
  var S = window.BabyShapes;
  var spot = document.getElementById('spot');
  var bucketsEl = document.getElementById('buckets');
  var ask = document.getElementById('ask');
  var ROUNDS = 6;
  var circle = S.byId(S.shapes, 'circulo');
  var buckets = [];
  var progress;
  var stored = 0;
  var last = null;

  function bucketSVG(color) {
    return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
      '<path d="M22 30 Q60 -14 98 30" fill="none" stroke="' + A.ink + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M10 30 H110 L98 104 H22 Z" fill="' + color.hex + '" stroke="' + A.ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<rect x="6" y="24" width="108" height="14" rx="7" fill="' + color.hex + '" stroke="' + A.ink + '" stroke-width="4"/>' +
      '<path d="M30 50 L36 92" stroke="rgba(255,255,255,0.45)" stroke-width="8" stroke-linecap="round"/>' +
      '</svg><div class="pile"></div>';
  }

  function build() {
    bucketsEl.innerHTML = '';
    buckets = S.pick(S.colors, 3).map(function (color) {
      var el = document.createElement('div');
      el.className = 'bucket';
      el.innerHTML = bucketSVG(color);
      bucketsEl.appendChild(el);
      return { el: el, color: color, count: 0 };
    });
  }

  function hint(el, cls) {
    el.classList.remove('hint', 'wiggle');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function newBall() {
    // Sale el color del cubo con menos pelotas (sin repetir el anterior), así se usan los tres.
    var options = buckets.filter(function (b) { return b.color !== last; });
    var fewest = Math.min.apply(null, options.map(function (b) { return b.count; }));
    var color = S.random(options.filter(function (b) { return b.count === fewest; })).color;
    last = color;
    spot.innerHTML = '';
    var ball = document.createElement('div');
    ball.className = 'ball';
    ball.innerHTML = S.svg(circle, color.hex);
    spot.appendChild(ball);
    ask.innerHTML = '<span class="bubble">¡Al cubo <span class="swatch" style="background:' + color.hex + '"></span> ' + color.name + '!</span>';
    BabyGames.say('¡La pelota ' + color.name + '! ¿A qué cubo va?');

    S.draggable(ball, {
      onTap: function () {
        BabyGames.say(S.cap(color.name));
        hint(bucketOf(color).el, 'hint');
      },
      onDrop: function () {
        var c = S.center(ball);
        // Cubo más cercano, con un imán generoso (hasta un cubo de distancia).
        var best = null;
        var bestDist = Infinity;
        buckets.forEach(function (b) {
          var r = S.center(b.el);
          var d = Math.hypot(r.x - c.x, r.y - c.y);
          if (d < bestDist) { best = b; bestDist = d; }
        });
        if (!best || bestDist > best.el.getBoundingClientRect().width * 1.1) return false;
        if (best.color !== color) {
          BabyGames.sound('boing');
          hint(best.el, 'wiggle');
          BabyGames.say('Ese cubo es ' + best.color.name);
          return false;
        }
        store(best, ball, c);
        return true;
      },
    });
  }

  function bucketOf(color) {
    return buckets.filter(function (b) { return b.color === color; })[0];
  }

  function store(bucket, ball, c) {
    ball.remove();
    bucket.count++;
    var pile = bucket.el.querySelector('.pile');
    var mini = document.createElement('span');
    mini.innerHTML = S.svg(circle, bucket.color.hex);
    pile.appendChild(mini);
    BabyGames.sound('snap');
    A.sparkle(c.x, c.y, 14);
    BabyGames.say('¡Muy bien! ¡' + S.cap(bucket.color.name) + '!');
    progress.fill(stored);
    stored++;
    if (stored === ROUNDS) {
      setTimeout(function () { BabyGames.sound('star'); }, 300);
      setTimeout(function () {
        BabyGames.endScreen({ emoji: '🪣', title: '¡Todo recogido!', say: '¡Muy bien! ¡Has guardado todas las pelotas!', onRestart: start });
      }, 1400);
      return;
    }
    setTimeout(newBall, 1200);
  }

  function start() {
    stored = 0;
    last = null;
    progress = S.dots(document.getElementById('dots'), ROUNDS);
    build();
    newBall();
  }

  BabyGames.music('vehiculos');
  start();
})();
