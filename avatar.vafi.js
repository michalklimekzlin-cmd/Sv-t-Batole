// avatar.vafi.js — Vafi s Morphix integration 💫

if (window.__AVATAR_ACTIVE__) // avatar.vafi.js — Vafi s dýcháním, očima a barvami z configu
import { State } from './state.core.js?v='+ (window.V||'dev');
import { COLORS, SHAPE, EYES, MOOD_TINT } from './config.js?v='+ (window.V||'dev');

let eyesReported = false;

export async function spawnVafi(){
  const canvas = document.getElementById('canvasVafi') || document.getElementById('canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  function resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  addEventListener('resize', resize, { passive:true });

  function drawBody(cx, cy, baseR, asleep, mood){
    // z moodu namícháme teplý/chladný glow
    const warmK = Math.max(0, (mood - MOOD_TINT.warmAt) / (1 - MOOD_TINT.warmAt));
    const coldK = Math.max(0, (MOOD_TINT.coldAt - mood) / MOOD_TINT.coldAt);
    const useWarm = warmK > coldK;

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * SHAPE.bodyRmulOuter);
    g.addColorStop(0, useWarm ? COLORS.glowWarm : COLORS.glowCold);
    g.addColorStop(1, COLORS.bgGlow);

    // základní tělo (jemný overlay)
    ctx.globalAlpha = SHAPE.bodyTintAlpha;
    ctx.fillStyle = COLORS.base;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR*SHAPE.bodyRmulInner, baseR*SHAPE.bodyRmulOuter, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // hlavní glow
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR*0.8, baseR*(1.8 + (State.get().energy*0.2)), 0, 0, Math.PI*2);
    ctx.fill();
  }

  function drawEyes(cx, cy, baseR, asleep){
    const eyeY = cy - baseR * EYES.yMul;
    const eyeDX = baseR * EYES.spreadMul;
    const eyeW  = baseR * EYES.widthMul;
    const eyeHmax = baseR * EYES.heightMul;

    const blink = Math.abs(Math.sin(State.get().t*1.3))*eyeHmax;
    const open  = Math.max(eyeHmax*EYES.minOpen, asleep ? eyeHmax*0.12 : blink);

    ctx.fillStyle = asleep ? COLORS.sleepEye : COLORS.eye;
    ctx.beginPath();
    ctx.ellipse(cx-eyeDX, eyeY, eyeW, open, 0, 0, Math.PI*2);
    ctx.ellipse(cx+eyeDX, eyeY, eyeW, open, 0, 0, Math.PI*2);
    ctx.fill();

    if(!eyesReported){ eyesReported = true; State.emit('eyes:drawn', { drawn:true }); }
  }

  let lastW = 0, lastH = 0;
  State.on('tick', ({ state })=>{
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if(w !== lastW || h !== lastH){ resize(); lastW = w; lastH = h; }

    ctx.clearRect(0,0,canvas.width, canvas.height);

    const cx = canvas.clientWidth * 0.5;
    const cy = canvas.clientHeight * 0.58;
    const baseR = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.18;

    drawBody(cx, cy, baseR, state.asleep, state.mood);
    drawEyes(cx, cy, baseR, state.asleep);

    // štítek spánku (pokud ho máš v DOMu)
    const label = document.getElementById('vafiStatus');
    if(label){
      if(state.asleep){ label.textContent = 'Vafi spí… zzz'; label.style.opacity = '1'; }
      else { label.style.opacity = '0'; }
    }
  });
}

spawnVafi(); new Error("Avatar already active");
window.__AVATAR_ACTIVE__ = true;

export async function spawnVafi() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // === Morphix styl posluchač ===
  let LAST_STYLE = null;
  document.addEventListener('vafi:style', e => { LAST_STYLE = e.detail; });

  // === základní energie z duše ===
  let getEnergy = () => 0.85;
  try {
    const { Soul } = await import('./vafi.soul.js');
    getEnergy = () => {
      const s = Soul.get?.();
      return Math.min(1, Math.max(0, s?.energy ?? 0.85));
    };
  } catch {}

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function loop() {
    const t = performance.now() / 1000;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2.2;
    const energy = getEnergy();

    ctx.clearRect(0, 0, w, h);

    // === Morphix styl (tichý fallback) ===
    const st = LAST_STYLE;
    const C_BASE = st?.colors?.base || 'rgb(50,180,170)';
    const C_GLOW = st?.colors?.glow || 'rgb(123,233,255)';
    const eyeSpreadMul = st?.eyes?.spread ?? 0.25;
    const eyeWMul      = st?.eyes?.w ?? 0.10;
    const eyeHMul      = st?.eyes?.h ?? 0.18;

    const baseR = Math.min(w, h) * 0.2;
    const asleep = energy < 0.2;

    // === tělo ===
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * (1.8 + energy));
    const glow = asleep ? 0.3 : 0.65 + 0.35 * energy;
    g.addColorStop(0, C_GLOW.replace('rgb(', 'rgba(').replace(')', `,${glow})`));
    g.addColorStop(1, '#00121d');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR * 0.8, baseR * (1.8 + energy * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();

    // jemné tónování těla podle C_BASE
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = C_BASE;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR * 0.78, baseR * 1.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // === oči ===
    const eyeY = cy - baseR * 0.2;
    const eyeDX = baseR * eyeSpreadMul;
    const eyeW = baseR * eyeWMul;
    const eyeHmax = baseR * 0.26;
    const eyeH = Math.max(eyeHmax * 0.07, baseR * eyeHMul);

    ctx.fillStyle = asleep ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    // === štítek ===
    if (asleep) {
      document.getElementById('sleepLabel').textContent = 'Vafi spí… zzz';
      document.getElementById('sleepLabel').style.opacity = '1';
    } else {
      document.getElementById('sleepLabel').style.opacity = '0';
    }

    requestAnimationFrame(loop);
  }

  loop();
}