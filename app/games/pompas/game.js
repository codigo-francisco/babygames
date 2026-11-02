// Pompas: pompas de jabón que suben despacio. Se explotan con el dedo (con
// varios dedos a la vez) y algunas llevan un animal dentro que sale saltando y
// hace su sonido. A las 15 pompas, fin de partida y "¡Otra vez!".
(function () {
  var A = window.BabyAnimals;
  var sky = document.getElementById('sky');
  var dots = document.getElementById('dots');
  var GOAL = 15;
  var MAX = 6;
  var pompas = [];
  var popped = 0;
  var playing = false;
  var spawnTimer = 0;
  var last = 0;

  function vmin() { return Math.min(innerWidth, innerHeight) / 100; }

  function buildDots() {
    dots.innerHTML = '';
    for (var i = 0; i < GOAL; i++) dots.appendChild(document.createElement('span'));
  }

  // y (opcional): altura de salida; por defecto, justo debajo de la pantalla.
  function spawn(y) {
    if (!playing || pompas.length >= MAX) return;
    var size = (22 + Math.random() * 10) * vmin();
    var el = document.createElement('div');
    el.className = 'pompa';
    el.style.setProperty('--s', size + 'px');
    el.style.setProperty('--h', Math.floor(Math.random() * 360));
    // Una de cada tres lleva un animal dentro.
    var animal = Math.random() < 0.34 ? A.list[Math.floor(Math.random() * A.list.length)] : null;
    if (animal) el.innerHTML = '<div class="pic">' + A.svg(animal) + '</div>';
    var p = {
      el: el,
      animal: animal,
      size: size,
      // Repartidas a lo ancho, dejando libre la esquina de la casita.
      x0: size / 2 + 10 * vmin() + Math.random() * (innerWidth - size - 14 * vmin()),
      y: y || innerHeight + size / 2,
      speed: (7 + Math.random() * 5) * vmin(), // px por segundo
      phase: Math.random() * Math.PI * 2,
    };
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pop(p, e);
    });
    sky.appendChild(el);
    pompas.push(p);
    place(p, 0);
  }

  function place(p, t) {
    var x = p.x0 + Math.sin(t / 900 + p.phase) * 4 * vmin();
    p.el.style.transform = 'translate(' + (x - p.size / 2) + 'px,' + (p.y - p.size / 2) + 'px)';
    p.x = x;
  }

  function remove(p) {
    var i = pompas.indexOf(p);
    if (i >= 0) pompas.splice(i, 1);
  }

  function tick(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    pompas.slice().forEach(function (p) {
      p.y -= p.speed * dt;
      place(p, t);
      // Si se escapa por arriba, vuelve a salir otra por abajo.
      if (p.y < -p.size / 2) {
        p.el.remove();
        remove(p);
      }
    });
    requestAnimationFrame(tick);
  }

  function pop(p, e) {
    if (!playing || p.popped) return;
    p.popped = true;
    remove(p);
    BabyGames.sound('pop', popped);
    A.sparkle(e.clientX, e.clientY, 10);
    p.el.classList.add('pop');
    setTimeout(function () { p.el.remove(); }, 300);
    if (p.animal) {
      var free = document.createElement('div');
      free.className = 'free';
      free.style.left = p.x + 'px';
      free.style.top = Math.max(15 * vmin(), p.y) + 'px';
      free.innerHTML = A.svg(p.animal);
      sky.appendChild(free);
      setTimeout(function () { free.remove(); }, 1700);
      setTimeout(function () { BabyGames.sound('animal', p.animal.id); }, 150);
    }
    dots.children[popped].classList.add('on');
    popped++;
    if (popped === GOAL) finish();
    else spawn();
  }

  function finish() {
    playing = false;
    clearInterval(spawnTimer);
    setTimeout(function () {
      BabyGames.endScreen({
        emoji: '🧼',
        title: '¡Todas las pompas!',
        say: '¡Muy bien! ¡Has explotado todas las pompas!',
        onRestart: start,
      });
    }, 900);
  }

  function start() {
    pompas.forEach(function (p) { p.el.remove(); });
    pompas = [];
    popped = 0;
    buildDots();
    playing = true;
    // Que haya pompas a la vista desde el primer momento.
    spawn(innerHeight * 0.5);
    spawn(innerHeight * 0.8);
    spawn();
    clearInterval(spawnTimer);
    spawnTimer = setInterval(function () { spawn(); }, 1100);
  }

  BabyGames.music('pompas');
  start();
  requestAnimationFrame(tick);
})();
