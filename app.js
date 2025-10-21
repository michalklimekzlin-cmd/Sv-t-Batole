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
