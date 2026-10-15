// Carrera de animales: se elige un animal y, tras la cuenta atrás, cada toque
// en cualquier sitio de la pantalla lo hace correr más. Los demás corren solos.
// El tuyo también avanza despacito sin tocar, así la carrera siempre termina.
(function () {
  var A = window.BabyAnimals;
  var track = document.getElementById('track');
  var pick = document.getElementById('pick');
  var choices = document.getElementById('choices');

  var FINISH = 0.9;      // fracción del carril donde está la meta
  var MY_BASE = 0.022;   // avance propio por segundo sin tocar
  var TAP_BOOST = 0.02;  // avance extra por toque (repartido en un momento)
  var runners = [];
  var me = null;
  var state = 'pick';
  var finishedCount = 0;
  var raf = 0;
  var last = 0;

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function showPick() {
    state = 'pick';
    cancelAnimationFrame(raf);
    track.innerHTML = '';
    choices.innerHTML = '';
    var four = A.shuffle(A.list).slice(0, 4);
    four.forEach(function (animal) {
      var c = document.createElement('div');
      c.className = 'choice';
      c.innerHTML = A.svg(animal);
      c.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (state !== 'pick') return;
        BabyGames.sound('animal', animal.id);
        BabyGames.say('¡' + cap(A.named(animal)) + '! ¡A correr!');
        setup(four, animal);
      });
      choices.appendChild(c);
    });
    pick.hidden = false;
    BabyGames.say('¿Con quién corres?');
  }

  function setup(animals, mine) {
    state = 'ready';
    pick.hidden = true;
    finishedCount = 0;
    runners = A.shuffle(animals).map(function (animal) {
      var lane = document.createElement('div');
      lane.className = 'lane' + (animal === mine ? ' me' : '');
      var el = document.createElement('div');
      el.className = 'runner';
      el.innerHTML = '<div class="body">' + A.svg(animal) + '</div>' + (animal === mine ? '<div class="tag">¡Tú!</div>' : '');
      lane.appendChild(el);
      track.appendChild(lane);
      return {
        animal: animal, lane: lane, el: el, body: el.firstChild, pos: 0, boost: 0,
        // Los rivales tardan entre 13 y 18 s: tocando un poco se gana.
        speed: animal === mine ? MY_BASE : FINISH / (13 + Math.random() * 5),
        done: false,
      };
    });
    me = runners.filter(function (r) { return r.animal === mine; })[0];
    draw();
    BabyGames.countdown(go);
  }

  function go() {
    state = 'run';
    BabyGames.sound('whistle');
    BabyGames.music('carrera'); // una de las tres canciones de carrera, cada vez otra
    runners.forEach(function (r) { r.body.classList.add('run'); });
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function draw() {
    runners.forEach(function (r) {
      // Al llegar, la nariz del animal toca la meta (a un 96 % del carril).
      var goal = r.lane.clientWidth * 0.96 - r.el.offsetWidth * 0.7;
      r.el.style.transform = 'translateX(' + Math.max(0, r.pos / FINISH * goal) + 'px)';
    });
  }

  function tick(now) {
    // Si la pestaña estuvo oculta, no se recupera de golpe el tiempo perdido.
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    runners.forEach(function (r) {
      if (r.done) return;
      var extra = Math.min(r.boost, dt * 0.35);
      r.boost -= extra;
      r.pos += r.speed * dt + extra;
      if (r.pos >= FINISH) arrive(r);
    });
    draw();
    if (state === 'run' || state === 'end') raf = requestAnimationFrame(tick);
  }

  function arrive(r) {
    r.pos = FINISH;
    r.done = true;
    finishedCount++;
    r.body.classList.remove('run');
    var badge = document.createElement('div');
    badge.className = 'place';
    badge.textContent = ['🥇', '🥈', '🥉', '🎖️'][finishedCount - 1];
    r.lane.appendChild(badge);
    if (r === me) {
      r.place = finishedCount;
      BabyGames.sound('cheer');
      BabyGames.sound(finishedCount === 1 ? 'star' : 'pop');
      var b = r.el.getBoundingClientRect();
      A.sparkle(b.left + b.width / 2, b.top + b.height / 2, 18);
    }
    if (r === me) {
      state = 'end'; // los demás siguen corriendo hasta que sale la tarjeta
      setTimeout(end, 900);
    }
  }

  function end() {
    state = 'over';
    cancelAnimationFrame(raf);
    BabyGames.musicStop();
    var first = me.place === 1;
    BabyGames.endScreen({
      emoji: first ? '🏆' : '🏅',
      title: first ? '¡Has ganado!' : '¡Muy bien!',
      detail: first ? '🥇 ¡Primer puesto!' : '¡Has llegado a la meta!',
      say: first ? '¡Has ganado! ¡Qué rápido!' : '¡Muy bien! ¡Has llegado a la meta!',
      onRestart: showPick,
    });
  }

  // Cualquier toque empuja a tu animal.
  document.addEventListener('pointerdown', function (e) {
    if (state !== 'run' || !me || me.done) return;
    e.preventDefault();
    me.boost += TAP_BOOST;
    BabyGames.sound('step');
  });

  window.addEventListener('resize', draw);
  showPick();
})();
