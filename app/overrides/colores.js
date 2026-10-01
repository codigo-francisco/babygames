// Colores 100 % táctil: tocar un color y luego su vecino, o arrastrarlo, los
// intercambia. Sin botones: al terminar, un toque empieza otra partida.
// Nítido en pantallas de alta resolución: el canvas se dibuja a su tamaño real.
// Con música y efectos de sonido (sintetizados por el menú de BabyGames).
(function () {
  var viewport = document.getElementById('viewport');
  if (viewport) BabyGames.sharpCanvas(viewport);

  BabyGames.touchToMouse({
    match: function (target) { return target.id === 'viewport' ? target : null; },
  });

  var combo = 0;
  var over = false;

  // Llamada desde el juego (parches de games.json).
  window.babyColors = function (event) {
    if (event === 'swap') {
      combo = 0;
      BabyGames.sound('swap');
    } else if (event === 'match') {
      // Cada cadena seguida suena un poco más aguda.
      BabyGames.sound('pop', combo++);
    } else if (event === 'wrong') {
      BabyGames.sound('wrong');
    } else if (event === 'gameover') {
      if (over) return; // el juego lo avisa en cada fotograma
      over = true;
      BabyGames.musicStop();
      BabyGames.sound('sad');
    } else if (event === 'new') {
      over = false;
      combo = 0;
      BabyGames.music('colores');
    }
  };
})();
