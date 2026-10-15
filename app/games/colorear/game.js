// Colorear animales pintando con el dedo, como en Pintar: se elige un color abajo
// y se pinta encima del dibujo. Cada trazo se queda dentro de la parte donde
// empezó (no se sale de la raya) y las líneas del dibujo quedan siempre encima.
// Con todas las partes pintadas hay celebración; las flechas cambian de animal y
// cada animal guarda lo pintado mientras dura la partida.
(function () {
  var A = window.BabyAnimals;
  var NS = 'http://www.w3.org/2000/svg';
  var COLORS = ['#ff5277', '#ff9f1c', '#ffd600', '#00c853', '#00b8d4', '#2979ff', '#7c4dff', '#8d6e63', '#ffffff'];
  var BRUSH = 16; // en unidades del dibujo (200x200)
  var paper = document.getElementById('paper');
  var palette = document.getElementById('palette');
  var index = Math.floor(Math.random() * A.list.length);
  var color = COLORS[0];
  var drawings = {};   // id del animal -> <svg> con lo pintado
  var celebrated = {};
  var strokes = {};    // pointerId -> { path, points }

  COLORS.forEach(function (c, i) {
    var b = document.createElement('div');
    b.className = 'swatch' + (i === 0 ? ' on' : '');
    b.style.background = c;
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      color = c;
      palette.querySelectorAll('.swatch').forEach(function (s) { s.classList.toggle('on', s === b); });
      BabyGames.sound('tap');
    });
    palette.appendChild(b);
  });

  function current() { return A.list[index]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Capas: fondo, y por cada parte su relleno blanco + sus trazos (recortados a su
  // forma); arriba del todo, las líneas y la cara. Las partes que van delante tapan
  // los trazos de las de detrás, como en el dibujo.
  function build(animal) {
    var shape = function (p, extra) { return '<' + p[0] + ' ' + p[1] + ' ' + extra + '/>'; };
    var defs = '<clipPath id="c-' + animal.id + '-bg"><rect width="200" height="200"/></clipPath>';
    var body = '<rect data-part="bg" width="200" height="200" fill="#ffffff"/>' +
      '<g class="ink" clip-path="url(#c-' + animal.id + '-bg)"></g>';
    var lines = '';
    animal.parts.forEach(function (p, i) {
      defs += '<clipPath id="c-' + animal.id + '-' + i + '">' + shape(p, '') + '</clipPath>';
      body += shape(p, 'data-part="' + i + '" fill="#ffffff"') +
        '<g class="ink" clip-path="url(#c-' + animal.id + '-' + i + ')"></g>';
      lines += shape(p, 'fill="none" stroke="' + A.ink + '" stroke-width="4" stroke-linejoin="round"');
    });
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'bg-animal');
    svg.innerHTML = '<defs>' + defs + '</defs>' + body +
      '<g style="pointer-events:none">' + lines + animal.face() + '</g>';
    svg.querySelectorAll('.ink').forEach(function (g) { g.style.pointerEvents = 'none'; });
    return svg;
  }

  function draw() {
    var animal = current();
    var svg = drawings[animal.id] || (drawings[animal.id] = build(animal));
    paper.innerHTML = '';
    paper.appendChild(svg);
  }

  function show(step) {
    strokes = {};
    index = (index + step + A.list.length) % A.list.length;
    draw();
    BabyGames.sound('whoosh');
    BabyGames.say('¡' + cap(A.named(current())) + '! ¡A pintar!');
  }

  function toSvg(svg, e) {
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    var m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : pt;
  }

  function pathData(points) {
    var d = 'M' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
    if (points.length === 1) d += 'l0.01 0'; // un toque = un punto
    for (var i = 1; i < points.length; i++) d += 'L' + points[i].x.toFixed(1) + ' ' + points[i].y.toFixed(1);
    return d;
  }

  paper.addEventListener('pointerdown', function (e) {
    var part = e.target.closest && e.target.closest('[data-part]');
    if (!part) return;
    e.preventDefault();
    try { paper.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    var svg = part.ownerSVGElement;
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', BRUSH);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    part.nextElementSibling.appendChild(path); // su grupo de trazos
    var s = { svg: svg, path: path, points: [toSvg(svg, e)], part: part.getAttribute('data-part') };
    strokes[e.pointerId] = s;
    path.setAttribute('d', pathData(s.points));
    part.setAttribute('data-painted', '1');
    BabyGames.sound('paint');
  });

  paper.addEventListener('pointermove', function (e) {
    var s = strokes[e.pointerId];
    if (!s) return;
    e.preventDefault();
    var p = toSvg(s.svg, e);
    var last = s.points[s.points.length - 1];
    if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) < 1.2) return;
    s.points.push(p);
    s.path.setAttribute('d', pathData(s.points));
  });

  function end(e) {
    if (!strokes[e.pointerId]) return;
    delete strokes[e.pointerId];
    checkDone();
  }
  paper.addEventListener('pointerup', end);
  paper.addEventListener('pointercancel', end);

  function checkDone() {
    var animal = current();
    if (celebrated[animal.id]) return;
    var svg = drawings[animal.id];
    if (svg.querySelectorAll('[data-part]:not([data-part="bg"])[data-painted]').length < animal.parts.length) return;
    celebrated[animal.id] = true;
    var r = paper.getBoundingClientRect();
    A.sparkle(r.left + r.width / 2, r.top + r.height / 2, 24);
    BabyGames.sound('fanfare');
    setTimeout(function () { BabyGames.sound('animal', animal.id); }, 800);
    setTimeout(function () { BabyGames.say('¡Qué bonito!'); }, 2000);
  }

  [['prev', -1], ['next', 1]].forEach(function (b) {
    document.getElementById(b[0]).addEventListener('pointerdown', function (e) {
      e.preventDefault();
      show(b[1]);
    });
  });

  draw();
  BabyGames.music('calma');
  setTimeout(function () { BabyGames.say('¡A pintar! ' + cap(A.named(current())) + '.'); }, 300);
})();
