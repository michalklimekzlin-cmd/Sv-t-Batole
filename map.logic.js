// Jemná „minimapa“ – prstence podle mixu (kreslí do stejného canvasu)
export function initMap({canvas, inventory}){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width  = canvas.clientWidth  || innerWidth;
  const h = canvas.height = canvas.clientHeight || innerHeight;
  const cx = w/2, cy = h/2;

  const mix = inventory?.mix || {};
  const rings = [
    { r: Math.min(w,h)*0.24, a:(mix.batolesvet||0), col:[ 40,220,200] },
    { r: Math.min(w,h)*0.30, a:(mix.glyph     ||0), col:[180,255,255] },
    { r: Math.min(w,h)*0.36, a:(mix.ai        ||0), col:[  0,255,180] },
    { r: Math.min(w,h)*0.42, a:(mix.pedrovci  ||0), col:[255,230,210] },
  ];
  rings.forEach((ring)=>{
    const g = ctx.createRadialGradient(cx,cy, ring.r*0.35, cx,cy, ring.r);
    g.addColorStop(0, `rgba(${ring.col[0]},${ring.col[1]},${ring.col[2]}, ${0.08 + ring.a*0.28})`);
    g.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx,cy,ring.r,0,Math.PI*2); ctx.fill();
  });
}