// Iguales: arriba sale una forma de un color; abajo hay tres y solo una es igual
// (las otras cambian de color o de forma). Se toca la igual. 6 aciertos = fin.
(function () {
  var A = window.BabyAnimals;
  var S = window.BabyShapes;

  S.quiz({
    board: document.getElementById('board'),
    ask: document.getElementById('ask'),
    dots: document.getElementById('dots'),
    rounds: 6,
    music: 'pompas',
    end: { emoji: '🧦', title: '¡Todas las parejas!', say: '¡Muy bien! ¡Has encontrado todas las parejas!' },
    round: function (n) {
      var shape = S.random(S.shapes);
      var color = S.random(S.colors);
      var options = A.shuffle([
        { shape: shape, color: color, right: true },
        { shape: shape, color: S.other(S.colors, color) },
        { shape: S.other(S.shapes, shape), color: color },
      ]);
      return {
        ask: '<span class="bubble">¿Cuál es igual? <span class="mini">' + S.svg(shape, color.hex) + '</span></span>',
        say: n === 0 ? '¡Busca el que es igual!' : '¿Cuál es igual?',
        options: options.map(function (o) {
          return { html: S.svg(o.shape, o.color.hex), right: !!o.right, say: '¡Casi! ¿Cuál es igual?' };
        }),
      };
    },
  });
})();
