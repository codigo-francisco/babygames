// Torre 100 % táctil y en español:
// - Empieza sola tras una cuenta atrás (sin botón START). Durante la partida se
//   toca para soltar el bloque; al perder, un toque vuelve a empezar.
// - Los textos que el juego dibuja con imágenes en inglés ("Click!", "SCORE")
//   se cambian por imágenes generadas aquí en español.
(function () {
  var hint = BabyGames.tapHint('¡Toca para jugar!');
  hint.hide();

  function visible(selector) {
    var el = document.querySelector(selector);
    return !!el && getComputedStyle(el).display !== 'none';
  }

  // Texto naranja con borde blanco, como las imágenes originales. Con `pill`,
  // el texto va a la izquierda sobre una franja blanca (ahí el juego escribe
  // los puntos, a la derecha).
  function label(text, width, height, pill) {
    var c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    var ctx = c.getContext('2d');
    if (pill) {
      var r = height * 0.4;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.roundRect(height * 0.08, height * 0.1, width - height * 0.16, height * 0.8, r);
      ctx.fill();
    }
    var maxWidth = pill ? width * 0.5 : width * 0.94;
    var size = height * (pill ? 0.6 : 0.72);
    ctx.font = '700 ' + size + 'px Fredoka, "Segoe UI", sans-serif';
    size *= Math.min(1, maxWidth / ctx.measureText(text).width);
    ctx.font = '700 ' + size + 'px Fredoka, "Segoe UI", sans-serif';
    ctx.textAlign = pill ? 'left' : 'center';
    ctx.textBaseline = 'middle';
    var x = pill ? height * 0.3 : width / 2;
    var grad = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.8);
    grad.addColorStop(0, '#fad961');
    grad.addColorStop(1, '#f76b1c');
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.18;
    ctx.strokeStyle = '#fff';
    ctx.strokeText(text, x, height / 2);
    ctx.fillStyle = grad;
    ctx.fillText(text, x, height / 2);
    return c;
  }

  function translateImages() {
    var images = window.game && window.game.assetsObj && window.game.assetsObj.image;
    if (!images) return;
    // Mismas proporciones que tutorial.png (180x86) y score.png (410x115).
    images.tutorial = label('¡Toca!', 360, 172, false);
    images.score = label('PUNTOS', 820, 230, true);
  }

  var counting = false;
  var started = false;

  // Cuando termina la carga aparece la portada: se traduce y empieza sola.
  var wait = setInterval(function () {
    if (!visible('.landing')) return;
    clearInterval(wait);
    counting = true;
    var fontReady = document.fonts && document.fonts.load ? document.fonts.load('700 40px Fredoka') : Promise.resolve();
    fontReady.catch(function () {}).then(function () {
      translateImages();
      BabyGames.countdown(function () {
        counting = false;
        started = true;
        document.getElementById('start').click();
      });
    });
  }, 200);

  // El cartel solo se muestra con la ventana de fin (esperando un toque).
  setInterval(function () {
    if (visible('#modal')) hint.show();
    else hint.hide();
  }, 300);

  BabyGames.onTap(function () {
    if (counting || !started) return;
    if (visible('#modal')) document.querySelector('.js-reload').click();
  });
})();
