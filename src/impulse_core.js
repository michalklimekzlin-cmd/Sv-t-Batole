// Impulse Core — reaguje na dech a impulzy
import { LexiumGrid } from "./lexium_grid.js";

export class ImpulseCore {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.grid = new LexiumGrid(6);
    this.dech = 0;
    this.lastTime = 0;
  }

  update(delta) {
    this.dech += delta * 0.001;
    if (this.dech > Math.PI * 2) this.dech -= Math.PI * 2;
    this.grid.pulse();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const alpha = 0.5 + 0.5 * Math.sin(this.dech);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    this.grid.draw(ctx, this.canvas.width, this.canvas.height);
  }

  loop(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.update(delta);
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  start() {
    this.loop(0);
  }
}
