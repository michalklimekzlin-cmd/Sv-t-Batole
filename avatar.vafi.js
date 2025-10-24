if (window.__VAFI_ORB_ACTIVE__) {
  console.warn('Vafi orb už běží – druhé spuštění odmítnuto.');
  // rychlý exit modulu
} else {
  window.__VAFI_ORB_ACTIVE__ = true;
}
// avatar.vafi.js — pulzující orb (autostart)
(function () {
  const canvas = document.getElementById('canvasVafi');
  if (!canvas) { console.warn('canvasVafi nenalezen'); return; }
  const ctx = canvas.getContext('2d', { alpha: true });

  function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  let t = 0;

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.58;
    const baseR = Math.min(canvas.width, canvas.height) * 0.16;
    const r = baseR + Math.sin(t) * (baseR * 0.06); // „dýchání“

    // jemná záře
    const g = ctx.createRadialGradient(cx, cy, r*0.12, cx, cy, r*1.25);
    g.addColorStop(0.00, 'rgba(160,255,230,1)');
    g.addColorStop(0.55, 'rgba(110,210,190,0.95)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fill();

    t += 0.04;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();