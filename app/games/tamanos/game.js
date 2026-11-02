// Tamaños: la misma forma en grande y en pequeño. Bubu pide "el grande" o "el
// pequeño" y se toca. Si se toca el otro, Bubu dice cuál es. 6 aciertos = fin.
(function () {
  var A = window.BabyAnimals;
  var S = window.BabyShapes;
  var BIG = 'width: min(46vmin, 36vw)';
  var SMALL = 'width: min(20vmin, 16vw)';

  S.quiz({
    board: document.getElementById('board'),
    ask: document.getElementById('ask'),
    dots: document.getElementById('dots'),
    rounds: 6,
    music: 'granja',
    end: { emoji: '🪆', title: '¡Grande y pequeño!', say: '¡Muy bien! ¡Sabes qué es grande y qué es pequeño!' },
    round: function () {
      var shape = S.random(S.shapes);
      var color = S.random(S.colors);
      var big = Math.random() < 0.5;
      var word = big ? 'grande' : 'pequeño';
      var options = A.shuffle([
        { html: S.svg(shape, color.hex), style: BIG, right: big, say: 'Ese es el grande' },
        { html: S.svg(shape, color.hex), style: SMALL, right: !big, say: 'Ese es el pequeño' },
      ]);
      return {
        ask: '<span class="bubble">¿Cuál es el ' + word + '?</span>',
        say: '¿Cuál es el ' + word + '?',
        praise: '¡Muy bien! ¡El ' + word + '!',
        options: options,
      };
    },
  });
})();
