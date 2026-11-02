// Collar: un collar con cuentas que se repiten (rojo, azul, rojo, azul…) y un
// hueco al final. Abajo hay dos cuentas: se toca la que sigue y se engancha en
// el collar. Las primeras rondas cambian de color y las últimas de forma.
// 4 collares = fin.
(function () {
  var S = window.BabyShapes;
  var necklace = document.getElementById('necklace');
  var ROUNDS = 4;
  var LENGTH = 5; // cuentas antes del hueco

  function bead(shape, color, cls) {
    return '<div class="bead' + (cls ? ' ' + cls : '') + '">' + S.svg(shape, color.hex) + '</div>';
  }

  S.quiz({
    board: document.getElementById('board'),
    ask: necklace,
    dots: document.getElementById('dots'),
    rounds: ROUNDS,
    music: 'pompas',
    end: { emoji: '📿', title: '¡Qué collares tan bonitos!', say: '¡Muy bien! ¡Has hecho todos los collares!' },
    round: function (n) {
      // Dos cuentas que se alternan: de distinto color o, más adelante, de distinta forma.
      var byShape = n >= ROUNDS / 2;
      var a;
      var b;
      if (byShape) {
        var color = S.random(S.colors);
        var shapes = S.pick(S.shapes, 2);
        a = { shape: shapes[0], color: color };
        b = { shape: shapes[1], color: color };
      } else {
        var circle = S.byId(S.shapes, 'circulo');
        var colors = S.pick(S.colors, 2);
        a = { shape: circle, color: colors[0] };
        b = { shape: circle, color: colors[1] };
      }
      var html = '';
      for (var i = 0; i < LENGTH; i++) {
        var o = i % 2 ? b : a;
        html += bead(o.shape, o.color);
      }
      html += '<div class="bead slot"></div>';
      // Tras A B A B A va B.
      var next = LENGTH % 2 ? b : a;
      var wrong = next === a ? b : a;
      var options = window.BabyAnimals.shuffle([next, wrong]);
      return {
        ask: html,
        say: n === 0 ? '¿Qué cuenta va después?' : '¿Y ahora cuál va?',
        praise: '¡Muy bien! ¡Qué collar tan bonito!',
        options: options.map(function (o) {
          return {
            html: S.svg(o.shape, o.color.hex),
            right: o === next,
            say: (byShape ? S.cap(o.shape.name) : 'El ' + o.color.name) + '. ¡Mira bien el collar!',
          };
        }),
        onRight: function () {
          var slot = necklace.querySelector('.slot');
          slot.className = 'bead slot filled new';
          slot.innerHTML = S.svg(next.shape, next.color.hex);
        },
      };
    },
  });
})();
