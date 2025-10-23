// avatar.vafi.js — Vafi s dýcháním + mžouráním očí podle energie

export async function spawnVafi() {
  const canvas = document.getElementById('canvasVafi');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // energie z Duše (bezpečně, když duše není, držíme default)
  let getEnergy = () => 0.85;
  try {
    const { Soul } = await import(`./vafi.soul.js?${window.V||''}`);
    getEnergy = () => {
      const s = Soul.get?.();
      return Math.min(1, Math.max(0, s?.energy ?? 0.85));
    };
  } catch (e) {
    // duše není k dispozici – nevadí
  }

  // velikost plátna
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.objectFit = 'contain';
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;

  function loop() {
    t += 0.02;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const baseR = Math.min(W, H) * 0.12;

    // dýchání
    const breathing = Math.sin(t) * 0.03;

    // energie & mžourání
    const energy = getEnergy();                 // 0..1
    const blinkPeriod = 2 + 4 * (1 - energy);   // nízká energie = častěji
    const blinkTime = t % blinkPeriod;
    const blinkWindow = 0.15 + 0.25 * (1 - energy); // nízká energie = delší
    // otevření víčka 0..1 (1 = úplně otevřené)
    let open = 1;
    if (blinkTime < blinkWindow) {
      // rychle zavřít a pomaleji otevřít
      const x = blinkTime / blinkWindow;        // 0..1
      open = 1 - Math.sin(x * Math.PI);         // 1→0→1
    }
    // unavené základní přivření
    const tiredBias = 0.25 * (1 - energy);
    open = Math.max(0, Math.min(1, open - tiredBias));

    // kreslení
    ctx.clearRect(0, 0, W, H);

    // tělo (světlo lehce sílí s energií)
    const g = ctx.createRadialGradient(
      cx, cy - baseR * 0.6, baseR * 0.1,
      cx, cy, baseR * 1.6
    );
    const glow = 0.65 + 0.35 * energy;
    g.addColorStop(0, `rgba(123,233,255,${glow})`);
    g.addColorStop(1, '#00121d');
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.ellipse(
      cx, cy,
      baseR * 0.8,
      baseR * (1.8 + breathing),
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // oči
    const eyeY = cy - baseR * 0.2;
    const eyeDX = baseR * 0.25;
    const eyeW  = baseR * 0.10;
    const eyeHmax = baseR * 0.26;
    const eyeH = Math.max(eyeHmax * 0.07, eyeHmax * open); // nikdy úplně nezmizí
    ctx.fillStyle = 'rgba(0,0,0,0.85)';

    ctx.beginPath();
    ctx.ellipse(cx - eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(loop);
  }

  loop();
}