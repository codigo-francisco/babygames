// Baño: un animal lleno de barro en la bañera. Al frotar con el dedo (la
// esponja) sale espuma y el barro se borra. Cuando queda casi limpio, el animal
// salta contento y hace su sonido. Tres animales limpios = fin de partida.
(function () {
  var A = window.BabyAnimals;
  var stage = document.getElementById('stage');
  var pic = document.getElementById('pic');
  var canvas = document.getElementById('mud');
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var dots = document.getElementById('dots');
  var ask = document.getElementById('ask');
  var sponge = document.getElementById('sponge');
  var GOAL = 3;
  var CLEAN_AT = 0.2; // limpio cuando queda menos del 20 % del barro
  var animals = [];
  var current = null;
  var cleaned = 0;
  var busy = true;
  var mudStart = 1;
  var strokes = 0;
  var last = null;
  var lastScrub = 0;

  function size() {
    var r = stage.getBoundingClientRect();
    canvas.width = Math.round(r.width);
    canvas.height = Math.round(r.height);
    return r.width;
  }

  // Manchas de barro repartidas por la cara del animal.
  function paintMud() {
    var w = size();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, w);
    for (var i = 0; i < 16; i++) {
      var a = Math.random() * Math.PI * 2;
      var d = Math.random() * w * 0.3;
      var x = w / 2 + Math.cos(a) * d;
      var y = w * 0.52 + Math.sin(a) * d;
      var r = w * (0.08 + Math.random() * 0.07);
      ctx.fillStyle = ['#6d4c41', '#795548', '#5d4037'][i % 3];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Salpicaduras pequeñas alrededor.
      ctx.beginPath();
      ctx.arc(x + r * 0.9, y - r * 0.6, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    mudStart = mudLeft(true);
  }

  // Cuenta (muestreando) cuántos píxeles de barro quedan.
  function mudLeft(raw) {
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var n = 0;
    for (var i = 3; i < data.length; i += 4 * 9) if (data[i] > 40) n++;
    return raw ? n : n / mudStart;
  }

  function point(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }

  function erase(from, to) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineWidth = canvas.width * 0.16;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  function foam(x, y) {
    var f = document.createElement('div');
    f.className = 'foam';
    f.style.left = x + 'px';
    f.style.top = y + 'px';
    f.style.setProperty('--s', (3 + Math.random() * 4) + 'vmin');
    f.style.setProperty('--dx', (Math.random() * 10 - 5) + 'vmin');
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 1000);
  }

  function rub(e) {
    sponge.hidden = false;
    sponge.style.left = e.clientX + 'px';
    sponge.style.top = e.clientY + 'px';
    if (busy) return;
    var p = point(e);
    erase(last || p, p);
    last = p;
    var now = performance.now();
    if (now - lastScrub > 140) {
      lastScrub = now;
      BabyGames.sound('scrub');
      foam(e.clientX, e.clientY);
    }
    if (++strokes % 8 === 0 && mudLeft() < CLEAN_AT) clean();
  }

  stage.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    last = null;
    rub(e);
  });
  stage.addEventListener('pointermove', function (e) {
    if (e.buttons || e.pointerType === 'touch') rub(e);
  });
  function stop() {
    last = null;
    sponge.hidden = true;
  }
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  stage.addEventListener('lostpointercapture', stop);

  function clean() {
    busy = true;
    // Lo que queda de barro se va de golpe.
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sponge.hidden = true;
    BabyGames.sound('splash');
    pic.classList.remove('hop');
    void pic.offsetWidth;
    pic.classList.add('hop');
    var r = stage.getBoundingClientRect();
    A.sparkle(r.left + r.width / 2, r.top + r.height / 2, 20);
    setTimeout(function () { BabyGames.sound('animal', current.id); }, 500);
    setTimeout(function () { BabyGames.say('¡Qué limpio está ' + A.named(current) + '!'); }, 1400);
    ask.innerHTML = '<span class="bubble">¡Limpio! ✨</span>';
    dots.children[cleaned].classList.add('on');
    cleaned++;
    setTimeout(function () {
      if (cleaned === GOAL) finish();
      else next();
    }, 3600);
  }

  function next() {
    current = animals[cleaned];
    pic.classList.remove('hop');
    pic.innerHTML = A.svg(current);
    paintMud();
    strokes = 0;
    busy = false;
    ask.innerHTML = '<span class="bubble">¡Frota, frota! 🧽</span>';
    BabyGames.say('¡' + cap(A.named(current)) + ' está lleno de barro! ¡Frota, frota!');
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function finish() {
    BabyGames.endScreen({
      emoji: '🛁',
      title: '¡Todos limpios!',
      say: '¡Muy bien! ¡Todos los animales están limpios!',
      onRestart: start,
    });
  }

  function start() {
    animals = A.shuffle(A.list).slice(0, GOAL);
    cleaned = 0;
    dots.innerHTML = '';
    for (var i = 0; i < GOAL; i++) dots.appendChild(document.createElement('span'));
    next();
  }

  BabyGames.music('calma');
  // Espera a que la página tenga tamaño para pintar el barro.
  requestAnimationFrame(start);
})();
