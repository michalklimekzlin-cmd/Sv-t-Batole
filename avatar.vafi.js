if (window.__AVATAR_ACTIVE__) { console.warn('Debug avatar přeskočen'); throw 0; }
window.__AVATAR_ACTIVE__ = true;
// zabraň dvojímu spuštění
if (window.__AVATAR_ACTIVE__) { throw new Error('Avatar už běží'); }
window.__AVATAR_ACTIVE__ = true;
// avatar.vafi.js — Vafi s dýcháním, mžouráním, spánkem a SNY ✨
import { Head } from './vafi.head.js';
export async function spawnVafi() {
  const canvas = document.getElementById('canvasVafi');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // Energie z "duše"
  let getEnergy = () => 0.85;
  try {
    const { Soul } = await import(`./vafi.soul.js?${window.V || ''}`);
    getEnergy = () => {
      const s = Soul.get?.();
      return Math.min(1, Math.max(0, s?.energy ?? 0.85));
    };
  } catch {}

  // „Vafi spí… zzz“
  let sleepLabel = document.getElementById('vafiSleep');
  if (!sleepLabel) {
    sleepLabel = document.createElement('div');
    sleepLabel.id = 'vafiSleep';
    Object.assign(sleepLabel.style, {
      position: 'fixed', bottom: '3%', left: '4%',
      fontFamily: 'system-ui, sans-serif', color: '#aefcff',
      opacity: '0', transition: 'opacity 2s ease', pointerEvents: 'none',
      fontSize: '0.9rem', textShadow: '0 0 6px #00f5ff80'
    });
    document.body.appendChild(sleepLabel);
  }

  // Plátno
  function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    canvas.style.objectFit = 'contain';
  }
  resize();
  addEventListener('resize', resize);

  // --- SNY ----------------------------------------------------------
  // jemné „částice snů“ (glify / hvězdy) – kreslí se za Vafim
  const DREAM_GLYPHS = ['✦','⋆','☾','·','✧','۞','❖','﹡','⁂','◦'];
  const dreams = []; // {x,y,vx,vy,life,max,alpha,size,char,spin}
  function spawnDream(W, H) {
    const size = Math.random() * 16 + 10;
    dreams.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.7 + H*0.15,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -0.05 - Math.random()*0.05,
      life: 0,
      max: 5 + Math.random()*6, // s
      alpha: 0,
      size,
      char: DREAM_GLYPHS[(Math.random()*DREAM_GLYPHS.length)|0],
      spin: (Math.random()-0.5)*0.6
    });
  }
  function updateDreams(dt, W, H, asleep){
    // spawn jen když spí (lehounce)
    if (asleep && dreams.length < 18 && Math.random() < 0.08) spawnDream(W,H);
    for (let i=dreams.length-1;i>=0;i--){
      const d = dreams[i];
      d.life += dt;
      d.x += d.vx * (asleep?1:0.6);
      d.y += d.vy * (asleep?1:0.6);
      // nádech/ výdech průhlednosti
      const t = d.life/d.max;
      d.alpha = asleep ? Math.sin(Math.min(1,t)*Math.PI) : d.alpha*0.92;
      if (d.life > d.max || d.alpha < 0.02 || d.y < -40) dreams.splice(i,1);
    }
    // když se probudí → sny se rychle rozpustí
    if (!asleep) {
      for (const d of dreams) d.alpha *= 0.92;
    }
  }
  function drawDreams(ctx){
    for (const d of dreams){
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, d.alpha));
      ctx.translate(d.x, d.y);
      ctx.rotate(d.spin * d.life);
      ctx.shadowColor = '#7be9ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#cfffff';
      ctx.font = `${d.size}px system-ui, ui-sans-serif, Apple Color Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.char, 0, 0);
      ctx.restore();
    }
  }
  // ------------------------------------------------------------------

  let t = 0;
  let last = performance.now();

  function loop(now = performance.now()) {
    const dt = Math.min(0.05, (now - last)/1000); // s
    last = now;
    t += dt;

    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    const baseR = Math.min(W,H) * 0.12;

    const energy = getEnergy();
    const asleep = energy < 0.25;

    // dýchání
    const breathSpeed = asleep ? 0.5 : 1;
    const breathAmp = asleep ? 0.015 : 0.03;
    const breath = Math.sin(t * breathSpeed) * breathAmp;

    // mrkání / zavřené oči
    let open = 1;
    if (!asleep) {
      const blinkPeriod = 2 + 4*(1-energy);
      const blinkDur = 0.15 + 0.25*(1-energy);
      const b = (t % blinkPeriod);
      if (b < blinkDur) {
        open = 1 - Math.sin((b/blinkDur)*Math.PI);
      }
      open = Math.max(0, Math.min(1, open - 0.25*(1-energy)));
    } else {
      open = 0; // spánek = zavřené
    }

    // update snů
    updateDreams(dt, W, H, asleep);

    // KRESLENÍ
    ctx.clearRect(0,0,W,H);

    // SNY pod tělem
    drawDreams(ctx);

    // tělo
    // === Morphix styl (pokud je k dispozici) ===
let style = null;
try { style = await window.VAFI_STYLE?.getStyle(); } catch {}
// fallbacky
const C_BASE = style?.colors?.base || 'rgb(50,180,170)';
const C_GLOW = style?.colors?.glow || 'rgb(123,233,255)';
const eyeSpreadMul = style?.eyes?.spread ?? baseR*0.24;
const eyeWMul      = style?.eyes?.w      ?? baseR*0.10;
const eyeHMul      = style?.eyes?.h      ?? baseR*0.18;
    const g = ctx.createRadialGradient(cx, cy - baseR*0.6, baseR*0.1, cx, cy, baseR*1.6);
    const glow = asleep ? 0.3 : 0.65 + 0.35*energy;
    g.addColorStop(0, `rgba(123,233,255,${glow})`);
    g.addColorStop(1, '#00121d');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR*0.8, baseR*(1.8 + breath), 0, 0, Math.PI*2);
    ctx.fill();

    // oči
    const eyeY = cy - baseR*0.2;
    const eyeDX = baseR*0.25;
    const eyeW = baseR*0.10;
    const eyeHmax = baseR*0.26;
    const eyeH = Math.max(eyeHmax*0.07, eyeHmax*open);
    ctx.fillStyle = asleep ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx-eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI*2);
    ctx.ellipse(cx+eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI*2);
    ctx.fill();
    // ---- ZDRAVOTNÍ REPORT ----
const eyesDrawn = true; // očividně se vykreslily
document.dispatchEvent(new CustomEvent('vafi:health', {
  detail: { eyesDrawn }
}));

    // štítek „Vafi spí… zzz“
    if (asleep) {
      sleepLabel.textContent = 'Vafi spí… zzz';
      sleepLabel.style.opacity = '1';
    } else {
      sleepLabel.style.opacity = '0';
    }

    requestAnimationFrame(loop);
  }

  loop();
}