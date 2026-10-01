// Bloques 100 % táctil, sin botones en pantalla:
// - Arrastrar el dedo por el tablero mueve la pieza (la sigue columna a columna;
//   hacia abajo, la baja fila a fila).
// - Un toque corto gira la pieza (el juego original no tenía giro).
// - Al terminar la ronda, un toque en cualquier sitio empieza otra.
// Las alas laterales y la ventana final escalan con la pantalla.
(function () {
  if (typeof ToddlerTetris !== 'undefined') {
    var proto = ToddlerTetris.prototype;

    // Giro en sentido horario; si choca, prueba a desplazarla un poco.
    proto.rotatePiece = function () {
      if (this.isPaused || this.isGameOver || this.isClearingAnim || !this.currentPiece) return;
      var m = this.currentPiece.matrix;
      var rotated = m[0].map(function (_, c) {
        return m.map(function (row) { return row[c]; }).reverse();
      });
      var kicks = [0, -1, 1, -2, 2];
      for (var i = 0; i < kicks.length; i++) {
        var x = this.currentX + kicks[i];
        if (!this.checkCollision(x, this.currentY, rotated)) {
          this.currentPiece.matrix = rotated;
          this.currentX = x;
          this.sound.playMove();
          this.render();
          return;
        }
      }
    };

    // Sustituye a los gestos originales (deslizar mueve, tocar deja caer). Se
    // llama desde el constructor, en DOMContentLoaded, después de este script.
    proto.bindTouchControls = function () {
      var game = this;
      var board = document.getElementById('boardCard') || this.boardEl;
      if (!board) return;
      var TAP_MS = 350;
      var TAP_PX = 14;
      var drag = null;

      function cellSize() {
        return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 56;
      }

      function canMove() {
        return !game.isPaused && !game.isGameOver && !game.isClearingAnim && game.currentPiece;
      }

      board.addEventListener('pointerdown', function (e) {
        if (drag) return;
        game.sound.unlock();
        drag = {
          id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY,
          t: Date.now(), piece: game.currentPiece, moved: false,
        };
        try { board.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      });

      board.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        if (Math.abs(e.clientX - drag.startX) > TAP_PX || Math.abs(e.clientY - drag.startY) > TAP_PX) drag.moved = true;
        // Si la pieza ya se ha posado, este dedo no mueve la siguiente.
        if (!canMove() || game.currentPiece !== drag.piece) return;
        var size = cellSize();
        while (e.clientX - drag.x >= size) { drag.x += size; game.moveRight(); }
        while (drag.x - e.clientX >= size) { drag.x -= size; game.moveLeft(); }
        while (e.clientY - drag.y >= size && game.currentPiece === drag.piece) { drag.y += size; game.moveDown(); }
        if (e.clientY < drag.y) drag.y = e.clientY; // subir el dedo no hace nada
      });

      function end(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var tap = e.type === 'pointerup' && !drag.moved && Date.now() - drag.t < TAP_MS;
        drag = null;
        if (tap && canMove()) game.rotatePiece();
      }
      board.addEventListener('pointerup', end);
      board.addEventListener('pointercancel', end);
    };
  }

  var modal = document.getElementById('gameOverModal');
  var playAgain = document.getElementById('playAgainBtn');
  if (modal && playAgain) {
    modal.addEventListener('click', function (e) {
      // Tocar el fondo ya lo gestiona el juego; aquí, el resto de la ventana.
      if (e.target !== modal) playAgain.click();
    });
  }

  // Las alas y la ventana final están diseñadas en px pequeños: se agrandan
  // en proporción al alto de la pantalla (x1.4 en 800 px, x3 en 1680 px).
  function fit() {
    var scale = Math.max(1, Math.min(window.innerHeight / 560, 3));
    document.querySelectorAll('.console-wing, .modal-card').forEach(function (el) {
      el.style.zoom = scale;
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();
