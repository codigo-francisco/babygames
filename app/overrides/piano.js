// Piano para peques: botones grandes de instrumento y teclado ajustado a la pantalla.
(function () {
  var INSTRUMENTS = [
    ['piano', '🎹'], ['electric', '🎸'], ['organ', '⛪'],
    ['strings', '🎻'], ['harpsichord', '🪕'], ['sine', '🔔'],
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

  // El teclado mide ~1000px de ancho; se escala con zoom para llenar la pantalla
  // y la altura de las teclas usa el alto disponible.
  function fit() {
    wrap.style.zoom = '';
    var bodyStyle = getComputedStyle(document.body);
    var padX = parseFloat(bodyStyle.paddingLeft) + parseFloat(bodyStyle.paddingRight);
    var width = piano.scrollWidth + 24;
    var zoom = Math.max(0.5, Math.min((window.innerWidth - padX - 8) / width, 3));
    wrap.style.zoom = zoom;
    var free = window.innerHeight - bar.offsetHeight - 60;
    var h = Math.max(150, free / zoom - 40);
    document.documentElement.style.setProperty('--kid-h', h + 'px');
  }

  mark();
  fit();
  window.addEventListener('resize', fit);
})();
