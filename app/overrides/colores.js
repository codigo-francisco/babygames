// Colores 100 % táctil: tocar un color y luego su vecino, o arrastrarlo, los
// intercambia. Sin botones: al terminar, un toque empieza otra partida.
// Nítido en pantallas de alta resolución: el canvas se dibuja a su tamaño real.
(function () {
  var viewport = document.getElementById('viewport');
  if (viewport) BabyGames.sharpCanvas(viewport);

  BabyGames.touchToMouse({
    match: function (target) { return target.id === 'viewport' ? target : null; },
  });
})();
