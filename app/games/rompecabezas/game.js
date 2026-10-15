// Rompecabezas de animales: se arrastran las piezas de la bandeja al tablero.
// Encajan solas si se sueltan cerca de su sitio; si no, vuelven a la bandeja.
// Los dos primeros tienen 4 piezas y luego 6. Al acabar, el animal habla y
// sale otro.
(function () {
  var A = window.BabyAnimals;
  var BACKS = ['#fff59d', '#b3e5fc', '#f8bbd0', '#c8e6c9', '#ffe0b2', '#d1c4e9'];
  var board = document.getElementById('board');
  var guide = document.getElementById('guide');
  var slotsEl = document.getElementById('slots');
  var tray = document.getElementById('tray');
  var layer = document.getElementById('pieces');

  var order = A.shuffle(A.list);
  var round = 0;
  var cols = 2;
  var rows = 2;
  var pieces = [];
  var L = null; // medidas actuales
  var drag = null;
  var finished = false;

  function picture(animal, back) {
    var inner = A.svg(animal).replace('<svg class="bg-animal" viewBox="0 0 200 200"', '<svg x="60" y="6" width="180" height="180" viewBox="0 0 200 200"');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" preserveAspectRatio="none">' +
      '<rect width="300" height="200" fill="' + back + '"/>' +
      '<rect y="160" width="300" height="40" fill="#9ccc65"/>' +
      '<circle cx="34" cy="34" r="20" fill="#ffca28"/>' +
      '<circle cx="268" cy="40" r="12" fill="#fff"/><circle cx="252" cy="44" r="10" fill="#fff"/><circle cx="282" cy="46" r="9" fill="#fff"/>' +
      inner + '</svg>';
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  function measure() {
    var W = window.innerWidth;
    var H = window.innerHeight;
    var m = Math.min(W, H) * 0.04;
    var left = Math.min(W, H) * 0.16; // sitio para la 🏠
    var trayW = W * 0.27;
    var bw = Math.min(W - left - trayW - 3 * m, (H - 2 * m) * 1.5);
    var bh = bw / 1.5;
    var pw = bw / cols;
    var ph = bh / rows;
    var tx = W - trayW - m;
    var th = H - 2 * m;
    // Escala de las piezas en la bandeja: 2 columnas y las filas que hagan falta.
    var trayRows = Math.ceil(cols * rows / 2);
    var s = Math.min(1, (trayW - 3 * m * 0.5) / (2 * pw), (th - (trayRows + 1) * m * 0.5) / (trayRows * ph));
    return {
      W: W, H: H, m: m, pw: pw, ph: ph, s: s,
      bx: left + (W - left - trayW - m - bw) / 2, by: (H - bh) / 2, bw: bw, bh: bh,
      tx: tx, ty: m, tw: trayW, th: th, trayRows: trayRows,
    };
  }

  function place(el, x, y, scale) {
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
  }

  function home(p) {
    var gapX = (L.tw - 2 * L.pw * L.s) / 3;
    var gapY = (L.th - L.trayRows * L.ph * L.s) / (L.trayRows + 1);
    var c = p.slotInTray % 2;
    var r = Math.floor(p.slotInTray / 2);
    return { x: L.tx + gapX + c * (L.pw * L.s + gapX), y: L.ty + gapY + r * (L.ph * L.s + gapY) };
  }

  function target(p) {
    return { x: L.bx + p.col * L.pw, y: L.by + p.row * L.ph };
  }

  function layout() {
    L = measure();
    board.style.cssText = 'width:' + L.bw + 'px;height:' + L.bh + 'px;transform:translate(' + L.bx + 'px,' + L.by + 'px)';
    tray.style.cssText = 'width:' + L.tw + 'px;height:' + L.th + 'px;transform:translate(' + L.tx + 'px,' + L.ty + 'px)';
    pieces.forEach(function (p) {
      p.el.style.width = L.pw + 'px';
      p.el.style.height = L.ph + 'px';
      p.el.style.backgroundSize = L.bw + 'px ' + L.bh + 'px';
      p.el.style.backgroundPosition = (-p.col * L.pw) + 'px ' + (-p.row * L.ph) + 'px';
      if (p.placed) { var t = target(p); place(p.el, t.x, t.y, 1); }
      else { var h = home(p); place(p.el, h.x, h.y, L.s); }
    });
  }

  function start() {
    var animal = order[round % order.length];
    var back = BACKS[round % BACKS.length];
    cols = round < 2 ? 2 : 3;
    rows = 2;
    finished = false;
    drag = null;
    board.classList.remove('done');
    var img = picture(animal, back);
    guide.style.backgroundImage = img;
    slotsEl.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    slotsEl.innerHTML = new Array(cols * rows + 1).join('<div></div>');
    layer.innerHTML = '';
    var slots = A.shuffle(Array.apply(null, { length: cols * rows }).map(function (_, i) { return i; }));
    pieces = [];
    for (var i = 0; i < cols * rows; i++) {
      var el = document.createElement('div');
      el.className = 'piece';
      el.style.backgroundImage = img;
      var p = { el: el, col: i % cols, row: Math.floor(i / cols), slotInTray: slots[i], placed: false, animal: animal };
      bind(p);
      layer.appendChild(el);
      pieces.push(p);
    }
    layout();
    BabyGames.say(round === 0 ? '¡Un rompecabezas! Pon cada pieza en su sitio.' : '¡Otro! ¿Quién será?');
  }

  function bind(p) {
    p.el.addEventListener('pointerdown', function (e) {
      if (p.placed || drag || finished) return;
      e.preventDefault();
      try { p.el.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      var h = home(p);
      // La pieza crece a su tamaño real bajo el dedo.
      var fx = (e.clientX - h.x) / L.s;
      var fy = (e.clientY - h.y) / L.s;
      drag = { p: p, id: e.pointerId, dx: Math.min(L.pw, Math.max(0, fx)), dy: Math.min(L.ph, Math.max(0, fy)) };
      p.el.classList.add('drag');
      place(p.el, e.clientX - drag.dx, e.clientY - drag.dy, 1);
      BabyGames.sound('tap');
    });
    p.el.addEventListener('pointermove', function (e) {
      if (!drag || drag.p !== p || drag.id !== e.pointerId) return;
      e.preventDefault();
      place(p.el, e.clientX - drag.dx, e.clientY - drag.dy, 1);
    });
    var end = function (e) {
      if (!drag || drag.p !== p || drag.id !== e.pointerId) return;
      drop(p, e.clientX - drag.dx, e.clientY - drag.dy);
    };
    p.el.addEventListener('pointerup', end);
    p.el.addEventListener('pointercancel', end);
    p.el.addEventListener('lostpointercapture', end);
  }

  function drop(p, x, y) {
    drag = null;
    p.el.classList.remove('drag');
    var t = target(p);
    // Generoso: vale soltarla a media pieza de su sitio.
    if (Math.abs(x - t.x) < L.pw * 0.5 && Math.abs(y - t.y) < L.ph * 0.5) {
      p.placed = true;
      p.el.classList.add('placed');
      place(p.el, t.x, t.y, 1);
      BabyGames.sound('snap');
      A.sparkle(t.x + L.pw / 2, t.y + L.ph / 2, 8);
      if (pieces.every(function (q) { return q.placed; })) win(p.animal);
    } else {
      var h = home(p);
      place(p.el, h.x, h.y, L.s);
      BabyGames.sound('boing');
    }
  }

  function win(animal) {
    finished = true;
    setTimeout(function () {
      board.classList.add('done');
      BabyGames.sound('fanfare');
      A.sparkle(L.bx + L.bw / 2, L.by + L.bh / 2, 28);
      var name = A.named(animal);
      setTimeout(function () { BabyGames.sound('animal', animal.id); }, 750);
      setTimeout(function () { BabyGames.say('¡Muy bien! ¡Es ' + name + '!'); }, 2000);
    }, 350);
    setTimeout(function () {
      round++;
      start();
    }, 4500);
  }

  window.addEventListener('resize', function () { if (pieces.length) layout(); });
  BabyGames.music('calma');
  start();
})();
