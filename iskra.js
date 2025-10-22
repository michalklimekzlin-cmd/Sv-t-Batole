// iskra.js — první nádech života (prototyp)
// Reaguje na VAF puls a zjevuje krátké "Iskry" světla

import { VAF } from './vaf.js';

export const Iskra = {
  container: null,
  pool: [],

  init() {
    this.container = document.createElement('div');
    this.container.id = 'iskraField';
    Object.assign(this.container.style, {
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 999,
    });
    document.body.appendChild(this.container);

    // Při každém beatu vytvoří 1–2 jiskry
    VAF.onBeat(({ t, bpm }) => {
      const n = Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < n; i++) this.spawn();
    });
  },

  spawn() {
    const el = document.createElement('div');
    const size = 6 + Math.random() * 8;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    Object.assign(el.style, {
      position: 'absolute',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      background: 'rgba(125,221,255,0.8)',
      left: x + 'px',
      top: y + 'px',
      boxShadow: `0 0 ${size * 2}px rgba(125,221,255,0.7)`,
      transform: 'scale(0.5)',
      opacity: 0,
      transition: 'all 1.2s ease-out',
    });
    this.container.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = 'scale(1.5)';
      el.style.opacity = '1';
    });

    // zánik po 1,2 s
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.2)';
      setTimeout(() => el.remove(), 1200);
    }, 800);
  }
};
