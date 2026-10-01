// Puzle: al completarlo, un toque en cualquier sitio carga el siguiente dibujo
// (siempre de 6 piezas). La ventana final lleva iconos junto a cada dato.
(function () {
  var THEMES = ['cats', 'castle', 'sunset', 'nature', 'aurora'];
  var index = 0;
  var modal = document.getElementById('victory-modal');
  var select = document.getElementById('puzzle-select');
  if (!modal || !select) return;

  var ICONS = ['⏱️', '🎯', '🧩'];
  modal.querySelectorAll('.stat-label').forEach(function (label, i) {
    var icon = document.createElement('span');
    icon.className = 'stat-icon';
    icon.textContent = ICONS[i] || '';
    label.prepend(icon);
  });

  var again = document.getElementById('btn-play-again');
  if (again) again.textContent = '🔄 ¡Otro puzle!';

  modal.addEventListener('pointerdown', function () {
    if (!modal.classList.contains('show')) return;
    modal.classList.remove('show');
    index = (index + 1) % THEMES.length;
    select.value = THEMES[index];
    select.dispatchEvent(new Event('change'));
  });
})();
