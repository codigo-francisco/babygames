// Vehículos: coche, tren, avión, barco y camión de bomberos. Al tocar uno hace
// su sonido, Bubu dice su nombre y se va por la derecha; luego vuelve a entrar
// por la izquierda. Cuando los cinco han hecho su viaje, fin de partida (se
// pueden seguir tocando mientras tanto, sin contar).
(function () {
  var INK = window.BabyAnimals.ink;
  var world = document.getElementById('world');

  function eye(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="' + (x + 2) + '" cy="' + (y + 1) + '" r="5" fill="' + INK + '"/>' +
      '<circle cx="' + (x + 4) + '" cy="' + (y - 2) + '" r="1.8" fill="#fff"/>';
  }

  function wheel(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#37474f" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r * 0.4 + '" fill="#cfd8dc"/>';
  }

  var S = ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"';

  // Dibujos de 200x140 mirando a la derecha.
  var VEHICLES = [
    {
      id: 'coche', name: 'el coche', x: 52, y: 66, w: 28,
      art: '<path d="M14 98 V74 Q14 62 28 60 L56 56 L80 30 H136 Q148 30 156 42 L170 60 Q188 62 188 78 V98 Z" fill="#ef5350"' + S + '/>' +
        '<path d="M64 58 L84 36 H108 V58 Z" fill="#b3e5fc"' + S + '/><path d="M118 58 V36 H134 Q142 36 148 46 L156 58 Z" fill="#b3e5fc"' + S + '/>' +
        eye(130, 47) + eye(146, 49) + '<circle cx="184" cy="76" r="6" fill="#fff59d"/>' + wheel(54, 100, 20) + wheel(150, 100, 20),
    },
    {
      id: 'bomberos', name: 'el camión de bomberos', x: 80, y: 64, w: 32,
      art: '<rect x="10" y="50" width="120" height="50" rx="6" fill="#e53935"' + S + '/>' +
        '<path d="M130 100 V44 Q130 34 140 34 H160 Q172 34 178 48 L190 70 V100 Z" fill="#e53935"' + S + '/>' +
        '<path d="M142 44 H160 Q166 44 170 52 L178 66 H142 Z" fill="#b3e5fc"' + S + '/>' +
        '<path d="M20 40 H124 M20 28 H124 M30 28 V40 M50 28 V40 M70 28 V40 M90 28 V40 M110 28 V40" stroke="#eceff1" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="146" y="22" width="18" height="12" rx="4" fill="#40c4ff"' + S + '/>' +
        '<rect x="24" y="62" width="30" height="24" rx="4" fill="#ffcdd2"' + S + '/><rect x="70" y="62" width="40" height="8" rx="4" fill="#fff59d"/>' +
        eye(152, 58) + eye(168, 60) + wheel(40, 104, 18) + wheel(100, 104, 18) + wheel(160, 104, 18),
    },
    {
      id: 'tren', name: 'el tren', x: 22, y: 64, w: 32,
      art: '<circle cx="138" cy="14" r="10" fill="#eceff1"/><circle cx="122" cy="6" r="7" fill="#eceff1"/>' +
        '<rect x="128" y="24" width="20" height="30" rx="3" fill="#455a64"' + S + '/>' +
        '<rect x="10" y="22" width="70" height="78" rx="6" fill="#43a047"' + S + '/>' +
        '<rect x="22" y="34" width="46" height="30" rx="5" fill="#b3e5fc"' + S + '/>' +
        '<path d="M80 54 H176 Q190 54 190 68 V100 H80 Z" fill="#2e7d32"' + S + '/>' +
        '<rect x="4" y="14" width="82" height="12" rx="5" fill="#c62828"' + S + '/>' +
        '<path d="M190 100 L200 112 H180 Z" fill="#fbc02d"' + S + '/>' +
        eye(160, 74) + eye(178, 76) + wheel(40, 104, 18) + wheel(104, 106, 16) + wheel(148, 106, 16),
    },
    {
      id: 'avion', name: 'el avión', x: 56, y: 22, w: 30,
      art: '<path d="M30 70 Q20 70 14 30 H34 L56 60 Z" fill="#1e88e5"' + S + '/>' +
        '<path d="M24 64 H160 Q192 64 192 80 Q192 96 160 96 H40 Q24 96 24 80 Z" fill="#f5f5f5"' + S + '/>' +
        '<path d="M80 80 L118 80 L84 126 H66 Z" fill="#1e88e5"' + S + '/>' +
        '<circle cx="70" cy="76" r="5" fill="#81d4fa"/><circle cx="90" cy="76" r="5" fill="#81d4fa"/><circle cx="110" cy="76" r="5" fill="#81d4fa"/><circle cx="130" cy="76" r="5" fill="#81d4fa"/>' +
        eye(160, 76) + eye(176, 78),
    },
    {
      id: 'barco', name: 'el barco', x: 30, y: 88, w: 26,
      art: '<rect x="70" y="20" width="22" height="34" rx="3" fill="#e53935"' + S + '/><rect x="70" y="26" width="22" height="8" fill="#fff"/>' +
        '<rect x="44" y="50" width="96" height="30" rx="6" fill="#fff"' + S + '/>' +
        '<circle cx="64" cy="65" r="7" fill="#81d4fa"' + S + '/><circle cx="92" cy="65" r="7" fill="#81d4fa"' + S + '/>' +
        '<path d="M8 80 H192 L170 124 H34 Z" fill="#ff7043"' + S + '/>' +
        eye(132, 98) + eye(150, 99),
    },
  ];

  var done = {};
  var count = 0;
  var playing = true;

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function build() {
    VEHICLES.forEach(function (v) {
      var el = document.createElement('div');
      el.className = 'vehicle';
      el.dataset.id = v.id;
      el.style.setProperty('--x', v.x + 'vw');
      el.style.setProperty('--y', v.y + 'vh');
      el.style.setProperty('--w', v.w + 'vmin');
      el.innerHTML = '<div class="bounce"><svg viewBox="0 0 200 140" aria-hidden="true">' + v.art + '</svg></div>' +
        '<div class="name">' + cap(v.name) + '</div><div class="star">⭐</div>';
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        go(v, el);
      });
      world.appendChild(el);
      v.el = el;
    });
  }

  function go(v, el) {
    if (v.moving) return;
    v.moving = true;
    BabyGames.sound('vehicle', v.id);
    BabyGames.say(cap(v.name));
    el.classList.add('talk', 'hop');
    var r = el.getBoundingClientRect();
    // Pequeña pausa para que se vea el salto y luego se va por la derecha.
    setTimeout(function () {
      el.classList.remove('talk', 'hop');
      el.style.transform = 'translateX(' + (innerWidth - r.left + 20) + 'px)';
    }, 700);
    // Ya fuera, aparece por la izquierda sin transición y entra frenando.
    setTimeout(function () {
      el.classList.add('jump');
      el.style.transform = 'translateX(' + -(r.right + 20) + 'px)';
      void el.offsetWidth;
      el.classList.remove('jump');
      el.classList.add('enter');
      el.style.transform = '';
    }, 2100);
    setTimeout(function () {
      el.classList.remove('enter');
      v.moving = false;
      if (!playing || done[v.id]) return;
      done[v.id] = true;
      el.classList.add('done');
      BabyGames.sound('star');
      count++;
      if (count === VEHICLES.length) finish();
    }, 3500);
  }

  function finish() {
    playing = false;
    setTimeout(function () {
      BabyGames.endScreen({
        emoji: '🚗',
        title: '¡Todos de viaje!',
        say: '¡Muy bien! ¡Todos los vehículos han hecho su viaje!',
        onRestart: start,
      });
    }, 600);
  }

  function start() {
    done = {};
    count = 0;
    playing = true;
    VEHICLES.forEach(function (v) { v.el.classList.remove('done'); });
    BabyGames.say('¡Toca los coches, el tren y el avión!');
  }

  build();
  BabyGames.music('vehiculos');
  start();
})();
