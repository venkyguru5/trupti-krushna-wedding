/* ==========================================================================
   ROYAL AMBIENT PETALS, GOLD DUST & CELEBRATION CONFETTI ENGINE
   ========================================================================== */
(function (window) {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const CONFETTI_COLORS = ['#D4AF37', '#F3E2B0', '#C6A15B', '#E9B9B3', '#B82547', '#FFF8ED', '#FF9933'];

  // 1. CSS Floating Hearts & Twinkling Stars (Preserved from original + enhanced)
  function initCSSFloaters() {
    if (reduceMotion) return;
    const f = document.getElementById('float');
    if (!f) return;
    f.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = 'fh';
      s.textContent = i % 3 === 0 ? '✦' : (i % 2 ? '♡' : '♥');
      s.style.cssText = `left:${rnd(2, 96)}%;font-size:${rnd(11, 20)}px;color:${i % 3 ? '#E9B9B3' : '#D4AF37'};animation-duration:${rnd(11, 20)}s;animation-delay:${-rnd(0, 18)}s`;
      f.appendChild(s);
    }
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.className = 'sp';
      s.textContent = '✦';
      s.style.cssText = `left:${rnd(3, 96)}%;top:${rnd(4, 94)}%;font-size:${rnd(7, 13)}px;animation-duration:${rnd(2.2, 4.5)}s;animation-delay:${-rnd(0, 4)}s`;
      f.appendChild(s);
    }
  }

  // 2. Ambient Canvas: Floating Rose Petals, Gold Dust & Pointer Sparkles
  class AmbientPalaceCanvas {
    constructor() {
      this.canvas = document.getElementById('ambient-canvas');
      if (!this.canvas || reduceMotion) return;
      this.ctx = this.canvas.getContext('2d');
      this.w = 0;
      this.h = 0;
      this.particles = [];
      this.sparks = [];
      this.surgeMultiplier = 1;
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      const count = window.innerWidth < 600 ? 28 : 48;
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(true));
      }

      window.addEventListener('pointermove', (e) => {
        if (Math.random() < 0.35) {
          this.spawnSpark(e.clientX, e.clientY, 1);
        }
      }, { passive: true });

      this.loop();
    }

    resize() {
      if (!this.canvas) return;
      this.w = this.canvas.width = window.innerWidth;
      this.h = this.canvas.height = window.innerHeight;
    }

    createParticle(randomY = false) {
      const isPetal = Math.random() < 0.38;
      return {
        x: rnd(0, this.w || window.innerWidth),
        y: randomY ? rnd(0, this.h || window.innerHeight) : -20,
        vx: rnd(-0.35, 0.45),
        vy: isPetal ? rnd(0.45, 1.15) : rnd(-0.45, -0.15),
        size: isPetal ? rnd(5, 10) : rnd(1.2, 3.2),
        angle: rnd(0, Math.PI * 2),
        spin: rnd(-0.02, 0.02),
        alpha: isPetal ? rnd(0.35, 0.72) : rnd(0.25, 0.8),
        isPetal,
        petalColor: Math.random() < 0.65 ? '#9E1B3B' : (Math.random() < 0.5 ? '#E9B9B3' : '#E89B2D')
      };
    }

    spawnSpark(x, y, count = 4) {
      if (reduceMotion || !this.canvas) return;
      for (let i = 0; i < count; i++) {
        this.sparks.push({
          x,
          y,
          vx: rnd(-2.4, 2.4),
          vy: rnd(-2.6, 1.8),
          size: rnd(1.5, 3.8),
          life: 1,
          decay: rnd(0.022, 0.045),
          color: Math.random() < 0.7 ? '#FFF1C1' : '#D4AF37'
        });
      }
    }

    surgeIntro() {
      this.surgeMultiplier = 4.2;
      this.spawnSpark(this.w / 2, this.h / 2, 36);
      setTimeout(() => {
        this.surgeMultiplier = 1;
      }, 1500);
    }

    loop() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);

      // Draw ambient petals & gold dust
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx * this.surgeMultiplier;
        p.y += p.vy * this.surgeMultiplier;
        p.angle += p.spin;

        if (p.y > this.h + 25) {
          p.y = -20;
          p.x = rnd(0, this.w);
        } else if (p.y < -25) {
          p.y = this.h + 20;
          p.x = rnd(0, this.w);
        }
        if (p.x > this.w + 25) p.x = -20;
        if (p.x < -25) p.x = this.w + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;

        if (p.isPetal) {
          ctx.fillStyle = p.petalColor;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.58, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#F3E2B0';
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw interactive gold sparks
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.life -= s.decay;
        if (s.life <= 0) {
          this.sparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(() => this.loop());
    }
  }

  // 3. Confetti & Pushpavrishti Burst (Upgraded from original confetti() & hearts())
  let confettiAnimId = 0;
  function launchConfetti(originYRatio = 0.45, particleCount = 125) {
    if (reduceMotion) return;
    const c = document.getElementById('confetti');
    if (!c) return;
    const x = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const ps = Array.from({ length: particleCount }, () => ({
      x: window.innerWidth / 2 + rnd(-120, 120),
      y: window.innerHeight * originYRatio,
      vx: rnd(-8, 8),
      vy: rnd(-18, -5),
      s: rnd(5, 11),
      r: rnd(0, 6.28),
      vr: rnd(-0.28, 0.28),
      c: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
      type: Math.random() < 0.28 ? 'heart' : (Math.random() < 0.5 ? 'petal' : 'gold')
    }));

    cancelAnimationFrame(confettiAnimId);
    const t0 = performance.now();

    (function frame(t) {
      x.clearRect(0, 0, c.width, c.height);
      const life = 1 - (t - t0) / 3800;
      if (life <= 0) return;

      ps.forEach((p) => {
        p.vy += 0.28;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;

        x.save();
        x.translate(p.x, p.y);
        x.rotate(p.r);
        x.globalAlpha = Math.max(0, life);
        x.fillStyle = p.c;

        if (p.type === 'heart') {
          x.font = p.s * 2 + 'px serif';
          x.fillText('♥', 0, 0);
        } else if (p.type === 'petal') {
          x.beginPath();
          x.ellipse(0, 0, p.s, p.s * 0.6, 0, 0, Math.PI * 2);
          x.fill();
        } else {
          x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        }
        x.restore();
      });

      confettiAnimId = requestAnimationFrame(frame);
    })(t0);
  }

  function launchHearts() {
    if (reduceMotion) return;
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'bh';
      s.textContent = i % 3 === 0 ? '✦' : (i % 2 ? '♥' : '♡');
      s.style.cssText = `left:${rnd(5, 92)}%;font-size:${rnd(16, 30)}px;color:${i % 3 ? '#E9B9B3' : '#D4AF37'};animation-duration:${rnd(2.4, 3.8)}s;animation-delay:${rnd(0, 0.8)}s`;
      s.addEventListener('animationend', () => s.remove());
      document.body.appendChild(s);
    }
  }

  let ambientInstance = null;
  window.addEventListener('DOMContentLoaded', () => {
    initCSSFloaters();
    ambientInstance = new AmbientPalaceCanvas();
  });

  window.RoyalParticles = {
    confetti: launchConfetti,
    hearts: launchHearts,
    sparkAt: (x, y, count) => ambientInstance && ambientInstance.spawnSpark(x, y, count),
    surgeIntro: () => ambientInstance && ambientInstance.surgeIntro()
  };
})(window);
