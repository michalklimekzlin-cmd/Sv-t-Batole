// viri.form.js — kreslí a tvaruje Viriho podle mixu týmů
export function startViriForm(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let mix = { batolesvet: .25, glyph: .25, ai: .25, pedrovci: .25 };
  let t = 0;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  addEventListener('resize', resize);

  function draw() {
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;

    // vyčistit
    ctx.clearRect(0,0,w,h);

    // základní poloměr a dýchání
    const base = Math.min(w,h) * 0.18;
    const breathe = 1 + Math.sin(t*0.9)*0.04;

    // 💚 Batolesvět: síla halo (život/engine)
    const halo = base * (1.8 + mix.batolesvet*1.0);
    const g1 = ctx.createRadialGradient(cx,cy, base*0.2, cx,cy, halo);
    g1.addColorStop(0,   `rgba(0,180,160,${0.30 + mix.batolesvet*0.25})`);
    g1.addColorStop(1.0, `rgba(0,0,0,0)`);
    ctx.fillStyle = g1;
    ctx.beginPath(); ctx.arc(cx,cy, halo, 0, Math.PI*2); ctx.fill();

    // 🧠 AI: digitální zrnění / „pixely“
    if (mix.ai > 0.03) {
      const step = Math.max(3, Math.floor(14 - mix.ai*10));
      ctx.globalAlpha = 0.06 + mix.ai*0.12;
      for (let x=cx-halo; x<cx+halo; x+=step) {
        const y = cy + Math.sin((x+t*8)/28)*step*2;
        ctx.fillRect(x, y, step, step);
      }
      ctx.globalAlpha = 1;
    }

    // 🙂 Pedrovci: mírné „lidské“ rysy
    const r = base * breathe;
    const face = mix.pedrovci;
    const body = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r*1.05);
    body.addColorStop(0, `rgba(140,255,230,${0.75 + face*0.1})`);
    body.addColorStop(1, `rgba(0,30,25,0)`);
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

    if (face > 0.06) {
      ctx.fillStyle = `rgba(0,40,35,${0.25 + face*0.35})`;
      const er = r*0.12;
      ctx.beginPath(); ctx.arc(cx-r*0.28, cy-r*0.12, er, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+r*0.28, cy-r*0.12, er, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(cx-r*0.18, cy+r*0.12, r*0.36, r*0.07);
    }

    // ✳️ Glyph: symbolické čárky okolo
    if (mix.glyph > 0.02) {
      ctx.strokeStyle = `rgba(120,255,240,${0.25 + mix.glyph*0.35})`;
      ctx.lineWidth = 1 + mix.glyph*2;
      const spikes = 10 + Math.floor(mix.glyph*14);
      for (let i=0;i<spikes;i++){
        const a = i/spikes * Math.PI*2 + t*0.1;
        const r1 = r*1.05, r2 = r*1.2 + Math.sin(t*2 + i)*8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a)*r1, cy + Math.sin(a)*r1);
        ctx.lineTo(cx + Math.cos(a)*r2, cy + Math.sin(a)*r2);
        ctx.stroke();
      }
    }

    t += 0.02 + mix.ai*0.01 + mix.batolesvet*0.005; // lehká modulace rychlosti
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  const api = {
    setMix(next){
      mix = {
        batolesvet: clamp(next.batolesvet ?? mix.batolesvet),
        glyph:      clamp(next.glyph      ?? mix.glyph),
        ai:         clamp(next.ai         ?? mix.ai),
        pedrovci:   clamp(next.pedrovci   ?? mix.pedrovci),
      };
    }
  };
  // abychom na něj snadno dosáhli i z jiných modulů
  window.viriForm = api;
  return api;
}

function clamp(v){ v = +v; if(Number.isNaN(v)) return 0; return Math.max(0, Math.min(1, v)); }