// avatar.vafi.js  (v3)
// Jednoduchý avatar „kulička s očima“ napojený na Vafiho stav.
// Nepadá, i když engine ještě není hotový – čeká, než je canvas k dispozici.

(() => {
  const AVATAR = {
    ready: false,
    ctx: null,
    w: 0, h: 0,
    // stav
    x: 0.5,                  // relativně (0..1) přes šířku
    y: 0.68,                 // relativně (0..1) přes výšku
    r: 110,                  // poloměr v px (přepočítá se při resize)
    hue: 190,                // barva (0..360)
    mood: 0.5,               // 0..1
    energy: 1,               // 0..1
    blinkAt: 0,

    init() {
      const cvs = document.getElementById('canvasVafi') || document.getElementById('canvas');
      if (!cvs) { requestAnimationFrame(AVATAR.init); return; }

      const ctx = cvs.getContext('2d');
      AVATAR.ctx = ctx;
      AVATAR.resize();
      addEventListener('resize', AVATAR.resize);

      // pokus o napojení na VAFI (není-li, jede fallback)
      if (globalThis.VAFI) {
        const v = globalThis.VAFI;
        AVATAR.hue   = 180 + Math.max(-60, Math.min(60, (v.mood - 50) * 1.2));
        AVATAR.mood  = Math.max(0, Math.min(1, v.mood / 100));
        AVATAR.energy= Math.max(0, Math.min(1, v.energy / 100));
      }

      AVATAR.ready = true;
      AVATAR.nextBlink();
      requestAnimationFrame(AVATAR.loop);
    },

    resize() {
      if (!AVATAR.ctx) return;
      const cvs = AVATAR.ctx.canvas;
      // plátno velikostí stránky – pokud si ho spravuje engine, nechat být
      if (!cvs.width || !cvs.height) {
        cvs.width  = innerWidth  * devicePixelRatio;
        cvs.height = innerHeight * devicePixelRatio;
      }
      AVATAR.w = cvs.width;
      AVATAR.h = cvs.height;
      // škálování poloměru podle kratšího rozměru
      AVATAR.r = Math.max(60, Math.min(200, Math.min(AVATAR.w, AVATAR.h) * 0.08));
    },

    setMood(pct) {           // 0..100
      AVATAR.mood = Math.max(0, Math.min(1, pct/100));
      AVATAR.hue  = 180 + (AVATAR.mood - 0.5) * 180; // modrá → tyrkys → fialová
    },

    setEnergy(pct) {         // 0..100
      AVATAR.energy = Math.max(0, Math.min(1, pct/100));
    },

    nextBlink() {
      // mrknutí za 2–6 s
      AVATAR.blinkAt = performance.now() + 2000 + Math.random()*4000;
    },

    loop(t) {
      if (!AVATAR.ready) return;
      AVATAR.draw(t);
      requestAnimationFrame(AVATAR.loop);
    },

    draw(t) {
      const ctx = AVATAR.ctx;
      const cvs = ctx.canvas;

      // částečný průhled – nechává podkladové „linky“ z engine vidět
      ctx.clearRect(0,0,cvs.width,cvs.height);

      const cx = AVATAR.w * AVATAR.x;
      const cy = AVATAR.h * AVATAR.y;

      const grad = ctx.createRadialGradient(cx, cy, AVATAR.r*0.2, cx, cy, AVATAR.r*1.35);
      const col = (h, a)=>`hsla(${h}deg, 80%, 60%, ${a})`;
      grad.addColorStop(0.00, col(AVATAR.hue, 0.95));
      grad.addColorStop(0.60, col(AVATAR.hue, 0.45));
      grad.addColorStop(1.00, col(AVATAR.hue, 0.00));

      // tělo
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(cx, cy, AVATAR.r, 0, Math.PI*2);
      ctx.fill();

      // oči
      const blink = t > AVATAR.blinkAt && t < AVATAR.blinkAt + 140; // 140 ms
      if (t > AVATAR.blinkAt + 140) AVATAR.nextBlink();

      const eyeR = blink ? AVATAR.r*0.06 : AVATAR.r*0.12;
      const eyeDy= blink ? AVATAR.r*0.02 : AVATAR.r*0.04;
      const eyeDx= AVATAR.r*0.34;

      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      // levé
      ctx.beginPath();
      ctx.ellipse(cx - eyeDx, cy - eyeDy, eyeR, blink? eyeR*0.25 : eyeR, 0, 0, Math.PI*2);
      ctx.fill();
      // pravé
      ctx.beginPath();
      ctx.ellipse(cx + eyeDx, cy - eyeDy, eyeR, blink? eyeR*0.25 : eyeR, 0, 0, Math.PI*2);
      ctx.fill();

      // jemná pulzace podle „energie“
      const pulse = 1 + (AVATAR.energy-0.5)*0.06 * Math.sin(t/450);
      AVATAR.r *= pulse;      // krátce zvětší / zmenší
      AVATAR.r /= pulse;
    }
  };

  // vystavit jednoduché API pro engine / duši
  globalThis.Avatar = {
    init: AVATAR.init,
    setMood: AVATAR.setMood,
    setEnergy: AVATAR.setEnergy
  };

  // auto-start
  AVATAR.init();
})();