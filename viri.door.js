// 🧱 VIRI DOOR — holografické „dveře“ do dílny
export function startViriDoor(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function draw() {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 4;
    const pulse = Math.sin(t * 0.03) * 10;

    const grd = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius + 40);
    grd.addColorStop(0, `rgba(0,255,255,${0.05 + 0.05 * Math.sin(t * 0.1)})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // světelné pruhy kolem „portálu“
    for (let i = 0; i < 8; i++) {
      const angle = (t * 0.02 + i * Math.PI / 4);
      const x = cx + Math.cos(angle) * (radius + 20);
      const y = cy + Math.sin(angle) * (radius + 20);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,200,255,${0.3 + 0.3 * Math.sin(t * 0.2 + i)})`;
      ctx.fill();
    }

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
