// viri.form.js
// Vizuální podoba Viriho podle vlivu týmů

export class ViriForm {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mix = { batolesvet: 0.25, glyph: 0.25, ai: 0.25, pedrovci: 0.25 };
    this.t = 0;
  }

  // Nastaví aktuální mix (např. {ai:0.5, glyph:0.2, pedrovci:0.3})
  setMix(mix) {
    this.mix = { ...this.mix, ...mix };
  }

  // Přepočítá barvy, světla, tvar podle mixu
  draw() {
    const { ctx, canvas } = this;
    this.t += 0.015;
    const { batolesvet, glyph, ai, pedrovci } = this.mix;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // výpočet celkové intenzity vlivu
    const total = batolesvet + glyph + ai + pedrovci;
    const bx = canvas.width / 2;
    const by = canvas.height / 2;

    // puls (dech)
    const r = 80 + 20 * Math.sin(this.t * 2);

    // barvy podle týmů
    const color = {
      r: Math.min(255, 180 * ai + 100 * glyph),
      g: Math.min(255, 200 * batolesvet + 80 * pedrovci),
      b: Math.min(255, 220 * batolesvet + 120 * glyph + 40 * ai),
    };

    const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, r * 1.5);
    gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.9)`);
    gradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();

    // Glyph efekt (plovoucí znaky)
    if (glyph > 0.3) {
      const symbols = ["*", "\\\\", "/", "•", ")", "(", "{", "}"];
      ctx.font = `${14 + glyph * 10}px monospace`;
      ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${0.5 * glyph})`;
      for (let i = 0; i < glyph * 20; i++) {
        const x = bx + Math.sin(this.t * 2 + i) * (r + 30);
        const y = by + Math.cos(this.t * 2 + i * 1.5) * (r + 30);
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        ctx.fillText(sym, x, y);
      }
    }

    // AI efekt (linky a geometrie)
    if (ai > 0.3) {
      ctx.strokeStyle = `rgba(120,220,255,${ai * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < ai * 10; i++) {
        const angle = (i / (ai * 10)) * Math.PI * 2 + this.t;
        const x = bx + Math.cos(angle) * (r + 40);
        const y = by + Math.sin(angle) * (r + 40);
        ctx.moveTo(bx, by);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Pedrovci efekt (tvář)
    if (pedrovci > 0.4) {
      ctx.fillStyle = `rgba(255,255,255,${pedrovci * 0.9})`;
      ctx.beginPath();
      ctx.arc(bx - 20, by - 10, 6, 0, Math.PI * 2); // levé oko
      ctx.arc(bx + 20, by - 10, 6, 0, Math.PI * 2); // pravé oko
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${pedrovci * 0.8})`;
      ctx.lineWidth = 3;
      ctx.arc(bx, by + 15, 20, 0, Math.PI); // úsměv
      ctx.stroke();
    }

    // Batolesvět efekt (mlhovina)
    if (batolesvet > 0.3) {
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, r * 2);
      glow.addColorStop(0, `rgba(180,255,230,${0.3 * batolesvet})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// jednoduché spuštění animace:
export function startViriForm(canvas) {
  const viri = new ViriForm(canvas);
  function loop() {
    viri.draw();
    requestAnimationFrame(loop);
  }
  loop();
  return viri;
}
