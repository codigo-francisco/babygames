// Dino 100 % táctil y en español: empieza solo tras una cuenta atrás. Tocar en
// cualquier sitio salta al momento (sin esperar a levantar el dedo) y, si el
// dino ha chocado, empieza otra partida.
(function () {
  function hideMessage() {
    var box = document.getElementById('messageBox');
    if (box) box.style.visibility = 'hidden';
  }

  function runner() {
    return window.Runner && window.Runner.instance_;
  }

  // Salto: se llama directamente al juego como si se pulsara Espacio. Así vale en
  // Windows y en Android (en Android, el original solo escucha sus propios toques
  // sobre el lienzo y no hace caso a eventos de ratón).
  function key(down) {
    var r = runner();
    if (!r) return;
    // target no puede ser null: el original compara e.target != this.detailsButton (undefined).
    var e = { type: down ? 'keydown' : 'keyup', keyCode: 32, target: document, currentTarget: document, preventDefault: function () {} };
    if (down) r.onKeyDown(e);
    else r.onKeyUp(e);
  }

  // El original se pausa al perder el foco ('blur'), y dentro de BabyGames eso pasa
  // con cualquier toque fuera del juego (la 🏠, un aviso del sistema…). Como un toque
  // con el dedo no le devuelve el foco, se quedaba pausado y ya no saltaba. Aquí solo
  // se pausa si la app pasa de verdad a segundo plano (visibilitychange).
  window.addEventListener('blur', function (e) { e.stopImmediatePropagation(); }, true);

  var started = false; // tras la cuenta atrás

  window.addEventListener('touchstart', function (e) {
    var r = runner();
    if (!r || !started) return; // durante la cuenta atrás
    e.preventDefault();
    e.stopImmediatePropagation();
    if (r.crashed) {
      r.restart();
      return;
    }
    if (!r.playing) {
      // Pausado (p. ej. al volver de segundo plano): sigue la partida.
      r.tRex.reset();
      r.play();
    }
    key(true);
  }, { capture: true, passive: false });

  window.addEventListener('touchend', function (e) {
    if (!runner()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    key(false);
  }, { capture: true, passive: false });

  // ---- Textos en español ----------------------------------------------------
  // "GAME OVER" y "HI" son dibujos del sprite: se hace una copia del sprite con
  // "FIN DEL JUEGO" y "MÁX" escritos en su sitio, pixelados como el original.

  var INK = [83, 83, 83]; // #535353, el gris del juego

  function writeText(ctx, text, x, y, w, h, spacing) {
    ctx.clearRect(x, y, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    var size = h * 0.95;
    ctx.font = 'bold ' + size + 'px Consolas, "Courier New", monospace';
    ctx.letterSpacing = spacing ? Math.round(size * spacing) + 'px' : '0px';
    var width = ctx.measureText(text).width;
    if (width > w) {
      size *= w / width;
      ctx.font = 'bold ' + size + 'px Consolas, "Courier New", monospace';
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgb(' + INK.join(',') + ')';
    ctx.fillText(text, x + w / 2, y + h - Math.round(h * 0.12));
    ctx.restore();

    // Sin bordes suaves: píxel lleno o vacío, como el resto del sprite.
    var data = ctx.getImageData(x, y, w, h);
    for (var i = 0; i < data.data.length; i += 4) {
      var on = data.data[i + 3] >= 110;
      data.data[i] = INK[0];
      data.data[i + 1] = INK[1];
      data.data[i + 2] = INK[2];
      data.data[i + 3] = on ? 255 : 0;
    }
    ctx.putImageData(data, x, y);
  }

  function translateSprite(r) {
    var img = window.Runner.imageSprite;
    var hd = img.id === 'offline-resources-2x' ? 2 : 1;
    var c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // TEXT_SPRITE ya está en coordenadas del sprite usado (1x o 2x). Medidas de
    // GameOverPanel y DistanceMeter en index.js.
    var t = r.spriteDef.TEXT_SPRITE;
    writeText(ctx, 'FIN DEL JUEGO', t.x, t.y + 13 * hd, 191 * hd, 11 * hd, 0.25);
    // Casillas 10 y 11 ("H", "I") y la 12, que está vacía.
    ['M', 'Á', 'X'].forEach(function (ch, i) {
      writeText(ctx, ch, t.x + (10 + i) * 10 * hd, t.y, 10 * hd, 13 * hd);
    });

    window.Runner.imageSprite = c;
    r.distanceMeter.image = c; // el marcador guardó el sprite al crearse

    // Récord con tres letras ("MÁX") en lugar de dos ("HI").
    var meter = Object.getPrototypeOf(r.distanceMeter);
    meter.setHighScore = function (distance) {
      distance = this.getActualDistance(distance);
      var highScoreStr = (this.defaultString + distance).substr(-this.maxScoreUnits);
      this.highScore = ['10', '11', '12', ''].concat(highScoreStr.split(''));
    };
  }

  // Arranque: el primer "salto" (Espacio) pone el juego en marcha tras la cuenta
  // atrás.
  window.addEventListener('load', function () {
    var r = runner();
    if (r && r.distanceMeter && r.spriteDef) {
      try { translateSprite(r); } catch (e) { /* se queda el sprite original */ }
    }
    hideMessage();
    setTimeout(function () {
      BabyGames.countdown(function () {
        if (!runner()) return;
        started = true;
        key(true);
        setTimeout(function () { key(false); }, 80);
        var hint = BabyGames.tapHint('¡Toca para saltar!');
        setTimeout(hint.hide, 3500);
      });
    }, 700);
  });
})();
