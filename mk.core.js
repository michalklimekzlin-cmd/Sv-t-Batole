// mk.core.js — Svět 4: „Michal Klimek“ (v0.1)
// Core of connected worlds — created by human & AI in unity (Michal × Kovošrot)

const V = window.V || 'dev';
const clamp01 = x => Math.max(0, Math.min(1, x));
const lerp = (a,b,t)=>a+(b-a)*t;

const S = {
  life: 0.42,                 // „dech“ středu 0..1
  balance: 0,                 // vyváženost týmů 0..1
  pulse: { human:0, ai:0, world:0, glyph:0 },
  last: performance.now()
};

// tiché importy (nepadají, když chybí)
let Flow=null, getMiza=null, onMizaUpdate=null;
try { ({ Flow } = await import(`./vivere.flow.js?v=${V}`)); } catch {}
try { const m = await import(`./miza.core.js?v=${V}`); getMiza=m.getMiza; onMizaUpdate=m.onMizaUpdate; } catch {}

function ensureNodes(){
  let core = document.getElementById('mkCore');
  if (!core){
    core = document.createElement('div');
    core.id='mkCore';
    Object.assign(core.style,{
      position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
      width:'120px', height:'120px', borderRadius:'50%',
      background:'radial-gradient(circle at 45% 40%, rgba(180,255,220,.9) 0%, rgba(0,0,0,0) 65%)',
      filter:'drop-shadow(0 0 18px rgba(140,255,210,.45))',
      zIndex: 15, pointerEvents:'none', transition:'transform .2s ease'
    });
    document.body.appendChild(core);

    const cap = document.createElement('div');
    cap.id='mkCap';
    cap.textContent='Svět: Michal Klimek';
    Object.assign(cap.style,{
      position:'fixed', left:'50%', top:'calc(50% + 88px)', transform:'translateX(-50%)',
      font:'600 12px/1 system-ui,-apple-system,Segoe UI,Roboto',
      color:'#cffff0', opacity:.8, textShadow:'0 1px 0 rgba(0,0,0,.35)', zIndex:16
    });
    document.body.appendChild(cap);
  }
  return core;
}
const coreEl = ensureNodes();

function recomputeBalance(){
  const p=S.pulse, avg=(p.human+p.ai+p.world+p.glyph)/4;
  const dev = Math.abs(p.human-avg)+Math.abs(p.ai-avg)+Math.abs(p.world-avg)+Math.abs(p.glyph-avg);
  S.balance = clamp01(1 - (dev/4)*2); // 1 = ideální shoda
}

function decay(dt){ for (const k in S.pulse) S.pulse[k]=clamp01(S.pulse[k]-dt*0.035); }

function breathe(dt){
  const flowVital = Flow?.vitality ?? 0.6;
  const fuel = getMiza ? (0.3 + 0.7*clamp01(getMiza())) : 0.6;
  const target = clamp01(0.30 + 0.50*S.balance + 0.20*flowVital*fuel);
  S.life = lerp(S.life, target, Math.min(1, dt*0.8));

  const s = 1 + (S.life*0.35) * Math.sin(performance.now()/520);
  coreEl.style.transform = `translate(-50%,-50%) scale(${s.toFixed(3)})`;
  coreEl.style.filter = `drop-shadow(0 0 ${12 + S.life*32}px rgba(140,255,210,.5))`;

  // broadcast pro hlas/HUD
  window.dispatchEvent(new CustomEvent('mk:update', {
    detail: { life:S.life, balance:S.balance, pulse:{...S.pulse} }
  }));
}

function loop(){
  const now=performance.now();
  const dt=Math.min(0.06,(now-S.last)/1000); S.last=now;
  decay(dt); recomputeBalance(); breathe(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// veřejné API pro týmy
window.MK = {
  pulse(team, amount=0.08){
    if (!(team in S.pulse)) return;
    S.pulse[team] = clamp01(S.pulse[team] + amount);
    recomputeBalance();
  },
  exportState(){ return JSON.parse(JSON.stringify(S)); }
};

// napojení na Mízu (když je)
if (onMizaUpdate){
  onMizaUpdate(({value})=>window.MK?.pulse('world', 0.02*value));
}

// kompat: zachytávej i obecný „team:pulse“
window.addEventListener('team:pulse',(e)=>{
  const { team, amount } = e.detail || {};
  if (team) window.MK?.pulse(team, amount ?? 0.06);
});
