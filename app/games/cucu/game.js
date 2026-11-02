// Cucú: cuatro arbustos y un animal escondido detrás de cada uno. Al tocar un
// arbusto se aparta, el animal asoma ("¡Cucú! ¡El gato!") y hace su sonido;
// luego se vuelve a esconder y otro animal ocupa su sitio. Siempre hay alguien
// detrás: no se puede fallar. A los 6 animales encontrados, fin de partida.
(function () {
  var A = window.BabyAnimals;
  var garden = document.getElementById('garden');
  var dots = document.getElementById('dots');
  var ask = document.getElementById('ask');
  var GOAL = 6;
  var COLORS = ['#43a047', '#2e7d32', '#66bb6a', '#388e3c'];
  var hides = [];
  var found = 0;
  var playing = false;
  var bag = [];

  // Saca animales sin repetir hasta agotar la lista.
  function nextAnimal() {
    var used = hides.map(function (h) { return h.animal; });
    if (!bag.length) bag = A.shuffle(A.list);
    for (var i = 0; i < bag.length; i++) {
      if (used.indexOf(bag[i]) < 0) return bag.splice(i, 1)[0];
    }
    return bag.pop();
  }

  function bushSVG(color) {
    var leaves = [[40, 70, 38], [100, 50, 46], [160, 70, 38], [70, 100, 40], [130, 100, 40]];
    return '<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      leaves.map(function (l) {
        return '<circle cx="' + l[0] + '" cy="' + l[1] + '" r="' + l[2] + '" fill="' + color + '" stroke="' + A.ink + '" stroke-width="4"/>';
      }).join('') +
      '<rect x="8" y="96" width="184" height="48" rx="10" fill="' + color + '"/>' +
      '<circle cx="70" cy="60" r="7" fill="#ff8a80"/><circle cx="140" cy="78" r="7" fill="#fff176"/><circle cx="104" cy="34" r="7" fill="#f8bbd0"/>' +
      '</svg>';
  }

  function setAnimal(h, animal) {
    h.animal = animal;
    h.pic.innerHTML = A.svg(animal);
    h.say.textContent = '¡Cucú!';
  }

  function build() {
    garden.innerHTML = '';
    hides = [];
    for (var i = 0; i < 4; i++) {
      var el = document.createElement('div');
      el.className = 'hide';
      el.innerHTML = '<div class="pic"></div><div class="bush">' + bushSVG(COLORS[i]) + '</div><div class="say"></div>';
      var h = { el: el, pic: el.querySelector('.pic'), say: el.querySelector('.say'), open: false };
      el.addEventListener('pointerdown', tap.bind(null, h));
      garden.appendChild(el);
      hides.push(h);
    }
    hides.forEach(function (h) { setAnimal(h, nextAnimal()); });
  }

  function buildDots() {
    dots.innerHTML = '';
    for (var i = 0; i < GOAL; i++) dots.appendChild(document.createElement('span'));
  }

  function tap(h, e) {
    e.preventDefault();
    if (!playing || h.open) return;
    h.open = true;
    h.el.classList.add('open');
    BabyGames.sound('peek');
    var animal = h.animal;
    BabyGames.say('¡Cucú! ¡' + cap(A.named(animal)) + '!');
    setTimeout(function () { BabyGames.sound('animal', animal.id); }, 900);
    var r = h.el.getBoundingClientRect();
    A.sparkle(r.left + r.width / 2, r.top + r.height * 0.3, 10);
    dots.children[found].classList.add('on');
    found++;
    var last = found === GOAL;
    if (last) playing = false;
    setTimeout(function () {
      h.el.classList.remove('open');
      setTimeout(function () {
        h.open = false;
        setAnimal(h, nextAnimal());
        if (last) finish();
      }, 400);
    }, 2200);
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Si nadie toca, un arbusto se mueve un poquito para invitar a tocarlo.
  setInterval(function () {
    if (!playing) return;
    var closed = hides.filter(function (h) { return !h.open; });
    if (!closed.length) return;
    var h = closed[Math.floor(Math.random() * closed.length)];
    h.el.classList.remove('shake');
    void h.el.offsetWidth;
    h.el.classList.add('shake');
  }, 2500);

  function finish() {
    BabyGames.endScreen({
      emoji: '🙈',
      title: '¡Los encontraste!',
      say: '¡Muy bien! ¡Has encontrado a todos los animales!',
      onRestart: start,
    });
  }

  function start() {
    found = 0;
    buildDots();
    build();
    playing = true;
    ask.innerHTML = '<span class="bubble">¿Quién se esconde?</span>';
    BabyGames.say('¿Quién se esconde? ¡Toca los arbustos!');
  }

  BabyGames.music('granja');
  start();
})();
