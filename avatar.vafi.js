// avatar.vafi.js — dýchající světlokoule s očima & mrknutím
const c = document.getElementById('canvasVafi');
const ctx = c.getContext('2d');

let dpr = window.devicePixelRatio || 1;
function size() {
  const w = Math.floor(window.innerWidth);
  const h = Math.floor(window.innerHeight);
  c.width = Math.floor(w*dpr); c.height = Math.floor(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
size(); addEventListener('resize', size);

let blinkT = 0, nextBlink = 2 + Math.random()*3;

function drawOrb(mood, asleep, t) {
  const w = c.width/dpr, h = c.height/dpr;
  ctx.clearRect(0,0,w,h);

  // pozice a velikost
  const R = Math.min(w,h)*0.18;
  const x = w*0.5 + Math.sin(t*0.25)*10;
  const y = h*0.55 + Math.cos(t*0.18)*6;

  // barva podle nálady
  const hue = 210 + (mood-50)*1.2;
  const fill = `hsla(${hue},80%,65%,0.85)`;
  const glow = `hsla(${hue},90%,70%,0.35)`;

  // „dýchání“ poloměru
  const breath = 1 + (asleep ? 0.02 : 0.05)*Math.sin(t*2);
  const r = R*breath;

  // záře
  const grad = ctx.createRadialGradient(x,y, r*0.2, x,y, r*1.4);
  grad.addColorStop(0, fill);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(x,y,r*1.4,0,Math.PI*2); ctx.fill();

  // tělo
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();

  // obličej
  const eyeSep = r*0.55;
  const eyeR   = r*0.12;
  blinkT += 1/60;
  if (blinkT > nextBlink) { // mrknutí
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    const k = Math.max(0, 1 - (blinkT-nextBlink)*12); // rychlé zavření
    // dvě oči
    for (const s of [-1,1]) {
      ctx.beginPath();
      ctx.ellipse(s*eyeSep*0.5, -eyeR*0.2, eyeR, eyeR*k, 0, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    if (k<=0) { blinkT = 0; nextBlink = 2 + Math.random()*3; }
  } else {
    // normální oči
    ctx.fillStyle = asleep ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.85)';
    for (const s of [-1,1]) {
      ctx.beginPath();
      ctx.arc(x + s*eyeSep*0.5, y - eyeR*0.2, eyeR, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // „Zzz“ když spí
  if (asleep) {
    ctx.fillStyle = '#cfe8ff';
    ctx.font = '16px system-ui';
    ctx.fillText('Z', x+r*0.6, y-r*0.6);
  }
}

// propojení s enginem (čte náladu/energii přes DOM HUD)
function hudVal(id){ const el = document.getElementById(id); return el ? (+el.textContent||0) : 0; }

let last = performance.now();
function loop(t){
  const dt = (t - last)/1000; last = t;
  const mood = hudVal('moodPct') || 60;
  const asleep = (document.getElementById('vafiStatus')?.textContent || '').includes('spí');
  drawOrb(mood, asleep, t/1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
