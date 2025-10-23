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

