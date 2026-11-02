// ¿Qué forma?: tres formas distintas del mismo color. Bubu pide una ("¿Dónde
// está la estrella?", con su silueta) y se toca. Si se toca otra, Bubu dice cuál
// es. 6 aciertos = fin.
(function () {
  var S = window.BabyShapes;
  var last = null;

  S.quiz({
    board: document.getElementById('board'),
    ask: document.getElementById('ask'),
    dots: document.getElementById('dots'),
    rounds: 6,
    music: 'calma',
    end: { emoji: '🔺', title: '¡Sabes las formas!', say: '¡Muy bien! ¡Te sabes las formas!' },
    round: function () {
      var target = S.other(S.shapes, last);
      last = target;
      var color = S.random(S.colors);
      var shapes = window.BabyAnimals.shuffle([target].concat(S.pick(S.shapes, 2, [target])));
      return {
        ask: '<span class="bubble">¿Dónde está <span class="mini">' + S.svg(target, '#fff') + '</span>?</span>',
        say: '¿Dónde está ' + target.name + '?',
        praise: '¡Muy bien! ¡' + S.cap(target.name) + '!',
        options: shapes.map(function (s) {
          return { html: S.svg(s, color.hex), right: s === target, say: 'Ese es ' + s.name };
        }),
      };
    },
  });
})();
