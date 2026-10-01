/**
 * 🎈 宝宝快乐方块乐园 - 幼儿专属游戏逻辑 (超大糖果方块 + 60FPS 粒子消除 + 中文亲子夸奖)
 * 特性：
 * 1. 动态自适应超大糖果方格 (支持 3~16列 x 4~24行 自定义)，极具视觉冲击力与趣味性
 * 2. 25种精心设计的纯粹直观方块组合 (单糖、双糖、长条、拐角、经典俄罗斯、超能5格)
 * 3. 全平台操控支持：键盘4方向键 / 触屏拖拽滑动 / 屏幕紧凑十字按键点按
 * 4. 内置 Web Audio API 亲和童趣合成音效 (小水滴、果冻落地、连击进阶和弦、八音盒欢呼)
 * 5. Web Speech API 中文真人智能夸奖系统 (支持 iOS Safari、Android、Windows、Mac)
 * 6. 炫酷 60FPS Canvas 粒子爆炸与横向激光光束切割特效
 * 7. 连击奖励系统 (Combo Streak) 与永不挫败的欢乐通关结算机制
 */

// ======================== 炫酷粒子动画引擎 (Canvas 60FPS GPU加速版) ========================
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.shockwaves = [];
    this.lasers = [];
    this.animating = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // 最高 2x，避免 3x 高分屏过度绘制
    this.resize();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  // 触发横向彩虹激光切割光效
  createLaser(y) {
    this.lasers.push({
      y: y,
      progress: 0,
      alpha: 1,
      height: 36
    });
    this.startLoop();
  }

  // 触发单格方块的超高能爆炸粒子（碎块晶体、四角星、光环、萌表情浮尘）
  createBlockExplosion(x, y, colorIndex, blockSize, themeName) {
    const palette = this.getColorPalette(colorIndex);

    // 1. 冲击波双光环 (Dual Shockwave Rings)
    this.shockwaves.push({
      x, y,
      radius: 6,
      maxRadius: Math.max(40, blockSize * 1.3),
      color: palette[0],
      alpha: 1,
      lineWidth: 7
    });

    this.shockwaves.push({
      x, y,
      radius: 2,
      maxRadius: Math.max(25, blockSize * 0.8),
      color: '#ffffff',
      alpha: 0.9,
      lineWidth: 4
    });

    // 2. 糖果彩色晶体碎屑
    const shardCount = 12;
    for (let i = 0; i < shardCount; i++) {
      const angle = (Math.PI * 2 / shardCount) * i + (Math.random() - 0.5) * 0.7;
      const speed = Math.random() * 7.0 + 3.5;
      const color = palette[Math.floor(Math.random() * palette.length)];
      this.particles.push({
        type: 'shard',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        gravity: 0.26,
        drag: 0.96,
        size: Math.random() * 9 + 6,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.022 + 0.018,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        shape: Math.random() > 0.4 ? 'diamond' : 'square'
      });
    }

    // 3. 四角星芒
    const starCount = 8;
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6.0 + 3.0;
      this.particles.push({
        type: 'star',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.0,
        gravity: 0.14,
        drag: 0.98,
        size: Math.random() * 11 + 7,
        color: '#ffffff',
        glowColor: palette[1] || '#ffeaa7',
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25
      });
    }

    // 4. 可爱主题微粒与萌动表情
    const themeParticleEmojis = {
      candy: ['🍬', '🍭', '🍓', '🧁', '🍦', '🍩', '💖', '⭐', '🎈', '🎉', '🦄', '🍪'],
      space: ['⭐', '✨', '🚀', '🪐', '🛸', '☄️', '🌟', '👾', '💫', '🎆', '🛰️', '💎'],
      forest: ['🍃', '🍀', '🌸', '🍄', '🌰', '🍎', '🌻', '🦋', '✨', '🎉', '🐝', '🌿']
    };
    const emojis = themeParticleEmojis[themeName] || themeParticleEmojis.candy;
    const emojiCount = 2;
    for (let i = 0; i < emojiCount; i++) {
      this.particles.push({
        type: 'emoji',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -Math.random() * 4.5 - 3.0,
        gravity: 0.1,
        drag: 0.99,
        size: 20,
        alpha: 1,
        decay: 0.02,
        scale: 0.5,
        maxScale: 1.3
      });
    }

    this.startLoop();
  }

  getColorPalette(idx) {
    const palettes = {
      1:  ['#ff5277', '#ff7597', '#ff9ff3', '#ffffff'],
      2:  ['#ff9f1a', '#ffb84d', '#ffd32a', '#ffffff'],
      3:  ['#ffc048', '#ffdd59', '#fff200', '#ffffff'],
      4:  ['#2ed573', '#55e691', '#7bed9f', '#ffffff'],
      5:  ['#00d2d3', '#48dbfb', '#70a1ff', '#ffffff'],
      6:  ['#9b59b6', '#b677d0', '#c56cf0', '#ffffff'],
      7:  ['#e17055', '#fab1a0', '#ffeaa7', '#ffffff'],
      8:  ['#ff4757', '#2ed573', '#ff6b81', '#ffffff'],
      9:  ['#e056fd', '#be2edd', '#f368e0', '#ffffff'],
      10: ['#48dbfb', '#1dd1a1', '#10ac84', '#ffffff'],
      11: ['#e67e22', '#d35400', '#f39c12', '#ffffff'],
      12: ['#ff9ff3', '#f368e0', '#ff6b81', '#ffffff'],
      13: ['#54a0ff', '#2e86de', '#70a1ff', '#ffffff'],
      14: ['#feca57', '#ff9f43', '#fff200', '#ffffff'],
      15: ['#1dd1a1', '#10ac84', '#55e691', '#ffffff'],
      16: ['#ee5253', '#ff6b6b', '#ff7675', '#ffffff']
    };
    return palettes[idx] || ['#ff4757', '#ffa502', '#2ed573', '#ffffff'];
  }

  startLoop() {
    if (!this.animating) {
      this.animating = true;
      requestAnimationFrame(() => this.loop());
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. 渲染横向激光闪光
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.progress += 0.12;
      l.alpha -= 0.06;

      const grad = this.ctx.createLinearGradient(0, l.y, this.width, l.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(255, 235, 59, ${Math.max(0, l.alpha)})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, l.y - l.height / 2, this.width, l.height);

      if (l.alpha <= 0 || l.progress >= 1) {
        this.lasers.splice(i, 1);
      }
    }

    // 2. 渲染冲击波光环
    this.ctx.save();
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 1.2;
      sw.alpha -= 0.045;
      sw.lineWidth = Math.max(1, sw.lineWidth * 0.92);

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = Math.max(0, sw.alpha);
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.shadowColor = sw.color;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
    }
    this.ctx.restore();

    // 3. 渲染炫彩碎屑
    this.ctx.save();
    this.ctx.shadowBlur = 0;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy = (p.vy + p.gravity) * p.drag;
      p.alpha -= p.decay;
      p.rot += p.rotSpeed || 0;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'shard') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = p.color;
        if (p.shape === 'diamond') {
          this.ctx.beginPath();
          this.ctx.moveTo(0, -p.size);
          this.ctx.lineTo(p.size * 0.7, 0);
          this.ctx.lineTo(0, p.size);
          this.ctx.lineTo(-p.size * 0.7, 0);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        this.ctx.restore();
      } else if (p.type === 'star') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.alpha * 0.3);
        this.ctx.fillStyle = p.glowColor;
        this.drawStar(this.ctx, 0, 0, 4, p.size * 1.4, p.size * 0.6);
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.drawStar(this.ctx, 0, 0, 4, p.size, p.size * 0.4);
        this.ctx.restore();
      } else if (p.type === 'emoji') {
        if (p.scale < p.maxScale) p.scale += 0.08;
        this.ctx.font = `${p.size * p.scale}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.emoji, p.x, p.y);
      }
    }
    this.ctx.restore();

    if (this.particles.length > 0 || this.shockwaves.length > 0 || this.lasers.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}


// ======================== 音效合成器 (Web Audio API) ========================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this._gestureReceived = false;
  }

  // 必须由真实用户交互手势解锁 (click, keydown, touchstart, pointerdown)
  unlock() {
    this._gestureReceived = true;
    this.init();
  }

  init() {
    if (!this._gestureReceived) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopBGM();
    } else {
      this.init();
      this.startBGM();
    }
    return this.enabled;
  }

  playMove() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playLand() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.22);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 0.24);
    } catch (e) {}
  }

  playDrop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.16);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  // 消除和弦音效：根据连击 (Combo) 层级动态提升调性与泛音华丽度
  playClear(combo = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const baseChords = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      const pitchMultiplier = 1 + Math.min(0.4, (combo - 1) * 0.08);
      const noteCount = Math.min(baseChords.length, 4 + Math.min(2, combo - 1));

      for (let idx = 0; idx < noteCount; idx++) {
        const freq = baseChords[idx] * pitchMultiplier;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.065;
        const dur = 0.42 + idx * 0.03;

        osc.type = combo > 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.26 / Math.sqrt(noteCount), start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        };

        osc.start(start);
        osc.stop(start + dur);
      }
    } catch (e) {}
  }

  playCheer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + i * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        };

        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch (e) {}
  }

  playMagicReset() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      scale.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + i * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.26, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        };

        osc.start(start);
        osc.stop(start + 0.28);
      });
    } catch (e) {}
  }

  startBGM() {
    if (this.bgmPlaying || !this.enabled) return;
    this.bgmPlaying = true;
    const melody = [
      { f: 523.25, d: 0.4 }, { f: 523.25, d: 0.4 }, { f: 783.99, d: 0.4 }, { f: 783.99, d: 0.4 },
      { f: 880.00, d: 0.4 }, { f: 880.00, d: 0.4 }, { f: 783.99, d: 0.8 },
      { f: 698.46, d: 0.4 }, { f: 698.46, d: 0.4 }, { f: 659.25, d: 0.4 }, { f: 659.25, d: 0.4 },
      { f: 587.33, d: 0.4 }, { f: 587.33, d: 0.4 }, { f: 523.25, d: 0.8 }
    ];
    let step = 0;

    const playNextNote = () => {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      try {
        const item = melody[step % melody.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.f, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + item.d * 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        };

        osc.start(now);
        osc.stop(now + item.d * 0.9);

        step++;
        this.bgmTimer = setTimeout(playNextNote, item.d * 1000);
      } catch (e) {}
    };

    playNextNote();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// ======================== 真实中文真人语音夸奖系统 (Web Speech API) ========================
class VoiceEngine {
  constructor() {
    this.enabled = true;
    this.synth = (typeof window !== 'undefined' && 'speechSynthesis' in window) ? window.speechSynthesis : null;
    this.voice = null;
    this.initVoices();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.initVoices();
    }
  }

  initVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // 广谱智能匹配各大主流操作系统最清甜的中文女声
      this.voice = voices.find(v => (v.lang === 'es-ES' || v.lang === 'es_ES' || v.lang === 'es-MX') && 
        (v.name.includes('Xiaoxiao') || v.name.includes('Yunxi') || v.name.includes('Tingting') || 
         v.name.includes('Yaoyao') || v.name.includes('Huihui') || v.name.includes('Mei-Jia') || 
         v.name.includes('Sin-ji') || v.name.includes('Yu-shu') || v.name.includes('Female')))
        || voices.find(v => (v.lang === 'es-ES' || v.lang === 'es_ES' || v.lang === 'es-MX'))
        || voices.find(v => v.lang && v.lang.startsWith('es'))
        || null;
    } catch (e) {}
  }

  speak(text) {
    if (!this.enabled || !this.synth || !text) return;
    try {
      this.synth.cancel(); // 立即清空未播完的队列，杜绝堆积延迟
      const utter = new SpeechSynthesisUtterance(text);
      if (!this.voice) {
        this.initVoices();
      }
      if (this.voice) utter.voice = this.voice;
      utter.lang = 'es-ES';
      utter.pitch = 1.25; // 甜美亲和幼教音调
      utter.rate = 1.05;  // 活泼语速
      utter.volume = 0.95;
      this.synth.speak(utter);
    } catch (e) {}
  }
}


// ======================== 游戏核心配置 ========================
const DEFAULT_COLS = 6; // 默认6列
const DEFAULT_ROWS = 8; // 默认8行
const SETTINGS_STORAGE_KEY = 'toddler_tetris_settings_v5';

// 3 大主题专属的 16 款丰富方块样式角色素材库 (随主题切换动态变换巨幅图案与专属标识)
const THEME_BLOCK_STYLES = {
  candy: [
    { colorIndex: 1,  emoji: '🐰', name: 'Conejita Fresa', icon: '🐰', badge: '🍓' },
    { colorIndex: 2,  emoji: '🦊', name: 'Zorrito Sol', icon: '🦊', badge: '🍊' },
    { colorIndex: 3,  emoji: '🐥', name: 'Patito Limón', icon: '🐥', badge: '🍋' },
    { colorIndex: 4,  emoji: '🐸', name: 'Rana Verde', icon: '🐸', badge: '👑' },
    { colorIndex: 5,  emoji: '🐧', name: 'Pingüino', icon: '🐧', badge: '🌊' },
    { colorIndex: 6,  emoji: '🐱', name: 'Gatito Uva', icon: '🐱', badge: '🍇' },
    { colorIndex: 7,  emoji: '🐻', name: 'Osito Caramelo', icon: '🐻', badge: '🍪' },
    { colorIndex: 8,  emoji: '🍉', name: 'Polo Sandía', icon: '🍉', badge: '🍧' },
    { colorIndex: 9,  emoji: '🦄', name: 'Poni Arcoíris', icon: '🦄', badge: '🌈' },
    { colorIndex: 10, emoji: '🐼', name: 'Panda Menta', icon: '🐼', badge: '🎋' },
    { colorIndex: 11, emoji: '🍩', name: 'Dónut', icon: '🍩', badge: '🍫' },
    { colorIndex: 12, emoji: '🍭', name: 'Caramelo', icon: '🍭', badge: '🍬' },
    { colorIndex: 13, emoji: '🫐', name: 'Batido', icon: '🫐', badge: '🥤' },
    { colorIndex: 14, emoji: '🍦', name: 'Helado', icon: '🍦', badge: '🍨' },
    { colorIndex: 15, emoji: '🍬', name: 'Gominola', icon: '🍬', badge: '🍒' },
    { colorIndex: 16, emoji: '🧁', name: 'Pastelito', icon: '🧁', badge: '🍰' },
  ],
  space: [
    { colorIndex: 1,  emoji: '🚀', name: 'Cohete', icon: '🚀', badge: '✨' },
    { colorIndex: 2,  emoji: '🪐', name: 'Saturno', icon: '🪐', badge: '💫' },
    { colorIndex: 3,  emoji: '☀️', name: 'Sol', icon: '☀️', badge: '🕶️' },
    { colorIndex: 4,  emoji: '👽', name: 'Marcianito', icon: '👽', badge: '👾' },
    { colorIndex: 5,  emoji: '🌍', name: 'Tierra', icon: '🌍', badge: '🛰️' },
    { colorIndex: 6,  emoji: '🔮', name: 'Cristal', icon: '🔮', badge: '💎' },
    { colorIndex: 7,  emoji: '🌙', name: 'Luna', icon: '🌙', badge: '⭐' },
    { colorIndex: 8,  emoji: '☄️', name: 'Estrella fugaz', icon: '☄️', badge: '🔥' },
    { colorIndex: 9,  emoji: '🛸', name: 'Platillo volante', icon: '🛸', badge: '🟢' },
    { colorIndex: 10, emoji: '🛰️', name: 'Satélite', icon: '🛰️', badge: '📡' },
    { colorIndex: 11, emoji: '🌟', name: 'Estrella', icon: '🌟', badge: '✨' },
    { colorIndex: 12, emoji: '👾', name: 'Monstruito', icon: '👾', badge: '🕹️' },
    { colorIndex: 13, emoji: '🌌', name: 'Galaxia', icon: '🌌', badge: '🌠' },
    { colorIndex: 14, emoji: '👨‍🚀', name: 'Astronauta', icon: '👨‍🚀', badge: '🏳️' },
    { colorIndex: 15, emoji: '🌠', name: 'Destello', icon: '🌠', badge: '⚡' },
    { colorIndex: 16, emoji: '🔭', name: 'Telescopio', icon: '🔭', badge: '🔬' },
  ],
  forest: [
    { colorIndex: 1,  emoji: '🍎', name: 'Manzana', icon: '🍎', badge: '🍃' },
    { colorIndex: 2,  emoji: '🐿️', name: 'Ardilla', icon: '🐿️', badge: '🌰' },
    { colorIndex: 3,  emoji: '🍯', name: 'Miel', icon: '🍯', badge: '🐝' },
    { colorIndex: 4,  emoji: '🍀', name: 'Trébol', icon: '🍀', badge: '🌱' },
    { colorIndex: 5,  emoji: '💧', name: 'Gotita', icon: '💧', badge: '🐟' },
    { colorIndex: 6,  emoji: '🍄', name: 'Seta', icon: '🍄', badge: '🌿' },
    { colorIndex: 7,  emoji: '🌰', name: 'Bellota', icon: '🌰', badge: '🍂' },
    { colorIndex: 8,  emoji: '🥝', name: 'Fruta', icon: '🥝', badge: '🌾' },
    { colorIndex: 9,  emoji: '🦌', name: 'Cervatillo', icon: '🦌', badge: '🌿' },
    { colorIndex: 10, emoji: '🦔', name: 'Erizo', icon: '🦔', badge: '🍁' },
    { colorIndex: 11, emoji: '🦉', name: 'Búho', icon: '🦉', badge: '🌙' },
    { colorIndex: 12, emoji: '🌸', name: 'Flor', icon: '🌸', badge: '🌺' },
    { colorIndex: 13, emoji: '🌻', name: 'Girasol', icon: '🌻', badge: '☀️' },
    { colorIndex: 14, emoji: '🦋', name: 'Mariposa', icon: '🦋', badge: '✨' },
    { colorIndex: 15, emoji: '🫐', name: 'Arándano', icon: '🫐', badge: '🍇' },
    { colorIndex: 16, emoji: '🎋', name: 'Bambú', icon: '🎋', badge: '🎍' },
  ]
};

const THEME_STYLES = THEME_BLOCK_STYLES.candy;

// 方块组合几何形状库 (全套 25 种精选组合，支持独立sí/no与预设切换)
const DEFAULT_SHAPES = [
  // 🌟 1格单糖 & 2格双糖 (极易上手)
  { id: 'shape_1x1', name: '1×1 cuadradito', tag: '1 bloque', category: 'basic', matrix: [[1]], previewColor: 1, previewEmoji: '🐰', weight: 26, enabled: true },
  { id: 'shape_2x1', name: '2×1 tumbado', tag: '2 tumbados', category: 'basic', matrix: [[1, 1]], previewColor: 2, previewEmoji: '🦊', weight: 22, enabled: true },
  { id: 'shape_1x2', name: '1×2 de pie', tag: '2 de pie', category: 'basic', matrix: [[1], [1]], previewColor: 5, previewEmoji: '🐧', weight: 20, enabled: true },

  // 🍬 3格三方糖全系 (横竖条 + 4个拐角方向)
  { id: 'shape_3x1', name: '3×1 tumbado', tag: '3 tumbados', category: 'tromino', matrix: [[1, 1, 1]], previewColor: 1, previewEmoji: '🎀', weight: 12, enabled: true },
  { id: 'shape_1x3', name: '1×3 de pie', tag: '3 de pie', category: 'tromino', matrix: [[1], [1], [1]], previewColor: 3, previewEmoji: '🐥', weight: 12, enabled: true },
  { id: 'shape_corner_L1', name: '「 Esquina de 3', tag: 'Esquina de 3', category: 'tromino', matrix: [[1, 1], [1, 0]], previewColor: 6, previewEmoji: '🐱', weight: 10, enabled: true },
  { id: 'shape_corner_L2', name: '┐ Esquina de 3 (b)', tag: 'Esquina de 3', category: 'tromino', matrix: [[1, 1], [0, 1]], previewColor: 4, previewEmoji: '🐸', weight: 10, enabled: true },
  { id: 'shape_corner_L3', name: '└ Esquina de 3 (c)', tag: 'Esquina de 3', category: 'tromino', matrix: [[1, 0], [1, 1]], previewColor: 7, previewEmoji: '🐻', weight: 10, enabled: true },
  { id: 'shape_corner_L4', name: '┘ Esquina de 3 (d)', tag: 'Esquina de 3', category: 'tromino', matrix: [[0, 1], [1, 1]], previewColor: 8, previewEmoji: '🍉', weight: 10, enabled: true },

  // 👑 4格经典俄罗斯方块全系 (Tetrominoes)
  { id: 'shape_square_2x2', name: '2×2 cuadrado', tag: 'Cuadrado de 4 (O)', category: 'tetris', matrix: [[1, 1], [1, 1]], previewColor: 7, previewEmoji: '🐻', weight: 14, enabled: true },
  { id: 'shape_4x1', name: '4×1 tumbado', tag: 'Barra de 4 tumbada (I)', category: 'tetris', matrix: [[1, 1, 1, 1]], previewColor: 5, previewEmoji: '🐧', weight: 8, enabled: true },
  { id: 'shape_1x4', name: '1×4 de pie', tag: 'Barra de 4 de pie (I)', category: 'tetris', matrix: [[1], [1], [1], [1]], previewColor: 3, previewEmoji: '🐥', weight: 8, enabled: true },
  { id: 'shape_T_up', name: 'T de 4', tag: 'T de 4', category: 'tetris', matrix: [[1, 1, 1], [0, 1, 0]], previewColor: 6, previewEmoji: '🐱', weight: 8, enabled: true },
  { id: 'shape_T_down', name: 'T de 4 al revés', tag: 'T de 4 al revés', category: 'tetris', matrix: [[0, 1, 0], [1, 1, 1]], previewColor: 2, previewEmoji: '🦊', weight: 8, enabled: true },
  { id: 'shape_L_vert', name: 'L de 4', tag: 'L de 4 de pie', category: 'tetris', matrix: [[1, 0], [1, 0], [1, 1]], previewColor: 2, previewEmoji: '🦊', weight: 8, enabled: true },
  { id: 'shape_L_horiz', name: 'L de 4 tumbada', tag: 'L de 4 tumbada', category: 'tetris', matrix: [[1, 1, 1], [1, 0, 0]], previewColor: 1, previewEmoji: '🐰', weight: 8, enabled: true },
  { id: 'shape_J_vert', name: 'J de 4', tag: 'J de 4 de pie', category: 'tetris', matrix: [[0, 1], [0, 1], [1, 1]], previewColor: 5, previewEmoji: '🐧', weight: 8, enabled: true },
  { id: 'shape_J_horiz', name: 'J de 4 tumbada', tag: 'J de 4 tumbada', category: 'tetris', matrix: [[1, 1, 1], [0, 0, 1]], previewColor: 4, previewEmoji: '🐸', weight: 8, enabled: true },
  { id: 'shape_Z_horiz', name: 'Z de 4', tag: 'Z de 4 tumbada', category: 'tetris', matrix: [[1, 1, 0], [0, 1, 1]], previewColor: 8, previewEmoji: '🍉', weight: 6, enabled: true },
  { id: 'shape_S_horiz', name: 'S de 4', tag: 'S de 4 tumbada', category: 'tetris', matrix: [[0, 1, 1], [1, 1, 0]], previewColor: 4, previewEmoji: '🐸', weight: 6, enabled: true },
  { id: 'shape_Z_vert', name: 'Z de 4 de pie', tag: 'Z de 4 de pie', category: 'tetris', matrix: [[0, 1], [1, 1], [1, 0]], previewColor: 8, previewEmoji: '🍉', weight: 6, enabled: true },
  { id: 'shape_S_vert', name: 'S de 4 de pie', tag: 'S de 4 de pie', category: 'tetris', matrix: [[1, 0], [1, 1], [0, 1]], previewColor: 4, previewEmoji: '🐸', weight: 6, enabled: true },

  // 🎈 5格超能趣味糖果 (Pentominoes)
  { id: 'shape_cross_plus', name: 'Cruz de 5', tag: 'Cruz de 5 (+)', category: 'pentomino', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], previewColor: 6, previewEmoji: '✨', weight: 4, enabled: true },
  { id: 'shape_U_cup', name: 'Cuenco de 5', tag: 'U de 5', category: 'pentomino', matrix: [[1, 0, 1], [1, 1, 1]], previewColor: 3, previewEmoji: '🥣', weight: 4, enabled: true },
  { id: 'shape_corner_3x3', name: 'V gigante de 5', tag: 'V de 5', category: 'pentomino', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], previewColor: 1, previewEmoji: '👑', weight: 4, enabled: true }
];

const CHEER_MESSAGES = [
  "💥 ¡Gran explosión!🌟",
  "✨ ¡Magia!🎉",
  "🍬 ¡Lluvia de dulces!🍭",
  "¡Qué bien!💖",
  "¡Qué alegría!🎈",
  "¡Súper peque!👑"
];

// 各主题专属萌宠互动台词素材库
const THEME_MASCOT_TALKS = {
  candy: [
    "¡Toca y desliza!🐻",
    "¡Qué dulces tan bonitos!🍬",
    "¡Lo haces genial!🎉",
    "¡Bloque a bloque!🍭",
    "¡Toca al osito y se ríe!💖",
    "¡Cuántos postres ricos!🍦",
    "¡Completa otra fila!✨",
    "¡Un helado para ti!🍧"
  ],
  space: [
    "¡Aventura espacial!🚀",
    "¡Mira cómo brillan las estrellas!✨",
    "¡Un marcianito te saluda!👾",
    "¡Qué gran astronauta!👨‍🚀",
    "¡Rumbo a la galaxia!🌌",
    "¡Atrapaste una estrella fugaz!🌠",
    "¡El radar ve un bloque nuevo!🛰️",
    "¡Los anillos de Saturno giran!🪐"
  ],
  forest: [
    "¡A recoger frutas al bosque!🍎",
    "¡La ardilla te anima!🐿️",
    "¡Cuántas frutas dulces!🍓",
    "¡El bosque está lleno de flores!🌸",
    "¡El cervatillo salta feliz!🦌",
    "¡Las mariposas bailan!🦋",
    "¡Agua fresquita!💧",
    "¡El erizo lleva una manzana!🦔"
  ]
};

const MASCOT_TALKS = THEME_MASCOT_TALKS.candy;


// ======================== 游戏核心控制器 ========================
class ToddlerTetris {
  constructor() {
    this.boardEl = document.getElementById('gameBoard');
    this.previewEl = document.getElementById('nextPreview');
    this.scoreValEl = document.getElementById('scoreVal');
    this.overlayEl = document.getElementById('celebrationOverlay');
    this.mascotEl = document.getElementById('mascot');
    this.mascotBubbleEl = document.getElementById('mascotBubble');
    this.soundBtn = document.getElementById('soundToggleBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.fullscreenBtn = document.getElementById('fullscreenToggleBtn');
    this.fullscreenIcon = document.getElementById('fullscreenIcon');
    this.settingsModal = document.getElementById('settingsModal');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.shapesToggleContainer = document.getElementById('shapesToggleContainer');
    this.canvasEl = document.getElementById('particleCanvas');

    this.sound = new SoundEngine();
    this.voice = new VoiceEngine();
    this.particles = new ParticleEngine(this.canvasEl);

    // 辅助功能sí/no与主题配置
    this.showGhost = true;
    this.voiceEnabled = true;
    this.currentTheme = 'candy';

    // 棋盘行列规格 (支持自定义与持久化保存)
    this.cols = DEFAULT_COLS;
    this.rows = DEFAULT_ROWS;
    this.pendingCols = DEFAULT_COLS;
    this.pendingRows = DEFAULT_ROWS;

    // 连击计数系统 (Combo Streak)
    this.comboStreak = 0;

    // 加载方块独立sí/no配置与棋盘规格
    this.shapes = JSON.parse(JSON.stringify(DEFAULT_SHAPES));
    this.loadSettings();

    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.nextPiece = null;

    this.score = 0;
    this.dropInterval = 950;
    this.lastTime = 0;
    this.dropCounter = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isClearingAnim = false;
    this.gameLoopStarted = false;

    this.initBoardDOM();
    this.initStarsBackground();
    this.bindControls();
    this.bindTouchControls();
    this.bindSettingsModal();
    this.bindFullscreen();
    this.startNewGame();

    window.addEventListener('resize', () => {
      this.updateCellSize();
      this.render();
    });
  }

  // 设置并应用主题风格
  setTheme(themeName) {
    this.currentTheme = themeName || 'candy';
    document.body.setAttribute('data-theme', this.currentTheme);
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
    });

    const mascotFace = document.querySelector('.mascot-face');

    if (this.currentTheme === 'space') {
      if (mascotFace) mascotFace.innerText = '👨‍🚀';
      if (this.mascotBubbleEl) this.mascotBubbleEl.innerText = '¡A explorar el espacio!🚀';
    } else if (this.currentTheme === 'forest') {
      if (mascotFace) mascotFace.innerText = '🦊';
      if (this.mascotBubbleEl) this.mascotBubbleEl.innerText = '¡Frutas del bosque!🌲';
    } else {
      if (mascotFace) mascotFace.innerText = '🐻';
      if (this.mascotBubbleEl) this.mascotBubbleEl.innerText = '¡Toca y desliza!🎈';
    }

    this.updateStarsBackground(this.currentTheme);

    if (this.nextPiece) {
      this.renderNextPreview();
    }
    this.render();
  }

  // 加载持久化设置
  loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem('toddler_tetris_shapes_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cols && typeof parsed.cols === 'number') {
          this.cols = Math.max(3, Math.min(16, parsed.cols));
          this.pendingCols = this.cols;
        }
        if (parsed.rows && typeof parsed.rows === 'number') {
          this.rows = Math.max(4, Math.min(24, parsed.rows));
          this.pendingRows = this.rows;
        }
        if (typeof parsed.showGhost === 'boolean') {
          this.showGhost = parsed.showGhost;
        }
        if (typeof parsed.voiceEnabled === 'boolean') {
          this.voiceEnabled = parsed.voiceEnabled;
          if (this.voice) this.voice.enabled = this.voiceEnabled;
        }
        if (parsed.theme) {
          this.currentTheme = parsed.theme;
        }
        const shapesMap = parsed.shapes || parsed;
        this.shapes.forEach(shape => {
          if (typeof shapesMap[shape.id] === 'boolean') {
            shape.enabled = shapesMap[shape.id];
          }
        });
        if (!this.shapes.some(s => s.enabled)) {
          this.shapes[0].enabled = true;
        }
      }
      this.setTheme(this.currentTheme);
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }

  // 持久化保存设置
  saveSettings() {
    try {
      const shapesMap = {};
      this.shapes.forEach(shape => {
        shapesMap[shape.id] = shape.enabled;
      });
      const data = {
        cols: this.cols,
        rows: this.rows,
        theme: this.currentTheme,
        showGhost: this.showGhost,
        voiceEnabled: this.voiceEnabled,
        shapes: shapesMap
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  // 动态计算正方形单元格尺寸 (根据设备视口与屏幕朝向自适应最大化呈现)
  updateCellSize() {
    const gameWrapper = document.querySelector('.game-wrapper') || document.body;
    if (!gameWrapper) return;
    const wrapRect = gameWrapper.getBoundingClientRect();
    const availViewportW = wrapRect.width || window.innerWidth;
    const availViewportH = wrapRect.height || window.innerHeight;

    if (availViewportW <= 0 || availViewportH <= 0) return;

    const isNarrow = availViewportW <= 640;
    const wingsWidth = isNarrow ? (80 * 2 + 16) : (108 * 2 + 24 + 36 + 28);
    const availW = Math.max(120, availViewportW - wingsWidth);

    const headersAndMarginsH = isNarrow ? 24 : (24 + 20);
    const availH = Math.max(120, availViewportH - headersAndMarginsH);

    const maxW = (availW - (this.cols - 1) * 6 - 16) / this.cols;
    const maxH = (availH - (this.rows - 1) * 6 - 16) / this.rows;

    const optimalSize = Math.floor(Math.max(16, Math.min(maxW, maxH, 180)));
    document.documentElement.style.setProperty('--cell-size', `${optimalSize}px`);

    if (this.particles) {
      this.particles.resize();
    }
  }

  // Pantalla completa与事件绑定
  bindFullscreen() {
    const updateFullscreenState = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const icon = isFull ? '🗗' : '⛶';
      if (this.fullscreenIcon) this.fullscreenIcon.innerText = icon;

      setTimeout(() => {
        this.updateCellSize();
        this.render();
      }, 60);
    };

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
      this.sound.playMove();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      this.sound.playMove();
    }
  }

  updateStarsBackground(themeName) {
    const starBg = document.getElementById('starBg');
    if (!starBg) return;
    starBg.innerHTML = '';
    const themeBgIcons = {
      candy: ['✨', '⭐', '🍬', '🍭', '💖', '🎈', '🍓', '🦄'],
      space: ['✨', '⭐', '🌟', '🪐', '💫', '🛸', '🛰️', '🚀'],
      forest: ['🍃', '🌸', '✨', '🍀', '🦋', '🍂', '🍄', '🌰']
    };
    const icons = themeBgIcons[themeName] || themeBgIcons.candy;
    for (let i = 0; i < 18; i++) {
      const star = document.createElement('div');
      star.className = 'bg-star';
      star.innerText = icons[i % icons.length];
      star.style.left = (Math.random() * 92 + 2) + '%';
      star.style.top = (Math.random() * 88 + 4) + '%';
      star.style.animationDelay = (Math.random() * 3) + 's';
      starBg.appendChild(star);
    }
  }

  initStarsBackground() {
    this.updateStarsBackground(this.currentTheme || 'candy');
  }

  initBoardDOM() {
    this.boardEl.innerHTML = '';
    this.boardEl.style.gridTemplateColumns = `repeat(${this.cols}, var(--cell-size, 68px))`;
    this.boardEl.style.gridTemplateRows = `repeat(${this.rows}, var(--cell-size, 68px))`;
    
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const slot = document.createElement('div');
        slot.className = 'cell-slot';
        
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${r}-${c}`;
        
        slot.appendChild(cell);
        this.boardEl.appendChild(slot);
      }
    }

    setTimeout(() => {
      this.updateCellSize();
      if (this.particles) this.particles.resize();
    }, 40);
  }

  // 动态修改棋盘行列并重建棋盘
  applyGridDimensions(newCols, newRows) {
    this.cols = newCols;
    this.rows = newRows;
    this.initBoardDOM();
    this.startNewGame();
  }

  getRandomPiece() {
    const enabledPool = this.shapes.filter(s => s.enabled);
    const activePool = enabledPool.length > 0 ? enabledPool : this.shapes;
    const totalWeight = activePool.reduce((sum, item) => sum + (item.weight || 1), 0);
    let rand = Math.random() * totalWeight;
    let chosen = activePool[0];

    for (const shape of activePool) {
      if (rand < shape.weight) {
        chosen = shape;
        break;
      }
      rand -= shape.weight;
    }

    const currentThemeList = THEME_BLOCK_STYLES[this.currentTheme] || THEME_BLOCK_STYLES.candy;
    const randomTheme = currentThemeList[Math.floor(Math.random() * currentThemeList.length)];

    return {
      id: chosen.id,
      name: chosen.name,
      matrix: chosen.matrix.map(row => [...row]),
      colorIndex: randomTheme.colorIndex,
      emoji: randomTheme.emoji,
      themeName: randomTheme.name
    };
  }

  startNewGame() {
    this.isGameOver = false;
    this.isPaused = false;
    this.isClearingAnim = false;
    this.comboStreak = 0;
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.nextPiece = this.getRandomPiece();
    this.spawnPiece();
    this.updateStats();
    this.render();

    if (!this.gameLoopStarted) {
      this.gameLoopStarted = true;
      requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  spawnPiece() {
    if (this.isClearingAnim || this.isGameOver) return;

    this.currentPiece = this.nextPiece || this.getRandomPiece();
    this.nextPiece = this.getRandomPiece();
    this.dropCounter = 0;
    
    const pieceWidth = this.currentPiece.matrix[0].length;
    let spawnX = Math.floor((this.cols - pieceWidth) / 2);
    
    if (this.checkCollision(spawnX, 0, this.currentPiece.matrix)) {
      let foundValid = false;
      const candidateXs = [];
      for (let offset = 1; offset < this.cols; offset++) {
        if (spawnX - offset >= 0) candidateXs.push(spawnX - offset);
        if (spawnX + offset <= this.cols - pieceWidth) candidateXs.push(spawnX + offset);
      }
      for (const testX of candidateXs) {
        if (!this.checkCollision(testX, 0, this.currentPiece.matrix)) {
          spawnX = testX;
          foundValid = true;
          break;
        }
      }

      if (!foundValid) {
        this.handleGameOver();
        return;
      }
    }

    this.currentX = spawnX;
    this.currentY = 0;

    this.renderNextPreview();
    this.render();
  }

  renderNextPreview() {
    if (!this.previewEl || !this.nextPiece) return;
    this.previewEl.innerHTML = '';
    const matrix = this.nextPiece.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const colorIndex = this.nextPiece.colorIndex;

    const cellSize = Math.min(24, Math.floor(48 / Math.max(rows, cols)));

    this.previewEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    this.previewEl.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    const currentThemeList = THEME_BLOCK_STYLES[this.currentTheme] || THEME_BLOCK_STYLES.candy;
    const styleObj = currentThemeList.find(s => s.colorIndex === colorIndex) || currentThemeList[0];
    const emoji = styleObj.emoji || '⭐';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'preview-cell';
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        if (matrix[r][c]) {
          cell.classList.add('filled', `color-${colorIndex}`);
          cell.innerHTML = `
            <div class="preview-face" style="font-size:${Math.round(cellSize * 0.65)}px;line-height:1;">
              ${emoji}
            </div>
          `;
        }
        this.previewEl.appendChild(cell);
      }
    }

    this.previewEl.classList.remove('preview-pop');
    void this.previewEl.offsetWidth;
    this.previewEl.classList.add('preview-pop');
  }

  checkCollision(offsetX, offsetY, matrix) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const newX = offsetX + c;
          const newY = offsetY + r;

          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return true;
          }
          if (newY >= 0 && this.grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  lockPiece() {
    if (!this.currentPiece) return;
    const matrix = this.currentPiece.matrix;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const boardY = this.currentY + r;
          const boardX = this.currentX + c;
          if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
            this.grid[boardY][boardX] = this.currentPiece.colorIndex;
          }
        }
      }
    }

    this.sound.playLand();
    this.currentPiece = null;
    this.render();

    const hasCleared = this.checkAndClearLines();
    if (!hasCleared) {
      this.comboStreak = 0;
      this.spawnPiece();
    }
  }


  // 检查满行并播放粒子消除 + 暂停新方块出现 + 上方方块平滑弹性滑落
  checkAndClearLines() {
    let fullRows = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r] && this.grid[r].every(cell => cell !== 0)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      this.isPaused = true;
      this.isClearingAnim = true;
      this.comboStreak++;

      this.sound.playClear(this.comboStreak);
      if (this.particles) this.particles.resize();

      const canvasRect = this.canvasEl ? this.canvasEl.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };

      // 第一阶段 (0ms ~ 460ms)：整行激光横扫与粒子爆破
      try {
        fullRows.forEach(rowIdx => {
          let rowCenterY = 0;

          const firstCell = document.getElementById(`cell-${rowIdx}-0`);
          if (firstCell && this.overlayEl) {
            const firstCellRect = firstCell.getBoundingClientRect();
            const overlayRect = this.overlayEl.getBoundingClientRect();
            const beam = document.createElement('div');
            beam.className = 'row-clear-beam';
            beam.style.top = `${firstCellRect.top - overlayRect.top}px`;
            beam.style.height = `${firstCellRect.height}px`;
            this.overlayEl.appendChild(beam);
            setTimeout(() => beam.remove(), 520);
          }

          for (let c = 0; c < this.cols; c++) {
            const cellEl = document.getElementById(`cell-${rowIdx}-${c}`);
            if (cellEl) {
              cellEl.classList.add('line-clear-anim');

              const cellRect = cellEl.getBoundingClientRect();
              const cx = (cellRect.left + cellRect.width / 2) - canvasRect.left;
              const cy = (cellRect.top + cellRect.height / 2) - canvasRect.top;
              rowCenterY = cy;

              const colorVal = this.grid[rowIdx][c];
              if (this.particles) this.particles.createBlockExplosion(cx, cy, colorVal, cellRect.width, this.currentTheme);
            }
          }

          if (this.particles) this.particles.createLaser(rowCenterY);
        });

        this.showCheerCelebration(fullRows.length, this.comboStreak);
      } catch (err) {
        console.warn('Error during cheer celebration:', err);
      }

      // 第二阶段 (460ms)：爆炸高光褪去，被消行清空，上方方块滑落
      setTimeout(() => {
        try {
          fullRows.forEach(rowIdx => {
            for (let c = 0; c < this.cols; c++) {
              const cellEl = document.getElementById(`cell-${rowIdx}-${c}`);
              if (cellEl) {
                cellEl.className = 'cell';
                cellEl.innerHTML = '';
                cellEl.style.transform = '';
                cellEl.style.transition = '';
              }
            }
          });

          const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 56;
          const gap = 6;
          const rowStep = cellSize + gap;

          for (let r = 0; r < this.rows; r++) {
            if (fullRows.includes(r)) continue;

            const dropRowsCount = fullRows.filter(clearedRow => clearedRow > r).length;
            if (dropRowsCount > 0) {
              const dropPx = dropRowsCount * rowStep;
              for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] !== 0) {
                  const cellEl = document.getElementById(`cell-${r}-${c}`);
                  if (cellEl) {
                    cellEl.classList.add('falling-drop');
                    cellEl.style.transform = `translateY(${dropPx}px)`;
                  }
                }
              }
            }
          }

          this.sound.playDrop();
        } catch (e) {
          console.warn('Error in drop phase:', e);
        }

        // 第三阶段 (460ms + 380ms = 840ms)：降落到位，更新真实数据，落定 Q 弹动效
        setTimeout(() => {
          try {
            for (let r = 0; r < this.rows; r++) {
              for (let c = 0; c < this.cols; c++) {
                const cellEl = document.getElementById(`cell-${r}-${c}`);
                if (cellEl) {
                  cellEl.style.transition = 'none';
                  cellEl.style.transform = 'none';
                  cellEl.classList.remove('falling-drop', 'line-clear-anim');
                }
              }
            }
            if (this.boardEl) void this.boardEl.offsetWidth;

            const remainingRows = this.grid.filter((_, idx) => !fullRows.includes(idx));
            while (remainingRows.length < this.rows) {
              remainingRows.unshift(Array(this.cols).fill(0));
            }
            this.grid = remainingRows;

            const comboBonus = this.comboStreak > 1 ? (this.comboStreak - 1) * 15 : 0;
            this.score += fullRows.length * 10 + comboBonus;

            this.updateStats();
            this.render();

            for (let r = 0; r < this.rows; r++) {
              for (let c = 0; c < this.cols; c++) {
                const cellEl = document.getElementById(`cell-${r}-${c}`);
                if (cellEl && this.grid[r][c] !== 0) {
                  cellEl.classList.add('drop-land-squish');
                  setTimeout(() => cellEl.classList.remove('drop-land-squish'), 320);
                }
              }
            }

            this.sound.playLand();
          } catch (e) {
            console.warn('Error finalizing row clear:', e);
          }
          
          const hasMoreClears = this.checkAndClearLines();
          if (!hasMoreClears) {
            this.isPaused = false;
            this.isClearingAnim = false;
            this.spawnPiece();
          }
        }, 380);

      }, 460);

      return true;
    }

    return false;
  }

  handleGameOver() {
    this.isGameOver = true;
    this.isPaused = true;
    this.isClearingAnim = false;
    this.comboStreak = 0;
    this.sound.playMagicReset();

    const finalScoreEl = document.getElementById('finalScoreVal');
    if (finalScoreEl) finalScoreEl.innerText = this.score;

    if (this.gameOverModal) {
      this.gameOverModal.classList.remove('hidden');
    }

    if (this.mascotBubbleEl) this.mascotBubbleEl.innerText = "¡Muy bien! ¿Descansamos o jugamos otra vez?🎈";
    this.createConfettiStorm(24);

    if (this.voice && this.voiceEnabled) {
      this.voice.speak("¡Muy bien! ¡Ronda terminada! ¡Lo hiciste genial!");
    }
  }

  restartGame() {
    if (this.gameOverModal) {
      this.gameOverModal.classList.add('hidden');
    }
    this.score = 0;
    this.comboStreak = 0;
    this.startNewGame();
  }

  bindSettingsModal() {
    const closeBtn = document.getElementById('closeSettingsBtn');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const btnPresetAll = document.getElementById('btnPresetAll');
    const btnPresetSimple = document.getElementById('btnPresetSimple');
    const btnPresetMedium = document.getElementById('btnPresetMedium');
    const btnPresetTetris = document.getElementById('btnPresetTetris');
    const btnPresetReset = document.getElementById('btnPresetReset');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const openSettingsFromGameOverBtn = document.getElementById('openSettingsFromGameOverBtn');
    const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const toggleGhostBtn = document.getElementById('toggleGhostBtn');
    const toggleVoiceBtn = document.getElementById('toggleVoiceBtn');
    const ghostStatusText = document.getElementById('ghostStatusText');
    const voiceStatusText = document.getElementById('voiceStatusText');
    const customColsInput = document.getElementById('customColsInput');
    const customRowsInput = document.getElementById('customRowsInput');
    const customColsMinus = document.getElementById('customColsMinus');
    const customColsPlus = document.getElementById('customColsPlus');
    const customRowsMinus = document.getElementById('customRowsMinus');
    const customRowsPlus = document.getElementById('customRowsPlus');
    const customDimText = document.getElementById('customDimText');

    this.updateCustomInputsUI = (cols, rows) => {
      if (customColsInput) customColsInput.value = cols;
      if (customRowsInput) customRowsInput.value = rows;
      if (customDimText) customDimText.innerText = `${cols} × ${rows}`;
    };

    const setPendingDimensions = (cols, rows) => {
      const c = Math.max(3, Math.min(16, parseInt(cols, 10) || DEFAULT_COLS));
      const r = Math.max(4, Math.min(24, parseInt(rows, 10) || DEFAULT_ROWS));
      this.pendingCols = c;
      this.pendingRows = r;
      this.updateCustomInputsUI(c, r);
      this.highlightActiveGridSizeBtn();
    };

    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.setTheme(theme);
        this.sound.playMove();
      });
    });

    if (toggleGhostBtn) {
      toggleGhostBtn.addEventListener('click', () => {
        this.showGhost = !this.showGhost;
        toggleGhostBtn.classList.toggle('active', this.showGhost);
        if (ghostStatusText) ghostStatusText.innerText = this.showGhost ? 'Sí' : 'No';
        this.sound.playMove();
        this.render();
      });
    }

    if (toggleVoiceBtn) {
      toggleVoiceBtn.addEventListener('click', () => {
        this.voiceEnabled = !this.voiceEnabled;
        if (this.voice) this.voice.enabled = this.voiceEnabled;
        toggleVoiceBtn.classList.toggle('active', this.voiceEnabled);
        if (voiceStatusText) voiceStatusText.innerText = this.voiceEnabled ? 'Sí' : 'No';
        if (this.voiceEnabled && this.voice) {
          this.voice.speak("¡Voz activada!");
        } else {
          this.sound.playMove();
        }
      });
    }

    gridSizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const c = parseInt(btn.dataset.cols, 10) || DEFAULT_COLS;
        const r = parseInt(btn.dataset.rows, 10) || DEFAULT_ROWS;
        setPendingDimensions(c, r);
        this.sound.playMove();
      });
    });

    if (customColsMinus) {
      customColsMinus.addEventListener('click', () => {
        setPendingDimensions(this.pendingCols - 1, this.pendingRows);
        this.sound.playMove();
      });
    }
    if (customColsPlus) {
      customColsPlus.addEventListener('click', () => {
        setPendingDimensions(this.pendingCols + 1, this.pendingRows);
        this.sound.playMove();
      });
    }
    if (customRowsMinus) {
      customRowsMinus.addEventListener('click', () => {
        setPendingDimensions(this.pendingCols, this.pendingRows - 1);
        this.sound.playMove();
      });
    }
    if (customRowsPlus) {
      customRowsPlus.addEventListener('click', () => {
        setPendingDimensions(this.pendingCols, this.pendingRows + 1);
        this.sound.playMove();
      });
    }

    if (customColsInput) {
      customColsInput.addEventListener('input', () => {
        const val = parseInt(customColsInput.value, 10);
        if (!isNaN(val)) {
          this.pendingCols = Math.max(3, Math.min(16, val));
          if (customDimText) customDimText.innerText = `${this.pendingCols} × ${this.pendingRows}`;
          this.highlightActiveGridSizeBtn();
        }
      });
      customColsInput.addEventListener('change', () => {
        setPendingDimensions(customColsInput.value, this.pendingRows);
      });
    }

    if (customRowsInput) {
      customRowsInput.addEventListener('input', () => {
        const val = parseInt(customRowsInput.value, 10);
        if (!isNaN(val)) {
          this.pendingRows = Math.max(4, Math.min(24, val));
          if (customDimText) customDimText.innerText = `${this.pendingCols} × ${this.pendingRows}`;
          this.highlightActiveGridSizeBtn();
        }
      });
      customRowsInput.addEventListener('change', () => {
        setPendingDimensions(this.pendingCols, customRowsInput.value);
      });
    }

    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
        this.openSettings();
      });
    }

    if (openSettingsFromGameOverBtn) {
      openSettingsFromGameOverBtn.addEventListener('click', () => {
        if (this.gameOverModal) this.gameOverModal.classList.add('hidden');
        this.openSettings();
      });
    }

    const closeAndSave = () => {
      const dimensionsChanged = (this.cols !== this.pendingCols || this.rows !== this.pendingRows);
      this.cols = this.pendingCols;
      this.rows = this.pendingRows;
      
      this.saveSettings();
      if (this.settingsModal) this.settingsModal.classList.add('hidden');
      
      if (dimensionsChanged) {
        this.applyGridDimensions(this.cols, this.rows);
        this.showCheerToast(`📐 Tablero: ${this.cols}×${this.rows}！`);
      } else if (!this.isGameOver) {
        this.isPaused = false;
      }

      const nextEnabled = this.shapes.find(s => s.id === this.nextPiece?.id)?.enabled;
      if (!nextEnabled) {
        this.nextPiece = this.getRandomPiece();
        this.renderNextPreview();
      }
      this.render();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeAndSave);
    if (saveBtn) saveBtn.addEventListener('click', closeAndSave);

    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) {
          closeAndSave();
        }
      });
    }

    if (this.gameOverModal) {
      this.gameOverModal.addEventListener('click', (e) => {
        if (e.target === this.gameOverModal) {
          this.restartGame();
        }
      });
    }

    if (btnPresetAll) {
      btnPresetAll.addEventListener('click', () => {
        this.shapes.forEach(s => s.enabled = true);
        this.renderSettingsToggles();
        this.sound.playMove();
      });
    }

    if (btnPresetSimple) {
      btnPresetSimple.addEventListener('click', () => {
        this.shapes.forEach(s => {
          s.enabled = (s.category === 'basic');
        });
        this.renderSettingsToggles();
        this.sound.playMove();
      });
    }

    if (btnPresetMedium) {
      btnPresetMedium.addEventListener('click', () => {
        this.shapes.forEach(s => {
          s.enabled = (s.category === 'basic' || s.category === 'tromino' || s.id === 'shape_square_2x2' || s.id === 'shape_T_up');
        });
        this.renderSettingsToggles();
        this.sound.playMove();
      });
    }

    if (btnPresetTetris) {
      btnPresetTetris.addEventListener('click', () => {
        this.shapes.forEach(s => {
          s.enabled = (s.category === 'tetris');
        });
        this.renderSettingsToggles();
        this.sound.playMove();
      });
    }

    if (btnPresetReset) {
      btnPresetReset.addEventListener('click', () => {
        this.shapes = JSON.parse(JSON.stringify(DEFAULT_SHAPES));
        this.pendingCols = DEFAULT_COLS;
        this.pendingRows = DEFAULT_ROWS;
        if (this.updateCustomInputsUI) {
          this.updateCustomInputsUI(DEFAULT_COLS, DEFAULT_ROWS);
        }
        this.highlightActiveGridSizeBtn();
        this.renderSettingsToggles();
        this.sound.playMove();
      });
    }

    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.restartGame();
      });
    }
  }

  // 平板与触屏设备的手势拖拽、滑动与轻击¡Abajo!支持
  bindTouchControls() {
    const boardCard = document.getElementById('boardCard') || this.boardEl;
    if (!boardCard) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchStartTime = 0;
    let hasMovedHoriz = 0;

    const getCellPixelSize = () => {
      return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 56;
    };

    boardCard.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      this.sound.unlock();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      touchStartTime = Date.now();
      hasMovedHoriz = 0;
    }, { passive: true });

    boardCard.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      if (this.isPaused || this.isGameOver || this.isClearingAnim || !this.currentPiece) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - lastTouchY;
      const stepSize = getCellPixelSize() * 0.7;

      // 横向拖拽步进移动 (左/右)
      if (Math.abs(touch.clientX - touchStartX) >= stepSize) {
        if (touch.clientX > touchStartX) {
          this.moveRight();
          this.triggerBtnFeedback('keyBadgeRight');
        } else {
          this.moveLeft();
          this.triggerBtnFeedback('keyBadgeLeft');
        }
        touchStartX = touch.clientX;
        hasMovedHoriz++;
      }

      // 竖向快速向下滑动加速
      if (deltaY > stepSize * 1.2) {
        this.moveDown();
        this.triggerBtnFeedback('keyBadgeDown');
        lastTouchY = touch.clientY;
      }

      lastTouchX = touch.clientX;
    }, { passive: true });

    boardCard.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      const totalDeltaY = (e.changedTouches[0]?.clientY || lastTouchY) - touchStartY;
      const totalDeltaX = (e.changedTouches[0]?.clientX || lastTouchX) - touchStartX;

      // 1. 快速向下大幅滑屏 -> ¡Abajo!
      if (totalDeltaY > 70 && Math.abs(totalDeltaX) < 50) {
        this.triggerBtnFeedback('keyBadgeUp');
        this.hardDrop();
        return;
      }

      // 2. 向上快速轻扫 -> ¡Abajo!
      if (totalDeltaY < -40 && Math.abs(totalDeltaX) < 50) {
        this.triggerBtnFeedback('keyBadgeUp');
        this.hardDrop();
        return;
      }

      // 3. 原地轻击 (Tap) 且没有发生横向滑动 -> ¡Abajo!
      if (touchDuration < 280 && Math.abs(totalDeltaX) < 20 && Math.abs(totalDeltaY) < 20 && hasMovedHoriz === 0) {
        this.triggerBtnFeedback('keyBadgeUp');
        this.hardDrop();
      }
    }, { passive: true });
  }

  highlightActiveGridSizeBtn() {
    const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
    gridSizeButtons.forEach(btn => {
      const c = parseInt(btn.dataset.cols, 10);
      const r = parseInt(btn.dataset.rows, 10);
      btn.classList.toggle('active', c === this.pendingCols && r === this.pendingRows);
    });
  }

  openSettings() {
    this.isPaused = true;
    this.pendingCols = this.cols;
    this.pendingRows = this.rows;

    if (this.updateCustomInputsUI) {
      this.updateCustomInputsUI(this.pendingCols, this.pendingRows);
    }
    this.highlightActiveGridSizeBtn();
    this.renderSettingsToggles();

    // 更新辅助sí/no按钮状态
    const toggleGhostBtn = document.getElementById('toggleGhostBtn');
    const toggleVoiceBtn = document.getElementById('toggleVoiceBtn');
    const ghostStatusText = document.getElementById('ghostStatusText');
    const voiceStatusText = document.getElementById('voiceStatusText');

    if (toggleGhostBtn) toggleGhostBtn.classList.toggle('active', this.showGhost);
    if (ghostStatusText) ghostStatusText.innerText = this.showGhost ? 'Sí' : 'No';

    if (toggleVoiceBtn) toggleVoiceBtn.classList.toggle('active', this.voiceEnabled);
    if (voiceStatusText) voiceStatusText.innerText = this.voiceEnabled ? 'Sí' : 'No';

    // 更新主题高亮
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
    });

    if (this.settingsModal) {
      this.settingsModal.classList.remove('hidden');
    }
  }

  renderSettingsToggles() {
    if (!this.shapesToggleContainer) return;
    this.shapesToggleContainer.innerHTML = '';

    this.shapes.forEach(shape => {
      const card = document.createElement('div');
      card.className = `shape-card ${shape.enabled ? 'enabled' : ''}`;
      card.id = `toggle-card-${shape.id}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${shape.name} sí/no`);

      // 生成小预览网格
      const rows = shape.matrix.length;
      const cols = shape.matrix[0].length;
      const cellSize = Math.min(14, Math.floor(36 / Math.max(rows, cols)));

      let previewGridHtml = `<div class="shape-card-preview" style="grid-template-columns: repeat(${cols}, ${cellSize}px); grid-template-rows: repeat(${rows}, ${cellSize}px);">`;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (shape.matrix[r][c]) {
            const pColor = shape.previewColor || 1;
            const pEmoji = shape.previewEmoji || '⭐';
            previewGridHtml += `<div class="shape-preview-cell color-${pColor}" style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:8px;">${pEmoji}</div>`;
          } else {
            previewGridHtml += `<div style="width:${cellSize}px;height:${cellSize}px;"></div>`;
          }
        }
      }
      previewGridHtml += `</div>`;

      card.innerHTML = `
        ${previewGridHtml}
        <div class="shape-card-info">
          <div class="shape-card-name">${shape.name}</div>
          <div class="shape-card-tag">${shape.tag}</div>
        </div>
        <div class="toggle-switch">
          <div class="toggle-slider"></div>
        </div>
      `;

      const toggleCard = () => {
        // 至少保留一个方块启用
        if (shape.enabled) {
          const enabledCount = this.shapes.filter(s => s.enabled).length;
          if (enabledCount <= 1) {
            this.showCheerToast("🍼 ¡Deja al menos una pieza!");
            this.sound.playLand();
            return;
          }
        }

        shape.enabled = !shape.enabled;
        card.classList.toggle('enabled', shape.enabled);
        this.sound.playMove();
      };

      card.addEventListener('click', toggleCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCard();
        }
      });

      this.shapesToggleContainer.appendChild(card);
    });
  }

  showCheerCelebration(linesCount) {
    const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
    this.createConfettiStorm(16 * linesCount);

    if (this.mascotBubbleEl) this.mascotBubbleEl.innerText = msg;

    // 触发真人中文甜美语音夸奖
    if (this.voice && this.voiceEnabled) {
      try {
        if (linesCount >= 2) {
          this.voice.speak("¡Guau! ¡Increíble! ¡Súper combo!");
        } else {
          const voiceCheers = ["¡Genial! ¡Fila fuera!", "¡Qué bien!", "¡Qué inteligente!", "¡Súper fila!", "¡Estupendo!"];
          this.voice.speak(voiceCheers[Math.floor(Math.random() * voiceCheers.length)]);
        }
      } catch (e) {
        console.warn('Voice speak error:', e);
      }
    }
  }

  showCheerToast(text) {
    if (!this.overlayEl) return;
    try {
      const toast = document.createElement('div');
      toast.className = 'cheer-toast';
      toast.innerText = text;
      this.overlayEl.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 1400);
    } catch (e) {
      console.warn('Cheer toast error:', e);
    }
  }

  createConfettiStorm(count) {
    if (!this.overlayEl) return;
    try {
      const emojis = ['⭐', '🎉', '🍬', '🍭', '✨', '🎈', '💖'];
      for (let i = 0; i < count; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        
        conf.style.left = (Math.random() * 80 + 10) + '%';
        conf.style.top = (Math.random() * 50 + 20) + '%';
        
        const tx = (Math.random() - 0.5) * 180;
        const ty = (Math.random() - 0.5) * 140 - 40;
        const tx2 = tx * 1.5;
        const ty2 = ty + 140;

        conf.style.setProperty('--tx', `${tx}px`);
        conf.style.setProperty('--ty', `${ty}px`);
        conf.style.setProperty('--tx2', `${tx2}px`);
        conf.style.setProperty('--ty2', `${ty2}px`);

        this.overlayEl.appendChild(conf);
        setTimeout(() => conf.remove(), 1300);
      }
    } catch (e) {
      console.warn('Confetti storm error:', e);
    }
  }

  updateStats() {
    if (this.scoreValEl) this.scoreValEl.innerText = this.score;
  }

  // 计算当前活动方块直接掉落的最低 Y 轴坐标 (落点虚影)
  getGhostY() {
    if (!this.currentPiece) return this.currentY;
    let ghostY = this.currentY;
    while (!this.checkCollision(this.currentX, ghostY + 1, this.currentPiece.matrix)) {
      ghostY++;
    }
    return ghostY;
  }

  render() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cellEl = document.getElementById(`cell-${r}-${c}`);
        if (!cellEl) continue;

        cellEl.className = 'cell';
        cellEl.style.transform = '';
        cellEl.style.transition = '';
        cellEl.innerHTML = '';

        const colorVal = this.grid[r][c];
        if (colorVal !== 0) {
          cellEl.classList.add('filled', `color-${colorVal}`);
          this.attachFace(cellEl, colorVal);
        }
      }
    }

    // 关键：仅在非消除动画状态下渲染落点虚影与活动方块
    if (this.currentPiece && !this.isClearingAnim) {
      const matrix = this.currentPiece.matrix;

      // 1. 渲染落点幽灵虚影 (Ghost Piece - 辅助瞄准)
      if (this.showGhost) {
        const ghostY = this.getGhostY();
        if (ghostY !== this.currentY) {
          for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
              if (matrix[r][c]) {
                const gy = ghostY + r;
                const gx = this.currentX + c;
                if (gy >= 0 && gy < this.rows && gx >= 0 && gx < this.cols) {
                  const ghostCellEl = document.getElementById(`cell-${gy}-${gx}`);
                  if (ghostCellEl && !ghostCellEl.classList.contains('filled')) {
                    ghostCellEl.classList.add('ghost', `ghost-color-${this.currentPiece.colorIndex}`);
                  }
                }
              }
            }
          }
        }
      }

      // 2. 渲染当前活动方块
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const boardY = this.currentY + r;
            const boardX = this.currentX + c;
            if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
              const activeCellEl = document.getElementById(`cell-${boardY}-${boardX}`);
              if (activeCellEl) {
                activeCellEl.classList.remove('ghost');
                activeCellEl.classList.add('filled', `color-${this.currentPiece.colorIndex}`);
                this.attachFace(activeCellEl, this.currentPiece.colorIndex);
              }
            }
          }
        }
      }
    }
  }

  // 为不同主题的方块装扮巨幅专属 3D 角色图案
  attachFace(cellEl, colorIndex) {
    const currentThemeList = THEME_BLOCK_STYLES[this.currentTheme] || THEME_BLOCK_STYLES.candy;
    const styleObj = currentThemeList.find(s => s.colorIndex === colorIndex) || currentThemeList[0];

    const face = document.createElement('div');
    face.className = 'block-face';

    face.innerHTML = `
      <div class="block-char-main">${styleObj.icon}</div>
    `;
    cellEl.appendChild(face);
  }

  moveLeft() {
    if (this.isPaused || this.isClearingAnim || !this.currentPiece) return;
    if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece.matrix)) {
      this.currentX--;
      this.sound.playMove();
      this.render();
    }
  }

  moveRight() {
    if (this.isPaused || this.isClearingAnim || !this.currentPiece) return;
    if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece.matrix)) {
      this.currentX++;
      this.sound.playMove();
      this.render();
    }
  }

  moveDown() {
    if (this.isPaused || this.isClearingAnim || !this.currentPiece) return;
    if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.matrix)) {
      this.currentY++;
      this.sound.playMove();
      this.render();
    } else {
      this.lockPiece();
    }
  }

  hardDrop() {
    if (this.isPaused || this.isClearingAnim || !this.currentPiece) return;
    this.sound.playDrop();
    while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.matrix)) {
      this.currentY++;
    }
    this.lockPiece();
  }

  bindControls() {
    // 键盘全局控制
    window.addEventListener('keydown', (e) => {
      this.sound.unlock();

      // 1. 如果在结算面板状态：按任意键盘按键都直接开启新的一局！
      if (this.isGameOver) {
        if (!this.settingsModal || this.settingsModal.classList.contains('hidden')) {
          e.preventDefault();
          this.restartGame();
          return;
        }
      }

      // 如果设置弹窗处于打开状态，不响应游戏控制按键
      if (this.settingsModal && !this.settingsModal.classList.contains('hidden')) {
        return;
      }

      // 全屏快捷键 (F / f)
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.toggleFullscreen();
        return;
      }

      // 消除动画中或者没有活动方块时，忽略控制按键
      if (this.isPaused || this.isGameOver || this.isClearingAnim || !this.currentPiece) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.triggerBtnFeedback('keyBadgeLeft');
          this.moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.triggerBtnFeedback('keyBadgeRight');
          this.moveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.triggerBtnFeedback('keyBadgeDown');
          this.moveDown();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          this.triggerBtnFeedback('keyBadgeUp');
          this.hardDrop();
          break;
      }
    });

    // 屏幕 D-Pad 触控/点击按键直接操控支持
    const badgeLeft = document.getElementById('keyBadgeLeft');
    const badgeRight = document.getElementById('keyBadgeRight');
    const badgeDown = document.getElementById('keyBadgeDown');
    const badgeUp = document.getElementById('keyBadgeUp');

    const setupBadgeAction = (badgeEl, actionFn, badgeId) => {
      if (!badgeEl) return;
      const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sound.unlock();
        if (this.isPaused || this.isGameOver || this.isClearingAnim || !this.currentPiece) return;
        this.triggerBtnFeedback(badgeId);
        actionFn();
      };

      badgeEl.addEventListener('pointerdown', handleAction);
      badgeEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.sound.unlock();
          if (this.isPaused || this.isGameOver || this.isClearingAnim || !this.currentPiece) return;
          this.triggerBtnFeedback(badgeId);
          actionFn();
        }
      });
    };

    setupBadgeAction(badgeLeft, () => this.moveLeft(), 'keyBadgeLeft');
    setupBadgeAction(badgeRight, () => this.moveRight(), 'keyBadgeRight');
    setupBadgeAction(badgeDown, () => this.moveDown(), 'keyBadgeDown');
    setupBadgeAction(badgeUp, () => this.hardDrop(), 'keyBadgeUp');

    // Música按钮
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const isSoundOn = this.sound.toggle();
        this.soundBtn.innerHTML = `
          <span class="btn-icon">${isSoundOn ? '🔊' : '🔇'}</span>
        `;
      });
    }

    // 萌宠互动
    if (this.mascotEl) {
      const triggerMascotCheer = () => {
        this.sound.unlock();
        this.sound.playCheer();
        const talks = THEME_MASCOT_TALKS[this.currentTheme] || THEME_MASCOT_TALKS.candy;
        const randMsg = talks[Math.floor(Math.random() * talks.length)];
        if (this.mascotBubbleEl) this.mascotBubbleEl.innerText = randMsg;
        this.showCheerCelebration(1);
      };

      this.mascotEl.addEventListener('click', triggerMascotCheer);
      this.mascotEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerMascotCheer();
        }
      });
    }
  }

  triggerBtnFeedback(badgeId) {
    const el = document.getElementById(badgeId);
    if (el) {
      el.classList.add('active-press');
      setTimeout(() => el.classList.remove('active-press'), 140);
    }
  }

  gameLoop(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    // 仅在非暂停、非消除动画、非结算且有活动方块时执行自动下落
    if (!this.isPaused && !this.isGameOver && !this.isClearingAnim && this.currentPiece) {
      this.dropCounter += deltaTime;
      if (this.dropCounter > this.dropInterval) {
        this.moveDown();
        this.dropCounter = 0;
      }
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// 页面加载完成后实例化游戏核心
window.addEventListener('DOMContentLoaded', () => {
  const game = new ToddlerTetris();
  const unlockEvents = ['click', 'touchstart', 'pointerdown', 'keydown'];
  const unlockHandler = () => {
    game.sound.unlock();
    unlockEvents.forEach(evt => document.removeEventListener(evt, unlockHandler, { capture: true }));
  };
  unlockEvents.forEach(evt => document.addEventListener(evt, unlockHandler, { capture: true, once: true }));
});


