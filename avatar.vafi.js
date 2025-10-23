// avatar.vafi.js — světelná podoba Vafiho
import { vafiSoul } from './vafi.soul.js';

const canvas = document.getElementById('canvasVafi');
const ctx = canvas.getContext('2d', { alpha: true });

function resize(){
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(window.innerWidth);
  const h = Math.floor(window.innerHeight);
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.width  = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize);
resize();

let t = 0;
function draw(){
  t += 1/60;
  const w = canvas.width  / (window.devicePixelRatio||1);
  const h = canvas.height / (window.devicePixelRatio||1);
  ctx.clearRect(0,0,w,h);

  const mood = vafiSoul.mood ?? 0.6;     // 0..1
  const energy = vafiSoul.energy ?? 0.7; // 0..1

  const cx = w*0.5, cy = h*0.55;
  const baseR = Math.min(w,h)*0.18;
  const r = baseR * (1 + 0.05*Math.sin(t*2)) + energy*12;

  const hue = 210 + (mood-0.5)*120; // modrá→fialová podle nálady
  const g = ctx.createRadialGradient(cx,cy, r*0.2, cx,cy, r*1.4);
  g.addColorStop(0, `hsla(${hue},90%,70%,0.95)`);
  g.addColorStop(1, `hsla(${hue},90%,10%,0.0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx,cy,r*1.4,0,Math.PI*2); ctx.fill();

  // tělo
  ctx.fillStyle = `hsla(${hue},85%,65%,${0.75+energy*0.2})`;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

  // oči (mrknutí)
  const eyeR = r*0.12, sep = r*0.55;
  const blink = (Math.sin(t*12)+1)/2 < 0.05; // občas mrkne
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  for (const s of [-1,1]){
    ctx.beginPath();
    if (blink) ctx.ellipse(cx+s*sep*0.5, cy-eyeR*0.2, eyeR, eyeR*0.2, 0, 0, Math.PI*2);
    else ctx.arc(cx+s*sep*0.5, cy-eyeR*0.2, eyeR, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);