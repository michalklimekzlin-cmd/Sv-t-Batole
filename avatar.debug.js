// avatar.debug.js — jednoduchý fallback obličeje
(function () {
  const c = document.getElementById('canvasVafi');
  if (!c) return;

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = c.clientWidth || window.innerWidth;
  const h = c.clientHeight || window.innerHeight;
  c.width = Math.floor(w * dpr);
  c.height = Math.floor(h * dpr);
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = w * 0.5, cy = h * 0.6, R = Math.min(w, h) * 0.15;

  // „mlhové tělo“
  const g = ctx.createRadialGradient(cx, cy, R * 0.08, cx, cy, R);
  g.addColorStop(0, 'rgba(140,240,220,0.85)');
  g.addColorStop(1, 'rgba(40,60,80,0.06)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  // oči
  ctx.fillStyle = 'rgba(12,22,32,0.85)';
  const rx = R * 0.36, ry = R * 0.18;
  ctx.beginPath(); ctx.arc(cx - rx, cy, ry, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + rx, cy, ry, 0, Math.PI * 2); ctx.fill();

  // popisek
  ctx.fillStyle = 'rgba(160,220,210,0.9)';
  ctx.font = '600 14px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.textAlign = 'center';
  ctx.fillText('Fallback: avatar.debug', cx, cy + R * 1.35);
})();
