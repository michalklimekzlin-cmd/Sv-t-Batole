// Vizualizace Viriho – vzhled se mění podle mixu týmů
export function startViriForm(canvas){
  const ctx = canvas.getContext('2d');
  let mix = { batolesvet:0, glyph:0, ai:0, pedrovci:0 };
  let w=0,h=0,cx=0,cy=0;

  function resize(){
    w = canvas.width  = canvas.clientWidth  || innerWidth;
    h = canvas.height = canvas.clientHeight || innerHeight;
    cx = w/2; cy = h/2;
  }
  addEventListener('resize', resize); resize();

  function draw(){
    ctx.clearRect(0,0,w,h);

    // základní orb (Batolesvět = měkké jádro)
    const baseR = Math.min(w,h)*0.16;
    const r = baseR*(0.9 + mix.batolesvet*0.6);
    const g = ctx.createRadialGradient(cx,cy, r*0.18, cx,cy, r);
    g.addColorStop(0, `rgba(60,240,210, ${.18 + mix.batolesvet*.35})`);
    g.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

    // AI – digitální „scan lines“
    if(mix.ai>0.05){
      ctx.globalAlpha = Math.min(0.25, mix.ai*0.35);
      for(let i=-r;i<=r;i+=Math.max(2, 10 - mix.ai*8)){
        const yy = cy + i;
        ctx.fillStyle = `rgba(0,255,200,.6)`;
        ctx.fillRect(cx-r, yy, r*2, 1);
      }
      ctx.globalAlpha = 1;
    }

    // Glyph – znaky kolem
    if(mix.glyph>0.05){
      const count = Math.round(6 + mix.glyph*18);
      ctx.fillStyle = `rgba(200,255,255, ${.25+mix.glyph*.5})`;
      ctx.font = `${12+mix.glyph*8}px system-ui,-apple-system,sans-serif`;
      for(let i=0;i<count;i++){
        const a = (i/count)*Math.PI*2;
        const rr = r*1.15;
        const x = cx + Math.cos(a)*rr;
        const y = cy + Math.sin(a)*rr;
        const s = ['→','•','✶','◦','⟡','/','\\'][i%7];
        ctx.fillText(s, x, y);
      }
    }

    // Pedrovci – jednoduché „oči“/lidský dotek
    if(mix.pedrovci>0.1){
      const eyeR = 3 + mix.pedrovci*6;
      const offX = r*0.28, offY = -r*0.10;
      ctx.fillStyle = `rgba(240,255,255, ${.7})`;
      ctx.beginPath(); ctx.arc(cx-offX, cy+offY, eyeR, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+offX, cy+offY, eyeR, 0, Math.PI*2); ctx.fill();
      // úsměv
      ctx.strokeStyle = `rgba(240,255,255, ${.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy+offY+eyeR*3.2, r*0.22, Math.PI*0.15, Math.PI*0.85);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  return {
    setMix:(m)=>{ mix = {...mix, ...m}; },
  };
}