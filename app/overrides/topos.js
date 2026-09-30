// Topos: el tablero mide 600x400 px (más el título); se escala para ocupar la pantalla.
(function () {
  var DESIGN_WIDTH = 640;
  function fit() {
    document.body.style.zoom = '';
    var h = document.body.scrollHeight + 60;
    var zoom = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / h);
    document.body.style.zoom = Math.max(0.5, zoom);
  }
  fit();
  window.addEventListener('resize', fit);
})();
