// Batolesvět v0.4 — start
import { VAF }       from './vaf.js?v=11';
import { Flow }      from './flow.js?v=11';
import { VafiLayer } from './vafi.js?v=11';
console.log("✨ Batolesvět se probouzí...");

// přizpůsobení hlavního plátna (měřítko)
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
function resizeMain(){
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.width  = Math.floor(window.innerWidth  * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resizeMain);
resizeMain();

// život
VAF.start();
VAF.attachSensors();
Flow.init();
VafiLayer.init();

// jednoduchý HUD update (nepovinné)
const lightEl = document.getElementById('lightLevel');
const energyEl = document.getElementById('bioEnergy');
let t0 = performance.now();
function hud(){
  const now = performance.now();
  const t = (now - t0) / 1000;
  const day = 60; // 60s = den (jen pro demo)
  const light = 0.5 + 0.5 * Math.sin((t/day)*Math.PI*2);
  lightEl.textContent = `✶ ${(light*100|0)}%`;
  energyEl.textContent = `⚡ ${Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vaf-bpm')||'60'))}`;
  requestAnimationFrame(hud);
}
hud();