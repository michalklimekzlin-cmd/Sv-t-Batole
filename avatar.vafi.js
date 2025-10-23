// avatar.vafi.js
import { vafiSoul } from './vafi.soul.js';

const canvas = document.getElementById('canvasVafi');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let time = 0;

function draw() {
  time += 0.01;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const mood = vafiSoul.mood;
  const energy = vafiSoul.energy;

  // barva podle nálady
  const hue = 200 + mood * 100; // přechod modrá–fialová
  const glow = 0.3 + energy * 0.7;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = glow;

  const radius = 80 + Math.sin(time * 2) * 10 + energy * 30;

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
  gradient.addColorStop(1, `hsla(${hue}, 100%, 10%, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  requestAnimationFrame(draw);
}

draw();