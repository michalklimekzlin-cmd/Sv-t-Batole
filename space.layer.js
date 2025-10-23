// space.layer.js — velmi lehký hvězdný prostor do background plátna
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d', { alpha: false });

let w=0,h=0, stars=[];
function resize(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  w = cvs.clientWidth; h = cvs.clientHeight;
  cvs.width = w*dpr; cvs.height = h*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);

  // pár hvězdiček (lehké)
  const n = Math.round((w*h)/120000); // měřítko hustoty
  stars = Array.from({length:n}, ()=>({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.2+0.3,
    p: Math.random()*Math.PI*2,   // fáze blikání
    s: 0.5 + Math.random()*0.8    // rychlost
  }));
}
resize();
window.addEventListener('resize', resize);

function tick(t){
  ctx.fillStyle = 'rgb(3,7,12)'; // velmi tmavé pozadí
  ctx.fillRect(0,0,w,h);

  // slabé modré linie = necháme překreslit tvým enginem (nezasahujeme)
  // jen hvězdy:
  for (const s of stars){
    const a = 0.35 + 0.35*Math.sin(s.p + t*0.0015*s.s);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = '#9bdcff';
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
