// Burbujas 100 % táctil: al tocar o arrastrar el dedo se apunta hacia él y al
// levantarlo se dispara. Al terminar, un toque empieza otra partida.
// Nítido en pantallas de alta resolución: el canvas se dibuja a su tamaño real
// y las burbujas son vectoriales (el sprite original es de 40 px).
(function () {
  var viewport = document.getElementById('viewport');
  if (viewport) BabyGames.sharpCanvas(viewport);

  BabyGames.touchToMouse({
    match: function (target) { return target.id === 'viewport' ? target : null; },
    map: {
      touchstart: 'mousemove',
      touchmove: 'mousemove',
      touchend: ['mousemove', 'mousedown'],
      touchcancel: [],
    },
  });

  // Mismos colores y orden que bubble-sprites.png.
  var COLORS = [
    ['#ff8a80', '#e53935', '#8e0000'],
    ['#b9f6ca', '#43a047', '#1b5e20'],
    ['#82b1ff', '#1e63d6', '#0d2f73'],
    ['#fff59d', '#f9d000', '#9e7c00'],
    ['#ff80ab', '#d81b8c', '#7a0048'],
    ['#a7ffeb', '#00acc1', '#005662'],
    ['#ffffff', '#cfd8dc', '#78909c'],
  ];

  // Llamada desde drawBubble (parche de games.json).
  window.drawBabyBubble = function (ctx, x, y, size, index) {
    var c = COLORS[index % COLORS.length];
    var r = size / 2;
    var cx = x + r;
    var cy = y + r;
    var grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    grad.addColorStop(0, c[0]);
    grad.addColorStop(0.55, c[1]);
    grad.addColorStop(1, c[2]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = r * 0.06;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.stroke();
    // Brillo
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.32, cy - r * 0.38, r * 0.28, r * 0.17, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();
  };
})();
