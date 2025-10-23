// avatar.vafi.js — robustní světelný avatar Vafiho
let vafiSoul = null;
try {
  // pokus o import duše (když selže, jedeme s fallbackem)
  ({ vafiSoul } = await import('./vafi.soul.js'));
} catch (e) { console.warn('Soul import failed, using fallback mood/energy.'); }

const cv = document.getElementById('canvasVafi');
const ctx = cv.getContext('2d', { alpha: true });

function ensureSize(){
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(window.innerWidth));
  const h = Math.max(1, Math.floor(window.innerHeight));
  // nastav styl + skutečná pixmapa
  cv.style.width = '100vw';
  cv.style.height = '100vh';
  const needW = Math.floor(w*dpr), needH = Math.floor(h*dpr);
  if (cv.width !== needW || cv.height !== needH){
    cv.width = needW; cv.height = needH;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
}
addEventListener('resize', ensureSize, {passive:true});
ensureSize();

let t = 0, blinkT = 0, nextBlink = 2 + Math.random()*3;

function getMood(){  // 0..1
  if (vafiSoul?.mood != null) return Math.max(0, Math.min(1, vafiSoul.mood));
  const el = document.getElementById('moodPct'); // fallback z HUDu
  return Math.max(0, Math.min(1, (+el?.textContent || 60)/100));
}
function getEnergy(){ // 0..1
  if (vafiSoul?.energy != null) return Math.max(0, Math.min(1, vafiSoul.energy));
  const el = document.getElementById('energyVal');
  return Math.max(0, Math.min(1, (+el?.textContent || 70)/100));
}
function isAsleep(){
  const s = document.getElementById('vafiStatus')?.textContent || '';
  return /spí/i.test(s);
}

function draw(){
  ensureSize();               // kdyby jiný skript měnil rozměry
  t += 1/60; blinkT += 1/60;

  const w = cv.width/(window.devicePixelRatio||1);
  const h = cv.height/(window.devicePixelRatio||1);
  ctx.clearRect(0,0,w,h);

  const mood   = getMood();
  const energy = getEnergy();
  const asleep = isAsleep();

  const cx = w*0.5, cy = h*0.56;
  const baseR = Math.min(w,h)*0.18;
  const r = baseR*(1 + (asleep?0.02:0.05)*Math.sin(t*2)) + energy*12;

  const hue = 210 + (mood-0.5)*120; // modrá→fialová s náladou

  // záře
  const g = ctx.createRadialGradient(cx,cy, r*0.2, cx,cy, r*1.4);
  g.addColorStop(0, `hsla(${hue},90%,70%,${0.92})`);
  g.addColorStop(1, `hsla(${hue},90%,10%,0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx,cy,r*1.4,0,Math.PI*2); ctx.fill();

  // tělo
  ctx.fillStyle = `hsla(${hue},85%,65%,${0.75 + energy*0.2})`;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

  // oči + mrknutí
  const eyeR = r*0.12, sep = r*0.55;
  const doBlink = blinkT > nextBlink;
  ctx.fillStyle = asleep ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.9)';
  for (const s of [-1,1]){
    ctx.beginPath();
    if (doBlink){
      ctx.ellipse(cx+s*sep*0.5, cy-eyeR*0.2, eyeR, eyeR*0.2, 0, 0, Math.PI*2);
    } else {
      ctx.arc(cx+s*sep*0.5, cy-eyeR*0.2, eyeR, 0, Math.PI*2);
    }
    ctx.fill();
  }
  if (doBlink){
    // reset mrknutí
    if (blinkT > nextBlink + 0.08){ blinkT = 0; nextBlink = 2 + Math.random()*3; }
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);