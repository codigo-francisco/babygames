// Pintar (Kiddo Paint) con una barra sencilla para peques:
// - Herramientas: lápiz, brocha, sellos, cubo de pintura, deshacer y borrar todo
//   (el resto se ocultan en pintar.css). Usan los manejadores originales.
// - 10 colores grandes propios en lugar de la paleta de 32 cuadraditos.
// - El original no dibuja con el dedo (los toques no traen coordenadas): se
//   convierten en eventos de ratón sobre el lienzo.
// - Lápiz de trazo continuo y grueso; lienzo en blanco cada vez que se entra y
//   del tamaño del hueco libre.
(function () {
  var COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#795548', '#212121', '#ffffff'];
  var TOOLS = ['pencil', 'brush', 'stamp', 'flood'];

  // Iconos más claros para peques.
  var ICONS = { flood: '🪣', undo: '↩️' };
  Object.keys(ICONS).forEach(function (id) {
    var emj = document.querySelector('#' + id + ' emj');
    if (emj) emj.textContent = ICONS[id];
  });

  function mark(list, el) {
    list.forEach(function (other) { other.classList.toggle('bg-active', other === el); });
  }

  // Fila de colores bajo el lienzo.
  var bar = document.createElement('div');
  bar.id = 'bg-colors';
  var swatches = COLORS.map(function (color, i) {
    var b = document.createElement('button');
    b.className = 'bg-color';
    b.style.background = color;
    b.setAttribute('aria-label', 'Color ' + (i + 1));
    b.addEventListener('pointerdown', function () {
      var P = window.KiddoPaint;
      if (!P) return;
      P.Current.color = P.Current.altColor = P.Current.terColor = color;
      mark(swatches, b);
    });
    bar.appendChild(b);
    return b;
  });
  var hcontainer = document.getElementById('hcontainer');
  if (hcontainer) hcontainer.appendChild(bar);

  // Herramienta activa resaltada.
  var toolButtons = TOOLS.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  toolButtons.forEach(function (b) {
    b.addEventListener('pointerdown', function () { mark(toolButtons, b); });
  });

  // Lienzo nuevo en cada partida: init_kiddo_paint recuperaría el dibujo guardado.
  try { localStorage.removeItem('kiddopaint'); } catch (e) { /* sin almacenamiento */ }

  // Antes de init_kiddo_paint, que copia este tamaño a los lienzos auxiliares.
  var main = document.getElementById('kiddopaint');
  var paint = document.getElementById('paint');
  if (main && paint) {
    main.width = Math.max(paint.clientWidth, 320);
    main.height = Math.max(paint.clientHeight, 240);
  }

  BabyGames.touchToMouse({
    match: function (target) { return target instanceof HTMLCanvasElement ? target : null; },
  });

  // Se ejecuta después de init_kiddo_paint (body onload).
  window.addEventListener('load', function () {
    var P = window.KiddoPaint;
    if (!P) return;
    P.Display.clearMain();
    // El lápiz original pinta cuadraditos sueltos (deja huecos al ir rápido);
    // el trazo continuo solo salía con la barra espaciadora. Aquí, siempre.
    ['mousedown', 'mousemove', 'mouseup'].forEach(function (type) {
      P.Tools.Pencil[type] = function (ev) { P.Tools.LinePencil[type](ev); };
    });
    P.Tools.Pencil.size = 25;
    // Sellos grandes: el juego usa 64 px salvo con Mayús pulsada (144 px).
    var stampTexture = P.Tools.Stamp.texture;
    P.Tools.Stamp.texture = function () {
      var modified = P.Current.modified;
      P.Current.modified = true;
      try { return stampTexture.apply(this, arguments); } finally { P.Current.modified = modified; }
    };
    P.Current.color = P.Current.altColor = P.Current.terColor = COLORS[0];
    mark(swatches, swatches[0]);
    mark(toolButtons, toolButtons[0]);
  });
})();
