// avatar.vafi.js — hlavní avatar Vafi
// vykreslení, dýchání a korekce poměru stran

export async function spawnVafi() {
  const canvas = document.getElementById('canvasVafi');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Nastavení velikosti plátna
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Udržuj přirozený poměr stran
    const aspect = canvas.width / canvas.height;
    if (aspect > 0.6 && aspect < 0.8) {
      canvas.style.objectFit = 'contain';
      canvas.style.transform = 'scale(1)';
    } else {
      canvas.style.objectFit = 'cover';
    }
  }

  resize();
  window.addEventListener('resize', resize);

  // Základní proměnné postavy
  let t = 0;
  let breathing = 0;

  // Hlavní smyčka animace
  function loop() {
    t += 0.02;
    breathing = Math.sin(t) * 0.03;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.12;

    // Tělo
    const gradient = ctx.createRadialGradient(cx, cy - baseRadius * 0.6, baseRadius * 0.1, cx, cy, baseRadius * 1.5);
    gradient.addColorStop(0, '#7be9ff');
    gradient.addColorStop(1, '#00121d');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.ellipse(cx, cy, baseRadius * 0.8, baseRadius * (1.8 + breathing), 0, 0, Math.PI * 2);
    ctx.fill();

    // Oči
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    const eyeY = cy - baseRadius * 0.2;
    const eyeX = baseRadius * 0.25;
    const eyeH = baseRadius * 0.25;
    const eyeW = baseRadius * 0.09;
    ctx.beginPath();
    ctx.ellipse(cx - eyeX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(loop);
  }

  loop();
}