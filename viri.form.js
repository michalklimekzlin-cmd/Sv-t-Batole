export function startViriForm(canvas){
  const ctx = canvas.getContext('2d');
  let mix = { batolesvet:0, glyph:0, ai:0, pedrovci:0 };
  function setMix(m){ mix = m; }
  function draw(){
    const {width:w, height:h} = canvas;
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, r=Math.min(w,h)/3;
    const g=ctx.createRadialGradient(cx,cy,r*0.1,cx,cy,r);
    const col=`rgb(${Math.floor(mix.ai*255)},${Math.floor(mix.batolesvet*255)},${Math.floor(mix.glyph*255)})`;
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fill();
    requestAnimationFrame(draw);
  }
  draw();
  return { setMix };
}