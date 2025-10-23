// avatar.vafi.js — Vafi s dýcháním, mžouráním a spánkem podle energie
// Svět: Michal Klimek 🩵

export async function spawnVafi() {
  const canvas = document.getElementById('canvasVafi');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // Energie ze "duše"
  let getEnergy = () => 0.85;
  try {
    const { Soul } = await import(`./vafi.soul.js?${window.V || ''}`);
    getEnergy = () => {
      const s = Soul.get?.();
      return Math.min(1, Math.max(0, s?.energy ?? 0.85));
    };
  } catch {
    // fallback — pokud duše není dostupná
  }

  // Text "Vafi spí..."
  let sleepLabel = document.getElementById('vafiSleep');
  if (!sleepLabel) {
    sleepLabel = document.createElement('div');
    sleepLabel.id = 'vafiSleep';
    Object.assign(sleepLabel.style, {
      position: 'fixed',
      bottom: '3%',
      left: '4%',
      fontFamily: 'system-ui, sans-serif',
      color: '#aefcff',
      opacity: '0',
      transition: 'opacity 2s ease',
      pointerEvents: 'none',
      fontSize: '0.9rem',
      textShadow: '0 0 6px #00f5ff80'
    });
    document.body.appendChild(sleepLabel);
  }

  // Přizpůsobení velikosti plátna
  function resize() {
    canvas.width = window.innerWidth;
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

    const energy = getEnergy();
    const breathing = Math.sin(t) * 0.03;

    // pokud je energie nízká → spánek
    const asleep = energy < 0.25;

    // dýchání při spánku pomalejší
    const breatheSpeed = asleep ? 0.015 : 0.03;
    const breath = Math.sin(t * (asleep ? 0.5 : 1)) * breatheSpeed;

    // mrkání (když nespí)
    let open = 1;
    if (!asleep) {
      const blinkPeriod = 2 + 4 * (1 - energy);
      const blinkTime = t % blinkPeriod;
      const blinkDur = 0.15 + 0.25 * (1 - energy);
      if (blinkTime < blinkDur) {
        const x = blinkTime / blinkDur;
        open = 1 - Math.sin(x * Math.PI);
      }
      const tiredBias = 0.25 * (1 - energy);
      open = Math.max(0, Math.min(1, open - tiredBias));
    } else {
      open = Math.max(0, 1 - (1 - energy) * 4); // při spánku oči úplně zavřené
    }

    // vykreslení
    ctx.clearRect(0, 0, W, H);

    // tělo (světlo podle energie)
    const g = ctx.createRadialGradient(cx, cy - baseR * 0.6, baseR * 0.1, cx, cy, baseR * 1.6);
    const glow = asleep ? 0.3 : 0.65 + 0.35 * energy;
    g.addColorStop(0, `rgba(123,233,255,${glow})`);
    g.addColorStop(1, '#00121d');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR * 0.8, baseR * (1.8 + breath), 0, 0, Math.PI * 2);
    ctx.fill();

    // oči
    const eyeY = cy - baseR * 0.2;
    const eyeDX = baseR * 0.25;
    const eyeW = baseR * 0.10;
    const eyeHmax = baseR * 0.26;
    const eyeH = Math.max(eyeHmax * 0.07, eyeHmax * open);
    ctx.fillStyle = asleep ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeDX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    // text „Vafi spí... zzz“
    if (asleep) {
      sleepLabel.textContent = 'Vafi spí... zzz';
      sleepLabel.style.opacity = '1';
    } else {
      sleepLabel.style.opacity = '0';
    }

    requestAnimationFrame(loop);
  }

  loop();
}