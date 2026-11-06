// Colores y formas para los juegos de colores y formas de BabyGames (¿Qué color?,
// ¿Qué forma?, Iguales, Tamaños, Cubos, Mezclar, Luces, Fuegos, Collar, Magia y
// Formas). Se carga después de animals.js, del que usa shuffle, sparkle e ink.
(function () {
  var A = window.BabyAnimals;

  // name: como lo dice Bubu ("el rojo").
  var COLORS = [
    { id: 'rojo', name: 'rojo', hex: '#e53935' },
    { id: 'azul', name: 'azul', hex: '#1e88e5' },
    { id: 'amarillo', name: 'amarillo', hex: '#fdd835' },
    { id: 'verde', name: 'verde', hex: '#43a047' },
    { id: 'naranja', name: 'naranja', hex: '#fb8c00' },
    { id: 'morado', name: 'morado', hex: '#8e24aa' },
    { id: 'rosa', name: 'rosa', hex: '#f06292' },
  ];

  // Contornos en un lienzo de 100x100. `color` es el de cada pieza en Formas.
  var SHAPES = [
    { id: 'circulo', name: 'el círculo', color: '#ef5350', d: 'M50 6 A44 44 0 1 1 49.9 6 Z' },
    { id: 'cuadrado', name: 'el cuadrado', color: '#42a5f5', d: 'M10 10 H90 V90 H10 Z' },
    { id: 'triangulo', name: 'el triángulo', color: '#66bb6a', d: 'M50 6 L95 90 H5 Z' },
    { id: 'estrella', name: 'la estrella', color: '#ffca28', d: 'M50 4 L62 37 L97 37 L69 58 L79 93 L50 72 L21 93 L31 58 L3 37 L38 37 Z' },
    { id: 'corazon', name: 'el corazón', color: '#ec407a', d: 'M50 92 C10 64 2 42 8 26 C16 6 42 6 50 26 C58 6 84 6 92 26 C98 42 90 64 50 92 Z' },
  ];

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  // SVG de una forma rellena de un color (con margen para el borde).
  function svg(shape, fill, stroke) {
    return '<svg class="bg-shape" viewBox="-5 -5 110 110" aria-hidden="true"><path d="' + shape.d + '" fill="' + fill +
      '" stroke="' + (stroke || A.ink) + '" stroke-width="4" stroke-linejoin="round"/></svg>';
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function random(list) { return list[Math.floor(Math.random() * list.length)]; }

  // n elementos al azar de la lista, sin los de `not`.
  function pick(list, n, not) {
    not = not || [];
    return A.shuffle(list.filter(function (x) { return not.indexOf(x) < 0; })).slice(0, n);
  }

  // Uno al azar distinto de `not` (para no repetir la pregunta anterior).
  function other(list, not) {
    return pick(list, 1, not ? [not] : [])[0];
  }

  // Marcador de bolitas: una por paso de la partida.
  function dots(el, n) {
    el.innerHTML = '';
    for (var i = 0; i < n; i++) el.appendChild(document.createElement('span'));
    return { fill: function (i) { if (el.children[i]) el.children[i].classList.add('on'); } };
  }

  function animate(el, cls) {
    el.classList.remove('hop', 'wiggle');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  // Juego de "toca el que es": cada ronda trae una pregunta y unas opciones grandes.
  // Tocar la buena la celebra y pasa a la siguiente; tocar otra solo la menea y
  // Bubu dice lo que es (sin castigo). Al acabar las rondas, "¡Otra vez!".
  //   opts: { board, ask, dots, rounds, music, end: { emoji, title, say },
  //           round(n) -> { ask: html, say, options: [{ html, right, say, style }], onRight(el) } }
  function quiz(opts) {
    var progress;
    var done = 0;
    var busy = true;
    var current = null;
    var rightEl = null;
    var misses = 0;
    var idle = null;

    // Ayuda para quien aún no entiende la pregunta: la buena late sola.
    function hint() {
      if (!rightEl) return;
      rightEl.classList.remove('hint');
      void rightEl.offsetWidth;
      rightEl.classList.add('hint');
    }

    // Si pasa un rato sin tocar, Bubu repite la pregunta y señala la buena.
    function wait() {
      clearTimeout(idle);
      idle = setTimeout(function () {
        if (busy) return;
        if (current && current.say) BabyGames.say(current.say);
        hint();
        wait();
      }, 7000);
    }

    function next() {
      var r = opts.round(done);
      current = r;
      misses = 0;
      opts.ask.innerHTML = r.ask;
      opts.board.innerHTML = '';
      r.options.forEach(function (o) {
        var el = document.createElement('div');
        el.className = 'choice';
        el.innerHTML = o.html;
        if (o.style) el.setAttribute('style', o.style);
        if (o.right) rightEl = el;
        el.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          tap(r, o, el, e);
        });
        opts.board.appendChild(el);
      });
      if (r.say) BabyGames.say(r.say);
      busy = false;
      wait();
    }

    // Tocar la pregunta la repite.
    opts.ask.style.pointerEvents = 'auto';
    opts.ask.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (busy || !current) return;
      if (current.say) BabyGames.say(current.say);
      hint();
      wait();
    });

    function tap(r, o, el, e) {
      if (busy) return;
      if (!o.right) {
        animate(el, 'wiggle');
        BabyGames.sound('boing');
        if (o.say) BabyGames.say(o.say);
        // Sin castigo: la equivocada se apaga para que queden menos opciones,
        // y tras el segundo fallo la buena se señala sola.
        el.classList.add('off');
        misses++;
        if (misses >= 2) setTimeout(hint, 1200);
        wait();
        return;
      }
      clearTimeout(idle);
      busy = true;
      animate(el, 'hop');
      el.classList.add('right');
      BabyGames.sound('star');
      A.sparkle(e.clientX, e.clientY, 16);
      BabyGames.say(r.praise || '¡Muy bien!');
      if (r.onRight) r.onRight(el);
      progress.fill(done);
      done++;
      setTimeout(function () {
        if (done < opts.rounds) return next();
        BabyGames.endScreen({ emoji: opts.end.emoji, title: opts.end.title, say: opts.end.say, onRestart: start });
      }, 1900);
    }

    function start() {
      done = 0;
      progress = dots(opts.dots, opts.rounds);
      next();
    }

    if (opts.music) BabyGames.music(opts.music);
    start();
  }

  // Arrastrar con el dedo. Al soltar, onDrop(e) decide: true = se queda (el juego
  // la recoloca), false = vuelve a su sitio con un rebote. Un toque sin arrastrar
  // llama a onTap(e).
  function draggable(el, opts) {
    var id = null;
    var sx = 0;
    var sy = 0;
    var dx = 0;
    var dy = 0;
    var moved = false;

    function move(x, y) {
      dx = x;
      dy = y;
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }

    el.addEventListener('pointerdown', function (e) {
      if (id !== null) return;
      e.preventDefault();
      id = e.pointerId;
      try { el.setPointerCapture(id); } catch (err) { /* sin captura */ }
      sx = e.clientX - dx;
      sy = e.clientY - dy;
      moved = false;
      el.classList.remove('back');
      el.classList.add('drag');
      BabyGames.sound('tap');
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var x = e.clientX - sx;
      var y = e.clientY - sy;
      if (Math.abs(x) + Math.abs(y) > 12) moved = true;
      move(x, y);
    });
    function up(e) {
      if (e.pointerId !== id) return;
      id = null;
      el.classList.remove('drag');
      if (moved && opts.onDrop && opts.onDrop(e)) return;
      if (!moved && opts.onTap) opts.onTap(e);
      el.classList.add('back');
      move(0, 0);
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  window.BabyShapes = {
    colors: COLORS,
    shapes: SHAPES,
    byId: byId,
    svg: svg,
    cap: cap,
    random: random,
    pick: pick,
    other: other,
    dots: dots,
    animate: animate,
    center: center,
    quiz: quiz,
    draggable: draggable,
  };
})();
