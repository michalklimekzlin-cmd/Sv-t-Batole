// viri.form.js — generativní vizuál Viriho (plně reaktivní na mix týmů)
export function startViriForm(canvas) {
  const ctx = canvas.getContext('2d', { alpha:false });

  const seed = hash((navigator.userAgent||'ua') + '|' + innerWidth + 'x' + innerHeight);
  let rng = mulberry32(seed);

  let mix = { batolesvet:.5, glyph:.3, ai:.3, pedrovci:.3 };
  let theme = 'default';
  let killed = false, t0 = performance.now();

  function fit(){
    const dpr = Math.max(1, Math.min(3, devicePixelRatio||1));
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    canvas.width = Math.floor(w*dpr);
    canvas.height= Math.floor(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', fit); fit();

  function clamp(x,a=0,b=1){ return Math.max(a,Math.min(b,x)); }
  function hash(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i); h=(h*16777619)>>>0;} return h>>>0; }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
  function noise2(x,y){ function rnd(ix,iy){ const s=hash(ix*73856093 ^ iy*19349663 ^ seed); return (s%1000)/1000; }
    const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
    const v00=rnd(xi,yi), v10=rnd(xi+1,yi), v01=rnd(xi,yi+1), v11=rnd(xi+1,yi+1);
    const i1=v00+(v10-v00)*(3-2*xf)*xf*xf, i2=v01+(v11-v01)*(3-2*yf)*yf*yf;
    return i1+(i2-i1)*(3-2*yf)*yf*yf;
  }
  const hsl=(h,s,l)=>({h,s,l});
  const blend=(a,b,k)=>({h:a.h+(b.h-a.h)*k, s:a.s+(b.s-a.s)*k, l:a.l+(b.l-a.l)*k});
  const css=({h,s,l},a=1)=>`hsla(${h|0},${s|0}%,${l|0}%,${a})`;

  function palette(m){
    const soft=hsl(160+20*rng(),40,60), neon=hsl(190+10*rng(),90,55), ink=hsl(200,10,10), paper=hsl(0,0,96), skin=hsl(20+10*rng(),45,60);
    const glow=blend(soft,neon, m.ai*0.7 + m.batolesvet*0.3);
    const core=blend(glow,skin, m.pedrovci*0.6);
    const outline=blend(ink,neon, m.ai*0.4);
    const glyphCol=blend(paper, neon, m.ai*0.3);
    return {glow,core,outline,glyphCol};
  }
  function params(m, time){
    const breathe=0.04*(0.6+0.4*m.batolesvet)*Math.sin(time*0.0016);
    const size=0.34+0.18*m.batolesvet + breathe;
    const faceted=clamp(m.ai*0.85);
    const symbolness=clamp(m.glyph*0.9);
    const humanness=clamp(m.pedrovci*0.95);
    const rough=clamp(0.4*m.pedrovci + 0.25*m.ai);
    const glow=clamp(0.25 + 0.5*m.ai + 0.3*m.batolesvet);
    return {size, faceted, symbolness, humanness, rough, glow};
  }

  function draw(now){
    if(killed) return;
    const w = canvas.clientWidth||canvas.width, h = canvas.clientHeight||canvas.height;
    ctx.clearRect(0,0,w,h);
    const t = (now - t0);
    const m = mix, p = params(m,t), pal=palette(m);

    const bg = ctx.createRadialGradient(w/2,h/2,10, w/2,h/2, Math.max(w,h)*0.7);
    bg.addColorStop(0, css(blend(pal.core, pal.glow, 0.35), 0.28+0.06*Math.sin(t*0.0009)));
    bg.addColorStop(1, 'black');
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

    const r = Math.min(w,h) * p.size, cx=w/2, cy=h/2;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate((m.ai*0.6 - m.glyph*0.2)*Math.sin(t*0.0007));

    const g = ctx.createRadialGradient(0,0,r*0.15, 0,0,r);
    g.addColorStop(0, css(pal.glow, 0.95));
    g.addColorStop(0.28, css(pal.core, 0.85));
    g.addColorStop(1, css(pal.core, 0.65));
    ctx.fillStyle = g;

    const sides = 40 + Math.floor(80*p.faceted);
    const jitter = p.rough * 8;
    ctx.beginPath();
    for(let i=0;i<=sides;i++){
      const a=(i/sides)*Math.PI*2, k=2 - p.faceted*1.2;
      const rx=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)), 2/k);
      const ry=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)), 2/k);
      let rr=r*0.5*Math.hypot(rx,ry);
      rr += (noise2(Math.cos(a)*3 + t*0.0007, Math.sin(a)*3 + t*0.0007) - .5) * jitter;
      const x=rr*Math.cos(a), y=rr*Math.sin(a);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath(); ctx.fill();

    ctx.shadowColor=css(pal.glow, p.glow); ctx.shadowBlur=25+60*p.glow;
    ctx.strokeStyle=css(pal.outline, 0.25+0.35*p.glow); ctx.lineWidth=1+2*p.glow; ctx.stroke();
    ctx.shadowBlur=0;

    if(m.ai>0.45){
      const grid=12 + Math.floor(20*m.ai);
      ctx.globalAlpha=0.06 + 0.12*m.ai; ctx.beginPath();
      for(let i=-grid;i<=grid;i++){
        const yy=(i/grid)*r*0.55; ctx.moveTo(-r*0.55,yy); ctx.lineTo(r*0.55,yy);
        const xx=(i/grid)*r*0.55; ctx.moveTo(xx,-r*0.55); ctx.lineTo(xx,r*0.55);
      }
      ctx.strokeStyle=css(pal.outline,0.5); ctx.lineWidth=0.6; ctx.stroke(); ctx.globalAlpha=1;
    }

    if(p.symbolness>0.25){
      ctx.globalCompositeOperation='lighter';
      ctx.fillStyle=css(pal.glyphCol, 0.10+0.20*p.symbolness);
      ctx.font=`${10 + 18*p.symbolness}px ui-monospace, monospace`;
      const rows=3+Math.floor(4*p.symbolness), cols=6+Math.floor(8*p.symbolness);
      const chars=['*','/','\\','|','.','+','~','>','<','(',')','{','}'];
      for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){
        const ax=(i/(cols-1)-.5)*r*0.9 + (rng()-.5)*6;
        const ay=(j/(rows-1)-.5)*r*0.9 + (rng()-.5)*6;
        if (ax*ax + ay*ay < (r*0.55)*(r*0.55)) ctx.fillText(chars[(rng()*chars.length)|0], ax, ay);
      }
      ctx.globalCompositeOperation='source-over';
    }

    if(p.humanness>0.22){
      const faceS=r*0.17; ctx.strokeStyle='rgba(255,255,255,0.75)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(-faceS, -faceS*0.2, 2.2+2.5*p.humanness, 0, Math.PI*2);
      ctx.arc( faceS, -faceS*0.2, 2.2+2.5*p.humanness, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, faceS*0.25, faceS*0.9, Math.PI*0.15, Math.PI*0.85); ctx.stroke();
    }

    ctx.restore();
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  return {
    setMix(next){ for (const k of ['batolesvet','glyph','ai','pedrovci']) { if(next[k]!=null) mix[k]=Math.max(0,Math.min(1,+next[k])); } },
    setTheme(next){ theme = (next==='stone') ? 'stone' : 'default'; },
    destroy(){ killed=true; removeEventListener('resize', fit); }
  };
}