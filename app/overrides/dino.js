// Dino: en la tablet no hay barra espaciadora, así que el mensaje de inicio
// también se oculta al tocar la pantalla.
(function () {
  function hide() {
    var box = document.getElementById('messageBox');
    if (box) box.style.visibility = 'hidden';
  }
  document.addEventListener('pointerdown', hide);
  document.addEventListener('touchstart', hide, { passive: true });
})();
