// Colorear animales: se elige un color abajo y se toca una parte del dibujo
// para rellenarla. Con todas las partes pintadas hay celebración; las flechas
// cambian de animal. Cada animal recuerda sus colores mientras dura la partida.
(function () {
  var A = window.BabyAnimals;
  var COLORS = ['#ff5277', '#ff9f1c', '#ffd600', '#00c853', '#00b8d4', '#2979ff', '#7c4dff', '#8d6e63', '#ffffff'];
  var paper = document.getElementById('paper');
  var palette = document.getElementById('palette');
  var index = Math.floor(Math.random() * A.list.length);
  var color = COLORS[0];
  var painted = {}; // id del animal -> { parte: color }
  var celebrated = {};

  COLORS.forEach(function (c, i) {
    var b = document.createElement('div');
    b.className = 'swatch' + (i === 0 ? ' on' : '');
    b.style.background = c;
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      color = c;
      palette.querySelectorAll('.swatch').forEach(function (s) { s.classList.toggle('on', s === b); });
      BabyGames.sound('tap');
    });
    palette.appendChild(b);
  });

  function current() { return A.list[index]; }

  function draw() {
    var animal = current();
    paper.innerHTML = A.svg(animal, { blank: true, parts: true, fills: painted[animal.id] || {} });
  }

  function show(step) {
    index = (index + step + A.list.length) % A.list.length;
    draw();
    var animal = current();
    BabyGames.sound('whoosh');
    BabyGames.say('¡' + cap(A.named(animal)) + '! ¡A pintar!');
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  paper.addEventListener('pointerdown', function (e) {
    var part = e.target.closest && e.target.closest('[data-part]');
    if (!part) return;
    e.preventDefault();
    var animal = current();
    var fills = painted[animal.id] || (painted[animal.id] = {});
    fills[part.getAttribute('data-part')] = color;
    part.setAttribute('fill', color);
    BabyGames.sound('paint');
    if (!celebrated[animal.id] && Object.keys(fills).length === animal.parts.length) {
      celebrated[animal.id] = true;
      var r = paper.getBoundingClientRect();
      A.sparkle(r.left + r.width / 2, r.top + r.height / 2, 24);
      BabyGames.sound('fanfare');
      BabyGames.say('¡Qué bonito! ¡' + cap(A.named(animal)) + ' hace ' + animal.sound + '!');
    }
  });

  [['prev', -1], ['next', 1]].forEach(function (b) {
    document.getElementById(b[0]).addEventListener('pointerdown', function (e) {
      e.preventDefault();
      show(b[1]);
    });
  });

  draw();
  BabyGames.music('calma');
  setTimeout(function () { BabyGames.say('¡A colorear! ' + cap(A.named(current())) + '.'); }, 300);
})();
