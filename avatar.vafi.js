// avatar.vafi.js — vizuální tělo (orb)
const canvas = document.getElementById('canvasVafi');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resize);
resize();

let pulse = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const baseR = Math.min(canvas.width, canvas.height) * 0.15;
  const r = baseR + Math.sin(pulse) * 10;

  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#7fffd4');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  pulse += 0.05;
  requestAnimationFrame(draw);
}
draw();