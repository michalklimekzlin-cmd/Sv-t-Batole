// world.fx.js — jemné částice, rychlost & množství podle nálady
const c = document.getElementById('canvas');
const ctx = c.getContext('2d');
let dpr = window.devicePixelRatio || 1;

function size() {
  const w = Math.floor(innerWidth), h = Math.floor(innerHeight);
  c.width = Math.floor(w*dpr); c.height = Math.floor(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
size(); addEventListener('resize', size);

const N = 60; // částice
const P = [];
function reset(p){
  const w = c.width/dpr, h = c.height/dpr;
  p.x = Math.random()*w; p.y = Math.random()*h;
  p.z = 0.4 + Math.random()*0.6; // hloubka
  p.r = 0.8 + Math.random()*1.6;
}
for (let i=0;i<N;i++){ P.push({x:0,y:0,z:0,r:1}); reset(P[i]); }

function hudVal(id){ const el = document.getElementById(id); return el ? (+el.textContent||0) : 0; }

let last = performance.now();
function loop(t){
  const dt = Math.min(0.033, (t-last)/1000); last=t;
  const mood = hudVal('moodPct') || 50;
  const asleep = (document.getElementById('vafiStatus')?.textContent || '').includes('spí');

  // rychlost podle nálady (klidnější ve spánku)
  const base = asleep ? 6 : 18;
  const speed = base + (mood-50)*0.25;

  const w = c.width/dpr, h = c.height/dpr;
  ctx.clearRect(0,0,w,h);

  for (const p of P){
    p.x += (p.z*speed)*dt;
    if (p.x > w+10) { p.x = -10; p.y = Math.random()*h; }

    const hue = 200 + (mood-50)*0.6;
    ctx.fillStyle = `hsla(${hue},70%,70%,${0.15 + p.z*0.25})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r*p.z, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
