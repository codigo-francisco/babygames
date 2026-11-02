// ¿Qué color?: tres formas iguales de distinto color. Bubu pide un color
// ("¿Dónde está el rojo?", con una muestra del color para quien aún no lo sabe)
// y se toca. Si se toca otro, Bubu dice qué color es. 6 aciertos = fin.
(function () {
  var A = window.BabyAnimals;
  var S = window.BabyShapes;
  var last = null;

  S.quiz({
    board: document.getElementById('board'),
    ask: document.getElementById('ask'),
    dots: document.getElementById('dots'),
    rounds: 6,
    music: 'colores',
    end: { emoji: '🔴', title: '¡Sabes los colores!', say: '¡Muy bien! ¡Te sabes los colores!' },
    round: function () {
      var target = S.other(S.colors, last);
      last = target;
      var shape = S.random(S.shapes);
      var colors = A.shuffle([target].concat(S.pick(S.colors, 2, [target])));
      return {
        ask: '<span class="bubble">¿Dónde está el <span class="swatch" style="background:' + target.hex + '"></span> ' + target.name + '?</span>',
        say: '¿Dónde está el ' + target.name + '?',
        praise: '¡Muy bien! ¡El ' + target.name + '!',
        options: colors.map(function (c) {
          return { html: S.svg(shape, c.hex), right: c === target, say: 'Ese es el ' + c.name };
        }),
      };
    },
  });
})();
