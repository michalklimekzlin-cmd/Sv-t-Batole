// team.human.js — Tým 1: Člověk (Piko)
const LAYER_ID = 'teamHumanLayer';

function el(tag, css){ const n=document.createElement(tag); if(css)Object.assign(n.style,css); return n; }

export async function spawnHuman(){
  // duše (mood/energy) – volitelně
  let Soul = null;
  try { ({ Soul } = await import(`./vafi.soul.js?v=${window.V||'dev'}`)); } catch {}

  let layer = document.getElementById(LAYER_ID);
  if (!layer){
    layer = el('div',{position:'fixed',inset:'0',pointerEvents:'none'});
    layer.id = LAYER_ID; document.body.appendChild(layer);
  }
  const wrap = el('div',{
    position:'absolute', left:'12px', bottom:'12px', display:'flex', gap:'.6rem',
    alignItems:'center', pointerEvents:'none'
  });

  const dot = el('div',{
    width:'18px', height:'18px', borderRadius:'50%',
    boxShadow:'0 0 12px rgba(80,200,255,.6) inset, 0 0 10px rgba(80,200,255,.25)'
  });
  const name = el('span',{
    font:'600 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto',
    color:'#dff', textShadow:'0 1px 0 rgba(0,0,0,.25)', opacity:.9
  });
  name.textContent = 'Piko (člověk)';

  wrap.appendChild(dot); wrap.appendChild(name); layer.appendChild(wrap);

  // dech podle nálady/energie (když Soul existuje)
  let t = 0;
  function loop(){
    t += 1/60;
    let mood=0.6, energy=0.7;
    try{
      if (Soul?.get){ const s=Soul.get(); mood=s.mood; energy=s.energy; }
    }catch{}
    const sz = 16 + Math.sin(t*2)*(3+energy*4);
    dot.style.width = sz+'px';
    dot.style.height = sz+'px';
    dot.style.filter = `drop-shadow(0 0 ${4+energy*8}px rgba(80,200,255,.45))`;
    dot.style.background = `hsl(${200 + (mood-0.5)*80} 90% 60%)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
