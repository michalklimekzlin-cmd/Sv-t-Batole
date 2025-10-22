// vafi.js — první Vafi (Duo Vafi) jako textové bytosti napojené na VAF
import { VAF } from './vaf.js';

const VafiA = {
  // Michal – ampersant s vlasy dozadu a telefonem
  form: "ً&’",       // můžeš upravit přesně na svou variantu
  name: "Michal-Vafi",
  phase: 0.0
};

const VafiB = {
  // Kovošrot – druhý „ampersant-like“ glyph (s mobilem)
  form: "`९נֶ",
  name: "Kovo-Vafi",
  phase: Math.PI / 2
};

function drawVafi(ctx, text, x, y, scale, energy) {
  ctx.save();
  ctx.translate(x, y);
  const s = scale * (1.0 + 0.05 * energy);
  ctx.scale(s, s);
  ctx.rotate((energy - 0.5) * 0.1);
  ctx.font = "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(200, 255, 240, ${0.75 + 0.25 * energy})`;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export const VafiLayer = {
  canvas: null,
  ctx: null,
  w: 0, h: 0,
  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      this.w = this.canvas.width;
      this.h = this.canvas.height;
    };
    resize();
    new ResizeObserver(() => resize()).observe(this.canvas);

    VAF.onFrame(({ t, energy }) => this.draw(t, energy));
  },
  draw(t, energy) {
    const c = this.ctx;
    const w = this.canvas.width  / devicePixelRatio;
    const h = this.canvas.height / devicePixelRatio;

    c.save();
    c.scale(devicePixelRatio, devicePixelRatio);

    // Duo Vafi sedí vedle sebe dole uprostřed (začátek příběhu)
    drawVafi(c, VafiA.form, w * 0.45, h * 0.82, 1.6, energy);
    drawVafi(c, VafiB.form, w * 0.55, h * 0.82, 1.6, energy);

    c.restore();
  }
};
