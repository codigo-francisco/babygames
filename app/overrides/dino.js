// Dino 100 % táctil: empieza solo tras una cuenta atrás. Tocar en cualquier
// sitio salta al momento (sin esperar a levantar el dedo) y, si el dino ha
// chocado, empieza otra partida.
(function () {
  function hideMessage() {
    var box = document.getElementById('messageBox');
    if (box) box.style.visibility = 'hidden';
  }

  function runner() {
    return window.Runner && window.Runner.instance_;
  }

  function mouse(type) {
    document.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 }));
  }

  window.addEventListener('touchstart', function (e) {
    var r = runner();
    if (!r || !r.playing && !r.crashed) return; // durante la cuenta atrás
    e.preventDefault();
    e.stopImmediatePropagation();
    if (r.crashed) r.restart();
    else mouse('mousedown');
  }, { capture: true, passive: false });

  window.addEventListener('touchend', function (e) {
    if (!runner()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    mouse('mouseup');
  }, { capture: true, passive: false });

  // Arranque: el primer "salto" pone el juego en marcha (MOUSEDOWN lo admite
  // gracias al parche de games.json).
  window.addEventListener('load', function () {
    hideMessage();
    setTimeout(function () {
      BabyGames.countdown(function () {
        if (!runner()) return;
        mouse('mousedown');
        setTimeout(function () { mouse('mouseup'); }, 80);
        var hint = BabyGames.tapHint('¡Toca para saltar!');
        setTimeout(hint.hide, 3500);
      });
    }, 700);
  });
})();
