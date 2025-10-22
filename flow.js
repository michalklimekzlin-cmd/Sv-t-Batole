// flow.js — Plocha života (dýchající proudy napojené na VAF)
import { VAF } from './vaf.js';

export const Flow = {
  canvas: null,
  ctx: null,
  w: 0, h: 0,
  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    const resize = () => {
      this.w = this.canvas.width  = window.innerWidth  * devicePixelRatio;
      this.h = this.canvas.height = window.innerHeight * devicePixelRatio;
    };
    window.addEventListener('resize', resize);
    resize();
    VAF.onFrame(({ t, energy }) => this.draw(t, energy));
  },
  draw(t, energy) {
    const c = this.ctx, w = this.w, h = this.h;
    c.fillStyle = 'rgba(10,12,16,0.25)'; // afterglow
    c.fillRect(0, 0, w, h);

    const lines = 3;
    for (let i = 0; i < lines; i++) {
      const yBase = (h / (lines + 1)) * (i + 1);
      c.beginPath();
      for (let x = 0; x < w; x += 12) {
        const k = 0.0009 + i * 0.0002;
        const amp = (20 + i * 12) * (0.6 + energy * 0.8) * devicePixelRatio;
        const y = yBase + Math.sin(x * k + t * (0.8 + i * 0.2)) * amp;
        if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.strokeStyle = `rgba(125,221,255,${0.15 + 0.15 * energy})`;
      c.lineWidth = 2 * devicePixelRatio;
      c.stroke();
    }
  }
};
