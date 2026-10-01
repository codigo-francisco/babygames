// Piano para peques: botones grandes de instrumento, teclado ajustado a la
// pantalla y "glissando" (deslizar el dedo por las teclas las va tocando).
(function () {
  var INSTRUMENTS = [
    ['piano', '🎹', 'Piano'], ['organ', '⛪', 'Órgano'], ['harpsichord', '🪕', 'Clave'],
    ['electric', '🎸', 'Piano eléctrico'], ['strings', '🎻', 'Cuerdas'], ['sine', '🔔', 'Campanita'],
  ];
  var select = document.getElementById('instrument');
  var wrap = document.querySelector('.piano-wrap');
  var piano = document.getElementById('piano');
  if (!select || !wrap || !piano) return;

  var bar = document.createElement('div');
  bar.className = 'kid-bar';
  INSTRUMENTS.forEach(function (item) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = item[1];
    b.dataset.value = item[0];
    b.setAttribute('aria-label', item[2]);
    b.addEventListener('click', function () {
      select.value = item[0];
      select.dispatchEvent(new Event('change'));
      mark();
    });
    bar.appendChild(b);
  });
  wrap.parentNode.insertBefore(bar, wrap);

  function mark() {
    bar.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.value === select.value);
    });
  }
  mark();

  // El teclado mide ~1000px de ancho; se escala con zoom para llenar la pantalla
  // y la altura de las teclas usa el alto que queda bajo los instrumentos.
  function fit() {
    wrap.style.zoom = '';
    var bodyStyle = getComputedStyle(document.body);
    var padX = parseFloat(bodyStyle.paddingLeft) + parseFloat(bodyStyle.paddingRight);
    var padBottom = parseFloat(bodyStyle.paddingBottom);
    var width = piano.scrollWidth + 24;
    var zoom = Math.max(0.5, Math.min((window.innerWidth - padX - 8) / width, 3));
    wrap.style.zoom = zoom;
    var free = window.innerHeight - wrap.getBoundingClientRect().top - padBottom - 8;
    var h = Math.max(150, free / zoom - 40);
    document.documentElement.style.setProperty('--kid-h', h + 'px');
  }
  fit();
  window.addEventListener('resize', fit);

  // Cada dedo recuerda la tecla que está tocando; al deslizarse a otra, suelta
  // la anterior y pulsa la nueva (el piano original escucha mousedown/mouseup).
  var fingers = {};
  function keyAt(touch) {
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    return el && el.closest ? el.closest('.key') : null;
  }
  function send(el, type) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
  }

  document.addEventListener('touchstart', function (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var k = keyAt(t);
      fingers[t.identifier] = { start: k, current: k };
    }
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var f = fingers[t.identifier];
      if (!f) continue;
      var k = keyAt(t);
      if (k === f.current) continue;
      if (f.current) send(f.current, 'mouseup');
      if (k) send(k, 'mousedown');
      f.current = k;
    }
  }, { passive: false });

  function end(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var f = fingers[t.identifier];
      // La tecla inicial la suelta el propio piano (su touchend).
      if (f && f.current && f.current !== f.start) send(f.current, 'mouseup');
      delete fingers[t.identifier];
    }
  }
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', end, { passive: true });
})();
