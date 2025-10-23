// Batolesvět v0.4 — start
import { Teams } from './teams.js';
import { spawnGlyphs, animateGlyphs } from './team.glyphs.js';
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
const canvasMain = document.getElementById('canvas');
const canvasVafi = document.getElementById('canvasVafi');

function resizeAll(){
  const w = Math.floor(window.innerWidth);
  const h = Math.floor(window.innerHeight);
  const dpr = window.devicePixelRatio || 1;

  [canvasMain, canvasVafi].forEach(c => {
    // CSS rozměry řešíme v CSS (100vw/100vh), tady nastavíme vnitřní bitmapu
    c.width  = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext('2d');
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
  });
}
window.addEventListener('resize', resizeAll);
resizeAll();

// život
VAF.start();
VAF.attachSensors();
Flow.init();
VafiLayer.init();
spawnGlyphs();
animateGlyphs();

// Teams bootstrap (1 zástupce od každého týmu)
import { spawnHuman }     from './team.human.js?v=1';
import { spawnAIHelper }  from './team.ai.js?v=1';
import { spawnWorldSpirit } from './team.world.js?v=1';
import { spawnGlyph }     from './team.glyph.js?v=1';

spawnHuman();
spawnAIHelper();
spawnWorldSpirit();
spawnGlyph();