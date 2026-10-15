// Granja: "¿Dónde está el perro?". Seis animales en el prado; al tocar el que
// se pide, salta, hace su sonido y sale otra pregunta. Si se toca otro, ese
// animal hace su sonido (sin castigo). La pregunta se ve con su dibujo, así
// funciona también sin voz.
(function () {
  var A = window.BabyAnimals;
  var field = document.getElementById('field');
  var ask = document.getElementById('ask');
  var spots = [];
  var wanted = null;
  var busy = false;
  var lastWanted = null;
  var hits = 0;

  function build() {
    field.innerHTML = '';
    spots = A.shuffle(A.list).slice(0, 6).map(function (animal) {
      var el = document.createElement('div');
      el.className = 'spot';
      el.innerHTML = '<div class="pic">' + A.svg(animal) + '</div><div class="say">¡' + cap(animal.sound) + '!</div>';
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        tap(spot, e);
      });
      var spot = { el: el, animal: animal };
      field.appendChild(el);
      return spot;
    });
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function animate(el, cls) {
    el.classList.remove('hop', 'wiggle');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function talk(spot) {
    spot.el.classList.add('talk');
    clearTimeout(spot.talkTimer);
    spot.talkTimer = setTimeout(function () { spot.el.classList.remove('talk'); }, 1400);
  }

  function question() {
    var options = spots.filter(function (s) { return s.animal !== lastWanted; });
    wanted = options[Math.floor(Math.random() * options.length)].animal;
    lastWanted = wanted;
    ask.innerHTML = '<span class="bubble">¿Dónde está <span class="mini">' + A.svg(wanted) + '</span>?</span>';
    BabyGames.say('¿Dónde está ' + A.named(wanted) + '?');
    busy = false;
  }

  function tap(spot, e) {
    var pic = spot.el.querySelector('.pic');
    talk(spot);
    // Cada animal suena con su sonido de verdad (sintetizado), no con la voz de Bubu.
    BabyGames.sound('animal', spot.animal.id);
    if (busy || spot.animal !== wanted) {
      animate(pic, 'wiggle');
      return;
    }
    busy = true;
    hits++;
    animate(pic, 'hop');
    spot.el.classList.add('right');
    setTimeout(function () {
      BabyGames.sound('star');
      BabyGames.say('¡Muy bien!');
    }, 1100);
    A.sparkle(e.clientX, e.clientY, 16);
    ask.innerHTML = '<span class="bubble">¡Muy bien! ⭐</span>';
    setTimeout(function () {
      spot.el.classList.remove('right');
      // Cada 5 aciertos cambian los animales del prado.
      if (hits % 5 === 0) build();
      question();
    }, 2800);
  }

  build();
  BabyGames.music('granja');
  setTimeout(question, 400);
})();
