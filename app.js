// Batolesvět — Level 1: Základní dech
import { ImpulseCore } from "./src/impulse_core.js";

window.addEventListener("load", () => {
  const canvas = document.querySelector("#glview");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const core = new ImpulseCore(canvas);
  core.start();

  // přátelský pozdrav z Orbitu
  console.log("%cOrbit: Vivere atque frui 🌱", "color:#7fffd4");
});
// === STABILIZACE PÍSMENKOVÉHO PLÁTNA ===
let memoryText = [];

function drawStableChar(ctx, char, x, y, color) {
  // Uloží pozici a znak do paměti
  memoryText.push({ char, x, y, color });
  // Ořízne paměť (aby se nepřeplnila)
  if (memoryText.length > 5000) memoryText.shift();

  // Vykreslení nového znaku
  ctx.fillStyle = color;
  ctx.fillText(char, x, y);
}

function redrawAll(ctx) {
  for (let t of memoryText) {
    ctx.fillStyle = t.color;
    ctx.fillText(t.char, t.x, t.y);
  }
redrawAll(ctx);
}