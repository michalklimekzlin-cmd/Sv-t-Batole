// viri.form.js – kreslí centrální "bytost" podla mixu týmů
export function startViriForm(canvas){
  const ctx = canvas.getContext('2d');
  const mix = { batolesvet: .25, glyph: .25, ai: .25, pedrovci: .25 };
  let t = 0;

  function setMix(m){ Object.assign(mix, m||{}); }

  function draw(){
    const w = canvas.width, h = canvas.height, cx=w/2, cy=h/2;
    ctx.clearRect(0,0,w,h);

    // --- 1) základní „živá“ koule (Batolesvět = život/energie)
    const life = mix.batolesvet;
    const r = (Math.min(w,h)*0.22) * (0.85 + 0.15*Math.sin(t*2));
    const g = ctx.createRadialGradient(cx,cy,r*0.05, cx,cy,r*1.1);
    g.addColorStop(0,   `rgba(${30+120*life},${80+120*life},${90+140*life},1)`);
    g.addColorStop(0.6, `rgba(0,60,60,0.25)`);
    g.addColorStop(1,   `rgba(0,0,0,0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

    // --- 2) glyph vrstvy (symboly & znaky)
    const gy = mix.glyph;
    if (gy>0.03){
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(t*0.2);
      ctx.globalAlpha = 0.15 + 0.35*gy;
      ctx.strokeStyle = `rgba(150,255,255,${0.25+0.35*gy})`;
      ctx.lineWidth = 1 + 2*gy;
      const rings = 3 + Math.round(5*gy);
      for(let i=1;i<=rings;i++){
        ctx.beginPath();
        ctx.ellipse(0,0, r*0.4 + i*8, r*0.4 + i*8*1.1, 0, 0, Math.PI*2);
        ctx.stroke();
      }
      // „znaky“
      ctx.font = `${12+18*gy}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      for(let k=0;k<10+gy*30;k++){
        const ang = t*0.4 + k*0.6, rr = r*0.55 + (k%5)*6;
        ctx.save(); ctx.rotate(ang); ctx.translate(rr,0);
        ctx.fillText(k%2?'∴':'⋄', 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }

    // --- 3) AI „digitální“ facetky (šestiúhelníky)
    const ai = mix.ai;
    if (ai>0.03){
      ctx.save();
      ctx.globalAlpha = 0.10 + 0.25*ai;
      ctx.strokeStyle = `rgba(0,255,200,${0.25+0.35*ai})`;
      const cells = 5 + Math.round(10*ai);
      for(let i=0;i<cells;i++){
        const ang = t*0.5 + i*(Math.PI*2/cells);
        const rr = r*0.35 + (i%3)*r*0.08;
        hex(ctx, cx + Math.cos(ang)*rr, cy + Math.sin(ang)*rr, 8+ai*10);
      }
      ctx.restore();
    }

    // --- 4) Pedrovci (lidskost) – jemný „obličej“
    const p = mix.pedrovci;
    if (p>0.03){
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.5*p;
      ctx.fillStyle = `rgba(240,255,255,${0.6*p})`;
      // oči
      ctx.beginPath(); ctx.arc(cx-r*0.18, cy-r*0.05, 4+4*p, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+r*0.18,  cy-r*0.05, 4+4*p, 0, Math.PI*2); ctx.fill();
      // úsměv
      ctx.strokeStyle = `rgba(220,255,255,${0.6*p})`;
      ctx.lineWidth = 2+2*p;
      ctx.beginPath();
      ctx.arc(cx, cy+r*0.06, r*0.18, Math.PI*0.15, Math.PI- Math.PI*0.15);
      ctx.stroke();
      ctx.restore();
    }

    t += 0.016;
    requestAnimationFrame(draw);
  }
  function hex(c,x,y,r){
    c.beginPath();
    for(let i=0;i<6;i++){
      const a = Math.PI/3*i;
      const xx = x + Math.cos(a)*r;
      const yy = y + Math.sin(a)*r;
      i?c.lineTo(xx,yy):c.moveTo(xx,yy);
    }
    c.closePath(); c.stroke();
  }

  draw();
  return { setMix };
}