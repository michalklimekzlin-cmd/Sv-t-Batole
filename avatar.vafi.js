// avatar.vafi.js — Vafi s Morphix integration 💫

if (window.__AVATAR_ACTIVE__) throw new Error("Avatar already active");
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