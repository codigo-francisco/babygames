// Formas: tres huecos en el tablero y tres piezas en la bandeja. Se arrastra
// cada pieza con el dedo hasta su hueco; basta con acercarla (se imanta). Si se
// suelta lejos, vuelve sola a la bandeja. Tocar una pieza sin arrastrarla dice
// su nombre y hace brillar su hueco. Con las tres colocadas, fin de partida.
(function () {
  var A = window.BabyAnimals;
  var board = document.getElementById('board');
  var tray = document.getElementById('tray');
  var SHAPES = window.BabyShapes.shapes;
  var pieces = [];
  var placed = 0;

  function svg(shape, fill, stroke) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="' + shape.d + '" fill="' + fill +
      '" stroke="' + stroke + '" stroke-width="4" stroke-linejoin="round"/></svg>';
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
  }

  function build() {
    board.innerHTML = '';
    tray.innerHTML = '';
    pieces = [];
    placed = 0;
    var chosen = A.shuffle(SHAPES).slice(0, 3);
    chosen.forEach(function (shape) {
      var hole = document.createElement('div');
      hole.className = 'hole';
      hole.innerHTML = svg(shape, 'rgba(62, 39, 20, 0.55)', '#5d3a1a');
      board.appendChild(hole);
      shape.hole = hole;
    });
    // Las piezas, en otro orden que los huecos.
    var order = A.shuffle(chosen);
    if (order.every(function (s, i) { return s === chosen[i]; })) order.push(order.shift());
    order.forEach(function (shape) {
      var el = document.createElement('div');
      el.className = 'piece';
      el.innerHTML = svg(shape, shape.color, A.ink);
      tray.appendChild(el);
      var piece = { el: el, shape: shape, done: false };
      drag(piece);
      pieces.push(piece);
    });
  }

  function move(piece, dx, dy) {
    piece.dx = dx;
    piece.dy = dy;
    piece.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  }

  function drag(piece) {
    var el = piece.el;
    var id = null;
    var sx = 0;
    var sy = 0;
    var moved = false;
    move(piece, 0, 0);

    el.addEventListener('pointerdown', function (e) {
      if (piece.done || id !== null) return;
      e.preventDefault();
      id = e.pointerId;
      try { el.setPointerCapture(id); } catch (err) { /* sin captura */ }
      sx = e.clientX - piece.dx;
      sy = e.clientY - piece.dy;
      moved = false;
      el.classList.remove('back');
      el.classList.add('drag');
      BabyGames.sound('tap');
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 12) moved = true;
      move(piece, dx, dy);
    });
    function up(e) {
      if (e.pointerId !== id) return;
      id = null;
      el.classList.remove('drag');
      if (!moved) {
        // Toque sin arrastrar: nombre de la forma y pista de su hueco.
        BabyGames.say(cap(piece.shape.name));
        hint(piece.shape.hole);
        goBack(piece);
        return;
      }
      drop(piece);
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  function hint(hole) {
    hole.classList.remove('hint');
    void hole.offsetWidth;
    hole.classList.add('hint');
  }

  function goBack(piece) {
    piece.el.classList.add('back');
    move(piece, 0, 0);
  }

  // Desplazamiento que deja la pieza justo encima de su hueco.
  function offsetToHole(piece) {
    var p = center(piece.el);
    var h = center(piece.shape.hole);
    return { x: piece.dx + h.x - p.x, y: piece.dy + h.y - p.y, dist: Math.hypot(h.x - p.x, h.y - p.y), w: h.w };
  }

  function drop(piece) {
    var o = offsetToHole(piece);
    // Imán generoso: basta con acercarla a menos de un tamaño de pieza.
    if (o.dist > o.w * 0.95) {
      BabyGames.sound('boing');
      hint(piece.shape.hole);
      goBack(piece);
      return;
    }
    piece.done = true;
    piece.el.classList.add('done');
    move(piece, o.x, o.y);
    BabyGames.sound('snap');
    var h = center(piece.shape.hole);
    setTimeout(function () { A.sparkle(h.x, h.y, 14); }, 200);
    placed++;
    if (placed === pieces.length) {
      setTimeout(function () { BabyGames.sound('star'); }, 300);
      setTimeout(finish, 1200);
    } else {
      BabyGames.say('¡' + cap(piece.shape.name) + '! ¡Muy bien!');
    }
  }

  // Si cambia el tamaño de la pantalla, las piezas colocadas siguen en su hueco.
  window.addEventListener('resize', function () {
    pieces.forEach(function (piece) {
      if (!piece.done) return move(piece, 0, 0);
      piece.el.classList.remove('done');
      move(piece, 0, 0);
      var o = offsetToHole(piece);
      move(piece, o.x, o.y);
      piece.el.classList.add('done');
    });
  });

  function finish() {
    BabyGames.endScreen({
      emoji: '🔷',
      title: '¡Todas en su sitio!',
      say: '¡Muy bien! ¡Todas las formas en su casita!',
      onRestart: start,
    });
  }

  function start() {
    build();
    BabyGames.say('¡Lleva cada forma a su casita!');
  }

  BabyGames.music('colores');
  start();
})();
