// avatar.vafi.js — plynulé pohyby, žádné blikání
import { Soul } from './vafi.soul.js';

const TWO_PI = Math.PI * 2;
const lerp = (a,b,t)=>a+(b-a)*t;
const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));

let ctx, W, H, DPR;
let face = {
  x: 0.5, y: 0.62, r: 0.12,   // relativně k výšce/šířce
  glow: 0.0,
  eyeBlink: 0,
  nextBlinkAt: 0
};
let smooth = { x: 0.5, y: 0.62, r: 0.12, glow: 0.0 };

function setup(){
  const cvs = document.getElementById('canvasVafi') || document.getElementById('canvas');
  ctx = cvs.getContext('2d');
  DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  resize();
  window.addEventListener('resize', resize);
  scheduleBlink();
}

function resize(){
  const cvs = ctx.canvas;
  W = Math.floor(window.innerWidth);
  H = Math.floor(window.innerHeight);
  cvs.style.width = W+'px';
  cvs.style.height = H+'px';
  cvs.width  = W*DPR; cvs.height = H*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}

function scheduleBlink(){
  face.nextBlinkAt = performance.now() + 1600 + Math.random()*2400;
}

function moodColor(mood){
  // 0..1 → fialová → tyrkys → světle zelená
  const h = lerp(260, 165, mood); // v deg
  const s = 80;
  const l = lerp(45, 60, mood);
  return `hsl(${h}deg ${s}% ${l}%)`;
}

function draw(dt){
  const S = Soul.state();

  // cíle z nálady/energie
  face.glow = clamp(0.25 + S.energy*0.75, 0, 1);
  face.r = lerp(0.10, 0.14, S.energy);
  face.y = lerp(0.58, 0.65, 1-S.mood);
  face.x = lerp(0.35, 0.65, S.flow);

  // plynulé přechody
  const s = 1 - Math.pow(0.001, dt); // frame-rate invariant smoothing
  smooth.x = lerp(smooth.x, face.x, s);
  smooth.y = lerp(smooth.y, face.y, s);
  smooth.r = lerp(smooth.r, face.r, s);
  smooth.glow = lerp(smooth.glow, face.glow, s);

  ctx.clearRect(0,0,W,H);

  // světélkující aura
  const cx = W*smooth.x, cy = H*smooth.y, r = Math.min(W,H)*smooth.r;
  const g = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r*2.4);
  const col = moodColor(S.mood);
  g.addColorStop(0, col);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.55*smooth.glow;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,r*2.2,0,TWO_PI); ctx.fill();
  ctx.globalAlpha = 1;

  // tělo
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TWO_PI); ctx.fill();

  // oči + mrknutí
  const eyeR = r*0.11;
  if (performance.now() >= face.nextBlinkAt){
    face.eyeBlink = 1; scheduleBlink();
  }
  face.eyeBlink = Math.max(0, face.eyeBlink - dt*3); // rychlé mrknutí
  const squish = lerp(1, 0.15, face.eyeBlink);

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  // levé
  ctx.save();
  ctx.translate(cx - r*0.35, cy - r*0.05);
  ctx.scale(1, squish);
  ctx.beginPath(); ctx.arc(0,0,eyeR,0,TWO_PI); ctx.fill();
  ctx.restore();
  // pravé
  ctx.save();
  ctx.translate(cx + r*0.20, cy - r*0.02);
  ctx.scale(1, squish);
  ctx.beginPath(); ctx.arc(0,0,eyeR,0,TWO_PI); ctx.fill();
  ctx.restore();
}

let tPrev = 0;
function loop(t){
  if (!tPrev) tPrev = t;
  const dt = Math.min(0.06, (t - tPrev)/1000); // v sekundách
  tPrev = t;

  Soul.tick(dt);
  draw(dt);
  requestAnimationFrame(loop);
}

export const Avatar = {
  init(){ setup(); requestAnimationFrame(loop); }
};