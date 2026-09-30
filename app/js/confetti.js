// Confeti a pantalla completa en un <canvas> superpuesto.

const COLORS = ['#ff5277', '#ffd54f', '#69f0ae', '#40c4ff', '#b388ff', '#ff9f1c'];

let canvas = null;
let pieces = [];
let running = false;

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement('canvas');
  canvas.className = 'confetti-layer';
  document.body.appendChild(canvas);
  return canvas;
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

function frame() {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, innerWidth, innerHeight);
  pieces = pieces.filter((p) => p.y < innerHeight + 40);
  for (const p of pieces) {
    p.vy += 0.25;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    g.save();
    g.translate(p.x, p.y);
    g.rotate(p.rot);
    g.fillStyle = p.color;
    if (p.round) {
      g.beginPath();
      g.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    g.restore();
  }
  if (pieces.length) requestAnimationFrame(frame);
  else running = false;
}

// Lanza confeti desde (x, y); por defecto desde el centro.
export function burst(x = innerWidth / 2, y = innerHeight / 2, count = 120) {
  ensureCanvas();
  resize();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    pieces.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 8 + Math.random() * 10,
      color: COLORS[i % COLORS.length],
      round: Math.random() < 0.3,
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}
