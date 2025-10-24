// viri.form.js — generativní engine Viriho (2D canvas)
// API: startViriForm(canvas) -> { setMix, setTheme, destroy }

export function startViriForm(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });

  // ----- deterministická náhoda (per-device) -----
  const seed = hash((navigator.userAgent||'ua') + '|' + innerWidth + 'x' + innerHeight);
  let rng = mulberry32(seed);

  // ----- stav -----
  let mix = { batolesvet: .5, glyph: .3, ai: .3, pedrovci: .3 }; // 0..1
  let theme = 'default';
  let killed = false, t0 = performance.now();

  // resize
  function fit() {
    const dpr = Math.max(1, Math.min(3, devicePixelRatio || 1));
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', fit); fit();

  // --- util ---
  function clamp(x,a=0,b=1){ return Math.max(a,Math.min(b,x)); }
  function mixf(a,b,k){ return a + (b-a)*k; }
  function hash(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i); h=(h*16777619)>>>0;} return h>>>0; }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
  function noise2(x,y){ // jednoduchý value-noise
    function rnd(ix,iy){ const s = hash(ix*73856093 ^ iy*19349663 ^ seed); return (s%1000)/1000; }
    const xi=Math.floor(x), yi=Math.floor(y);
    const xf=x-xi, yf=y-yi;
    const v00=rnd(xi,yi), v10=rnd(xi+1,yi), v01=rnd(xi,yi+1), v11=rnd(xi+1,yi+1);
    const i1=v00+(v10-v00)*(3-2*xf)*xf*xf;
    const i2=v01+(v11-v01)*(3-2*yf)*yf*yf;
    return i1+(i2-i1)*(3-2*yf)*yf*yf;
  }

  // --- barevné palety z týmů ---
  function palette(m) {
    // batolesvet → měkké pastelové, glyph → ink/white, ai → neon/cyan, pedrovci → teplé skin/earth
    const soft = hsl(160+20*rng(), 40, 60);
    const neon = hsl(190+10*rng(), 90, 55);
    const ink  = hsl(200, 10, 10);
    const paper= hsl(0,0,96);
    const skin = hsl(20+10*rng(), 45, 60);
    // míchání
    const glow = blend(soft, neon, m.ai*0.7 + m.batolesvet*0.3);
    const core = blend(glow, skin, m.pedrovci*0.6);
    const outline = blend(ink, neon, m.ai*0.4);
    const glyphCol = blend(paper, neon, m.ai*0.3);
    return { glow, core, outline, glyphCol };
  }
  function hsl(h,s,l){ return {h,s,l}; }
  function blend(a,b,k){ k=clamp(k); return {h: a.h+(b.h-a.h)*k, s: a.s+(b.s-a.s)*k, l: a.l+(b.l-a.l)*k}; }
  function css({h,s,l},a=1){ return `hsla(${h|0},${s|0}%,${l|0}%,${a})`; }

  // --- parametry tvaru z mixu ---
  function params(m, time) {
    const breathe = 0.04 * (0.6 + 0.4*m.batolesvet) * Math.sin(time*0.0016);
    const size = 0.34 + 0.18*m.batolesvet + breathe;                 // mění se dýcháním
    const faceted = clamp(m.ai*0.85);                                 // polygonalita (AI)
    const symbolness = clamp(m.glyph*0.9);                            // znakové prvky
    const humanness = clamp(m.pedrovci*0.95);                         // obličejové rysy
    const rough = clamp( (theme==='stone'?0.9:0.4)*m.pedrovci + 0.25*m.ai ); // textura
    const glow = clamp(0.25 + 0.5*m.ai + 0.3*m.batolesvet - 0.3*(theme==='stone'?1:0));
    return { size, faceted, symbolness, humanness, rough, glow };
  }

  // --- hlavní render ---
  function draw(now) {
    if (killed) return;
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    ctx.clearRect(0,0,w,h);

    const t = (now - t0);
    const p = params(mix, t);
    const pal = palette(mix);

    // pozadí jemně „dýchá“
    const bgPulse = 0.06 + 0.04*Math.sin(t*0.0009 + rng()*10);
    const bg = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, Math.max(w,h)*0.7);
    bg.addColorStop(0, css(blend(pal.core, pal.glow, 0.35), 0.25+bgPulse));
    bg.addColorStop(1, 'black');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,w,h);

    // výpočet střed + velikost
    const r = Math.min(w,h) * p.size;
    const cx = w/2, cy = h/2;

    // --- tělo: superelipsa / polygon s jitterem ---
    ctx.save();
    ctx.translate(cx, cy);

    // rotace od AI (digitální), naklonění od Glyph (komunikace), „živost“ od Batolesvět
    const rot = (mix.ai*0.6 - mix.glyph*0.2) * Math.sin(t*0.0007);
    ctx.rotate(rot);

    // gradient jádra
    const g = ctx.createRadialGradient(0,0,r*0.15, 0,0,r);
    g.addColorStop(0, css(pal.glow, 0.95));
    g.addColorStop(0.28, css(pal.core, 0.85));
    g.addColorStop(1, css(pal.core, theme==='stone'?0.85:0.65));
    ctx.fillStyle = g;

    // tvar
    const sides = 40 + Math.floor(80*p.faceted); // víc AI → víc faset
    const jitter = p.rough * 8 + (theme==='stone'?4:0);
    ctx.beginPath();
    for (let i=0;i<=sides;i++){
      const a = (i/sides) * Math.PI*2;
      // superellipse radius
      const k = 2 - p.faceted*1.2;
      const rx = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 2/k);
      const ry = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 2/k);
      let rr = r * 0.5 * Math.hypot(rx,ry);
      // jitter (textura/nerovnosti)
      rr += (noise2(Math.cos(a)*3 + t*0.0007, Math.sin(a)*3 + t*0.0007) - 0.5) * jitter;
      const x = rr * Math.cos(a), y = rr * Math.sin(a);
      i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
    }
    ctx.closePath();
    ctx.fill();

    // okrajový glow
    ctx.shadowColor = css(pal.glow, p.glow);
    ctx.shadowBlur = 25 + 60*p.glow;
    ctx.strokeStyle = css(pal.outline, 0.25 + 0.35*p.glow);
    ctx.lineWidth = 1 + 2*p.glow;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // digitální „mřížka“ (AI)
    if (mix.ai > 0.45) {
      const grid = 12 + Math.floor(20*mix.ai);
      ctx.globalAlpha = 0.06 + 0.12*mix.ai;
      ctx.beginPath();
      for (let i=-grid;i<=grid;i++){
        const yy = (i/grid)*r*0.55; ctx.moveTo(-r*0.55, yy); ctx.lineTo(r*0.55, yy);
        const xx = (i/grid)*r*0.55; ctx.moveTo(xx, -r*0.55); ctx.lineTo(xx, r*0.55);
      }
      ctx.strokeStyle = css(pal.outline, 0.5);
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // glyph „značky“ (jakobys text/znaky)
    if (p.symbolness > 0.25) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = css(pal.glyphCol, 0.10 + 0.20*p.symbolness);
      ctx.font = `${10 + 18*p.symbolness}px ui-monospace, monospace`;
      const rows = 3 + Math.floor(4*p.symbolness);
      const cols = 6 + Math.floor(8*p.symbolness);
      for (let j=0;j<rows;j++){
        for (let i=0;i<cols;i++){
          const ax = (i/(cols-1)-.5)*r*0.9 + (rng()-0.5)*6;
          const ay = (j/(rows-1)-.5)*r*0.9 + (rng()-0.5)*6;
          if (ax*ax + ay*ay < (r*0.55)*(r*0.55)) {
            const ch = ['*','/','\\','|','.','+','~','>','<','(',')','{','}'][Math.floor(rng()*12)];
            ctx.fillText(ch, ax, ay);
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // jednoduché „oči/úsměv“ (humanness)
    if (p.humanness > 0.22) {
      const faceS = r*0.17;
      ctx.strokeStyle = css({h:0,s:0,l:95}, 0.75);
      ctx.lineWidth = 1.5;
      // oči
      ctx.beginPath();
      ctx.arc(-faceS, -faceS*0.2, 2.2+2.5*p.humanness, 0, Math.PI*2);
      ctx.arc( faceS, -faceS*0.2, 2.2+2.5*p.humanness, 0, Math.PI*2);
      ctx.stroke();
      // úsměv
      ctx.beginPath();
      ctx.arc(0, faceS*0.25, faceS*0.9, Math.PI*0.15, Math.PI*0.85);
      ctx.stroke();
    }

    // kamenná textura (téma "stone" nebo vysoký rough)
    if (theme==='stone' || p.rough > 0.6) {
      ctx.save();
      ctx.globalAlpha = 0.12 + 0.2*p.rough;
      for (let i=0;i<120;i++){
        const a = rng()*Math.PI*2;
        const rr = (rng()*0.55+0.05)*r;
        const x = rr*Math.cos(a), y = rr*Math.sin(a);
        if (x*x+y*y < (r*0.55)*(r*0.55)){
          ctx.fillStyle = css({h:180+20*rng(), s:5+8*rng(), l:40+20*rng()}, 0.35);
          ctx.beginPath(); ctx.arc(x,y, 0.8+2.2*rng(), 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.restore();
    }

    ctx.restore();

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  // --- veřejné API ---
  return {
    setMix(next){
      // normalizace + ochrana
      const m = Object.assign({}, mix, next||{});
      for (const k of ['batolesvet','glyph','ai','pedrovci']) {
        m[k] = clamp(+m[k] || 0, 0, 1);
      }
      mix = m;
    },
    setTheme(next){ theme = (next==='stone') ? 'stone' : 'default'; },
    destroy(){ killed = true; removeEventListener('resize', fit); }
  };
}