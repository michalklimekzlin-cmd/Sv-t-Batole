// life.core.js — společný základ „života“ pro týmy (srdce/energie, mysl, paměť)
const clamp01=x=>Math.max(0,Math.min(1,x));
const now=()=>performance.now();

export function createLife(cfg){
  const id = cfg.id;           // 'human' | 'ai' | 'glyph' | 'world'
  const color = cfg.color || '#9cf';
  const corner = cfg.corner || 'tl'; // tl,tr,bl,br
  const memKey = 'LIFE_'+id.toUpperCase();

  // stav
  let S = {
    energy:  cfg.energy ?? 0.8,
    mood:    cfg.mood   ?? 0.6,
    created: Date.now(),
    t: 0, last: now()
  };
  try{ const saved=JSON.parse(localStorage.getItem(memKey)||'null'); if(saved) Object.assign(S,saved); }catch{}

  // DOM badge
  const el = document.createElement('div');
  Object.assign(el.style,{
    position:'fixed', zIndex:20, padding:'.45rem .6rem',
    border:'1px solid rgba(200,255,255,.35)', borderRadius:'.6rem',
    background:'rgba(10,20,24,.55)', backdropFilter:'blur(6px) saturate(120%)',
    color:'#e8feff', font:'600 12px/1 system-ui', pointerEvents:'auto', userSelect:'none'
  });
  el.id = 'life_'+id;
  el.textContent = (cfg.label||id)+' • '+Math.round(S.energy*100)+'%';
  place(el, corner);
  document.body.appendChild(el);

  function place(node, c){
    const pad=12;
    node.style.left=''; node.style.right=''; node.style.top=''; node.style.bottom='';
    if(c==='tl'){node.style.left=pad+'px'; node.style.top=pad+'px';}
    if(c==='tr'){node.style.right=pad+'px'; node.style.top=pad+'px';}
    if(c==='bl'){node.style.left=pad+'px'; node.style.bottom=pad+'px';}
    if(c==='br'){node.style.right=pad+'px'; node.style.bottom=pad+'px';}
  }

  // hlavní smyčka (srdce)
  function tick(){
    const t1 = now(); const dt = Math.min(0.06,(t1 - S.last)/1000); S.last = t1; S.t += dt;

    // metabolismus
    const drain = 0.006;             // úbytek
    const regen = cfg.inflow ? clamp01(cfg.inflow(S))*0.01 : 0; // příjem
    S.energy = clamp01(S.energy - drain*dt + regen*dt);

    // mysl (volitelná funkce „think“ od adapteru)
    if (cfg.think) cfg.think(S, dt, el);

    // vizuál + ukládání
    el.textContent = (cfg.label||id)+' • '+Math.round(S.energy*100)+'%';
    el.style.boxShadow = `0 0 ${6+S.energy*10}px ${color} inset, 0 0 ${S.energy*14}px ${color}33`;
    if ((S.t%2)<0.02){ try{ localStorage.setItem(memKey, JSON.stringify(S)); }catch{} }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // veřejné háčky
  return {
    pulse(x=0.05){ S.energy = clamp01(S.energy + x); flash(); },
    state(){ return {...S}; },
    el
  };

  function flash(){ el.animate([{opacity:.8},{opacity:1}],{duration:220,easing:'ease-out'}); }
}
