// viri.inventory.js – generuje assety podle mixu a stavu
// API: buildInventory({mix, mood, label}) -> {images:{...}, meta:{...}}

function makeCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function circle(ctx,x,y,r,style){ ctx.fillStyle=style; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }

function hsl(h,s,l,a=1){ return `hsla(${h|0},${s|0}%,${l|0}%,${a})`; }
function lerp(a,b,t){ return a+(b-a)*t; }

async function toBitmap(canvas){ return await createImageBitmap(canvas); }

export async function buildInventory(state){
  const { mix, mood, label } = state;
  const out = { images:{}, meta:{ label, mood, mix } };

  // ---- CORE GEM (centrální krystal/jádro pro mapu) ----
  {
    const c = makeCanvas(128,128), x=64, y=64, ctx=c.getContext('2d');
    const hue = lerp(160, 200, mix.ai); // víc AI → víc cyan
    const light = lerp(58, 75, mix.batolesvet); // víc Batole → světlejší
    const core = ctx.createRadialGradient(x,y,10, x,y,60);
    core.addColorStop(0, hsl(hue, 90, 70));
    core.addColorStop(.4, hsl(hue, 60, light));
    core.addColorStop(1, hsl(hue, 40, 12, 0.0));
    circle(ctx,x,y,60, core);

    // obličejové rysy (Pedrovci)
    if (mix.pedrovci > .25) {
      ctx.strokeStyle = hsl(0,0,95, .85);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(46,60,5,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(82,60,5,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(64,78,16,Math.PI*0.2, Math.PI*0.8); ctx.stroke();
    }
    // glyph „vousek“ (komunikace)
    if (mix.glyph > .3) {
      ctx.globalCompositeOperation='lighter';
      ctx.fillStyle = hsl(190,15,98, .18+.25*mix.glyph);
      ctx.font = `${10 + 12*mix.glyph}px ui-monospace, monospace`;
      const chars = ['*','.','/','\\','|','>','<','~','(',')','{','}'];
      for (let i=0;i<60*mix.glyph;i++){
        const ax = 20 + Math.random()*88, ay = 20 + Math.random()*88;
        ctx.fillText(chars[(Math.random()*chars.length)|0], ax, ay);
      }
      ctx.globalCompositeOperation='source-over';
    }

    out.images.core = await toBitmap(c);
  }

  // ---- ORB SHARD (sběratelný střep) – AI/Glyph ovlivní tvar ----
  {
    const c = makeCanvas(96,96), ctx=c.getContext('2d');
    ctx.translate(48,48);
    ctx.rotate((Math.random()-0.5)*mix.ai*0.8);
    ctx.beginPath();
    const sides = 3 + Math.round(5*mix.ai) + Math.round(2*mix.glyph);
    for (let i=0;i<=sides;i++){
      const a = (i/sides)*Math.PI*2;
      const r = 28 + Math.sin(a*3 + mix.glyph*4)*6 + Math.random()*4*mix.ai;
      const x = Math.cos(a)*r, y = Math.sin(a)*r;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle = hsl(200, 50+40*mix.ai, 45+25*mix.batolesvet, .9);
    ctx.shadowColor = hsl(190, 90, 70, .5);
    ctx.shadowBlur = 14;
    ctx.fill();
    out.images.shard = await toBitmap(c);
  }

  // ---- EMO BUBBLE (emocionální kapsle) – Pedrovci určují barvy ----
  {
    const c = makeCanvas(96,96), ctx=c.getContext('2d');
    const hue = 20 + 25*mix.pedrovci; // teplejší s Pedrovci
    const g = ctx.createRadialGradient(48,48,6, 48,48,44);
    g.addColorStop(0, hsl(hue, 70, 70));
    g.addColorStop(1, hsl(hue, 40, 30, .0));
    circle(ctx,48,48,44,g);
    out.images.emo = await toBitmap(c);
  }

  // ---- GLYPH COIN (komunikace mince) ----
  {
    const c = makeCanvas(88,88), ctx=c.getContext('2d');
    circle(ctx,44,44,40, hsl(210,15,18));
    ctx.strokeStyle = hsl(210,25,60); ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle = hsl(190, 30+60*mix.glyph, 60+20*mix.batolesvet);
    ctx.font = `bold ${26 + 12*mix.glyph}px ui-monospace, monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const symbol = mix.glyph>.6 ? '\\{*(•.)(.•)*/' : '<•>';
    ctx.fillText(symbol, 44, 44);
    out.images.glyph = await toBitmap(c);
  }

  return out;
}
