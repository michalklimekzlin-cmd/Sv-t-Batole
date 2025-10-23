// vivere.flow.js — náš „životní tok“ (bez API)
const listeners = new Set();
const clamp01 = x => Math.max(0, Math.min(1, x));
const lerp = (a,b,t) => a + (b-a)*t;

let t0 = performance.now()/1000;
let active = 0.2, calm = 0.6, curiosity = 0.5, dayPhase = Math.random()*Math.PI*2;
let wave = 0, vitality = 0.7, harmony = 0.6;

function tick(){
  const t = performance.now()/1000; const dt = Math.min(0.05, t - t0); t0 = t;
  dayPhase += dt * 0.08;
  curiosity = clamp01(curiosity + (Math.random()-0.5)*0.002);
  active = clamp01(lerp(active, 0.15, dt*0.25));

  const base = 0.55*Math.sin(t*0.7 + 0.3*Math.sin(dayPhase))
             + 0.30*Math.sin(t*1.7 + 1.2)
             + 0.15*Math.sin(t*3.3 - 0.6);

  wave = Math.tanh(base * (0.8 + active*0.9 + curiosity*0.6)); // -1..+1
  vitality = clamp01(0.55 + 0.35*wave + 0.25*active);
  harmony  = clamp01(0.65 - 0.25*Math.abs(wave) + 0.20*calm);

  const payload = { t, dt, wave, vitality, harmony, curiosity, active };
  listeners.forEach(fn => { try{ fn(payload); }catch(e){} });
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

export function nudge(kind='touch', strength=1){
  if (kind==='touch')   active = clamp01(active + 0.35*strength);
  if (kind==='voice')   active = clamp01(active + 0.25*strength);
  if (kind==='motion')  curiosity = clamp01(curiosity + 0.2*strength);
  if (kind==='calm')    calm = clamp01(calm + 0.2*strength);
}
export function onUpdate(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
export function getFlow(){ return { wave, vitality, harmony, curiosity, active }; }

window.addEventListener('pointerdown', ()=>nudge('touch', 1), {passive:true});
try { window.addEventListener('devicemotion', ()=>nudge('motion', 0.3), {passive:true}); } catch {}