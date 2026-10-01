// Utilidades comunes para que los juegos funcionen 100 % con el dedo dentro de
// BabyGames. Se carga antes de app/overrides/<id>.js en todos los juegos.
(function () {
  var TO_MOUSE = { touchstart: 'mousedown', touchmove: 'mousemove', touchend: 'mouseup', touchcancel: 'mouseup' };

  function sendMouse(target, type, touch) {
    target.dispatchEvent(new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      button: 0,
      buttons: type === 'mouseup' ? 0 : 1,
    }));
  }

  function findTouch(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].identifier === id) return list[i];
    return null;
  }

  // Convierte los toques en eventos de ratón para juegos que solo entienden ratón.
  //   match(target) -> elemento que recibe los eventos (o null para ignorar el toque)
  //   map           -> tipo de toque -> tipo(s) de ratón (por defecto down/move/up)
  // Solo sigue al primer dedo; los demás se ignoran.
  function touchToMouse(options) {
    var map = options.map || TO_MOUSE;
    var active = null;
    var activeId = null;

    Object.keys(TO_MOUSE).forEach(function (type) {
      window.addEventListener(type, function (e) {
        var touch;
        if (type === 'touchstart') {
          if (active) { e.preventDefault(); return; }
          var target = options.match(e.target);
          if (!target) return;
          touch = e.changedTouches[0];
          active = target;
          activeId = touch.identifier;
        } else {
          if (!active) return;
          touch = findTouch(e.changedTouches, activeId);
          if (!touch) return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
        var target2 = active;
        [].concat(map[type]).forEach(function (mouseType) { sendMouse(target2, mouseType, touch); });
        if (type === 'touchend' || type === 'touchcancel') { active = null; activeId = null; }
      }, { capture: true, passive: false });
    });
  }

  // Llama a fn con cualquier toque o clic en la pantalla (antes que el juego).
  function onTap(fn) {
    document.addEventListener('pointerdown', fn, true);
  }

  // Cartel animado "¡Toca para jugar!" (no es un botón: se toca cualquier sitio).
  function tapHint(text) {
    var el = document.createElement('div');
    el.className = 'bg-tap-hint';
    el.textContent = text || '¡Toca para jugar!';
    (document.body || document.documentElement).appendChild(el);
    return {
      show: function () { el.hidden = false; },
      hide: function () { el.hidden = true; },
    };
  }

  // Voz y sonidos del anfitrión (app/js/sounds.js). Si el juego se abre suelto,
  // sin BabyGames alrededor, no hacen nada.
  function host() {
    try { return window.parent !== window ? window.parent.BabyGamesHost : null; } catch (e) { return null; }
  }

  function say(text) {
    var h = host();
    if (h) h.say(text);
  }

  function sound(name) {
    var h = host();
    if (h && h.sfx[name]) h.sfx[name]();
  }

  // Capa a pantalla completa que se traga los toques (el juego no los recibe).
  // Fuera de <body>: algunos juegos escalan el body con zoom y no debe afectar.
  function overlay(className) {
    var el = document.createElement('div');
    el.className = className;
    ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(function (type) {
      el.addEventListener(type, function (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }, { passive: false });
    });
    document.documentElement.appendChild(el);
    return el;
  }

  // Cuenta atrás 3, 2, 1… ¡Ya! a pantalla completa; después llama a onDone.
  function countdown(onDone) {
    var steps = ['3', '2', '1', '¡Ya!'];
    var el = overlay('bg-countdown');
    var i = 0;
    (function next() {
      if (i === steps.length) {
        el.remove();
        if (onDone) onDone();
        return;
      }
      var last = i === steps.length - 1;
      el.innerHTML = '<span>' + steps[i] + '</span>';
      sound(last ? 'go' : 'count');
      i++;
      setTimeout(next, last ? 600 : 800);
    })();
  }

  // Tarjeta de fin de partida con un botón grande para volver a jugar.
  //   { emoji, title, detail, say, onRestart }
  function endScreen(opts) {
    var el = overlay('bg-end');
    var card = document.createElement('div');
    card.className = 'bg-end-card';
    [['bg-end-emoji', opts.emoji], ['bg-end-title', opts.title], ['bg-end-detail', opts.detail]].forEach(function (part) {
      if (!part[1]) return;
      var p = document.createElement('div');
      p.className = part[0];
      p.textContent = part[1];
      card.appendChild(p);
    });
    var again = document.createElement('div');
    again.className = 'bg-end-again';
    again.textContent = '🔄 ¡Otra vez!';
    card.appendChild(again);
    el.appendChild(card);

    sound('fanfare');
    if (opts.say) say(opts.say);

    // Un momento sin atender toques: el último golpe del juego no debe reiniciar.
    var ready = false;
    setTimeout(function () { ready = true; el.classList.add('ready'); }, 1000);
    again.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!ready) return;
      el.remove();
      if (opts.onRestart) opts.onRestart();
    });
  }

  // Dibuja un canvas de tamaño fijo (p. ej. 628x628) a la resolución real de la
  // pantalla para que no se vea borroso al estirarlo. El juego sigue viendo su
  // tamaño lógico en canvas.width/height; el escalado lo hace la transformación.
  function sharpCanvas(canvas) {
    var proto = HTMLCanvasElement.prototype;
    var realWidth = Object.getOwnPropertyDescriptor(proto, 'width');
    var realHeight = Object.getOwnPropertyDescriptor(proto, 'height');
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width) return; // aún sin maquetar: lo repite el ResizeObserver
      var s = Math.max(1, (rect.width * (window.devicePixelRatio || 1)) / w);
      realWidth.set.call(canvas, Math.round(w * s));
      realHeight.set.call(canvas, Math.round(h * s));
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.imageSmoothingQuality = 'high';
    }

    Object.defineProperty(canvas, 'width', {
      configurable: true,
      get: function () { return w; },
      set: function (v) { w = v; resize(); },
    });
    Object.defineProperty(canvas, 'height', {
      configurable: true,
      get: function () { return h; },
      set: function (v) { h = v; resize(); },
    });
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    window.addEventListener('resize', resize); // también cambia devicePixelRatio
  }

  window.BabyGames = {
    touchToMouse: touchToMouse,
    onTap: onTap,
    tapHint: tapHint,
    say: say,
    sound: sound,
    countdown: countdown,
    endScreen: endScreen,
    sharpCanvas: sharpCanvas,
  };
})();
