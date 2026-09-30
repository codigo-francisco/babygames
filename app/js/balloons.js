// Minijuego del anfitrión: globos que suben por el menú y se explotan al tocarlos.

const COLORS = ['#ff5277', '#ffb300', '#00c853', '#2979ff', '#aa00ff', '#ff6d00', '#00b8d4'];
const MAX_BALLOONS = 3;

export function createBalloons(layer, { onPop }) {
  let timer = null;
  let popStep = 0;

  function spawn() {
    if (layer.childElementCount >= MAX_BALLOONS) return;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.min(innerWidth, innerHeight) * (0.1 + Math.random() * 0.05);
    const x = Math.random() * (innerWidth - size);

    const rise = document.createElement('div');
    rise.className = 'balloon-rise';
    rise.style.left = `${x}px`;
    rise.style.setProperty('--size', `${size}px`);

    const balloon = document.createElement('button');
    balloon.className = 'balloon';
    balloon.type = 'button';
    balloon.tabIndex = -1;
    balloon.setAttribute('aria-label', 'Globo');
    balloon.style.setProperty('--color', color);
    balloon.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
    rise.appendChild(balloon);
    layer.appendChild(rise);

    const anim = rise.animate(
      [{ transform: 'translateY(0)' }, { transform: `translateY(${-(innerHeight + size * 3)}px)` }],
      { duration: 9000 + Math.random() * 5000, easing: 'linear' }
    );
    anim.onfinish = () => rise.remove();

    balloon.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const r = balloon.getBoundingClientRect();
      anim.pause();
      balloon.classList.add('popped');
      setTimeout(() => rise.remove(), 220);
      onPop({ x: r.left + r.width / 2, y: r.top + r.height / 2, color, step: popStep++ });
    });
  }

  return {
    start() {
      if (timer) return;
      spawn();
      timer = setInterval(spawn, 3500);
    },
    stop() {
      clearInterval(timer);
      timer = null;
      layer.replaceChildren();
    },
  };
}
