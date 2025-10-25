// 💨 VIRI AURA — proudící písmena kolem jádra
export function startViriAura(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let letters = [];
  let t = 0;

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

  for (let i = 0; i < 120; i++) {
    letters.push({
      x: Math.random(),
      y: Math.random(),
      s: 0.8 + Math.random() * 1.5,
      l: charset[Math.floor(Math.random() * charset.length)]
    });
  }

  function draw() {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.font = `${12 + 4 * Math.sin(t * 0.02)}px monospace`;
    ctx.textAlign = 'center';

    letters.forEach((p, i) => {
      const x = p.x * width + Math.sin(t * 0.01 + i) * 20;
      const y = (p.y * height + Math.cos(t * 0.015 + i) * 10) % height;
      ctx.fillText(p.l, x, y);
      if (Math.random() < 0.01) p.l = charset[Math.floor(Math.random() * charset.length)];
    });

    t++;
    requestAnimationFrame(draw);
  }

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}