// vivere.flow.js — vlastní "životní tok" světa (bez API)
// Výstup: {wave, vitality, harmony, curiosity} + onUpdate(callback)

const listeners = new Set();
const clamp01 = x => Math.max(0, Math.min(1, x));
const lerp = (a,b,t) => a + (b-a)*t;

let t0 = performance.now()/1000;
let active = 0.2;      // přítomnost člověka (0..1)
let calm = 0.6;        // míra klidu (0..1)
let curiosity = 0.5;   // vnitřní touha něco dělat (0..1)
let dayPhase = Math.random()*Math.PI*2;

let wave = 0.0;        // hlavní vlna (-1..+1)
let vitality = 0.7;    // energie (0..1)
let harmony  = 0.6;    // rovnováha (0..1)

function tick(){
  const t = performance.now()/1000;
  const dt = Math.min(0.05, t - t0); t0 = t;

  // Denní rytmus (pomalý dech světa)
  dayPhase += dt * 0.08;
  const dayBeat = Math.sin(dayPhase);             // -1..+1

  // Vnitřní zvědavost lehce "bloudí"
  curiosity = clamp01(curiosity + (Math.random()-0.5)*0.002);

  // Aktivita člověka pomalu vyprchá, když nic nedělá
  active = clamp01(lerp(active, 0.15, dt*0.25));

  // Hladký mix vln: denní dech + vnitřní zvědavost + přítomnost
  const base = 0.55*Math.sin(t*0.7 + 0.3*dayBeat)
             + 0.30*Math.sin(t*1.7 + 1.2)
             + 0.15*Math.sin(t*3.3 - 0.6);

  // Vlna reaguje víc, když jsi přítomen / když je zvědavost vyšší
  wave = Math.tanh(base * (0.8 + active*0.9 + curiosity*0.6)); // -1..+1 (měkký ořez)

  // Odvozené veličiny 0..1:
  vitality = clamp01(0.55 + 0.35*wave + 0.25*active);       // živost ↗ dotyky/hlas
  harmony  = clamp01(0.65 - 0.25*Math.abs(wave) + 0.20*calm); // harmonie ↘ chaos

  const payload = { t, dt, wave, vitality, harmony, curiosity, active };
  listeners.forEach(fn => { try{ fn(payload); }catch(e){} });

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Přijímání signálů zvenčí (ťuk, hlas, pohyb...)
export function nudge(kind='touch', strength=1){
  if (kind==='touch')   active = clamp01(active + 0.35*strength);
  if (kind==='voice')   active = clamp01(active + 0.25*strength);
  if (kind==='motion')  curiosity = clamp01(curiosity + 0.2*strength);
  if (kind==='calm')    calm = clamp01(calm + 0.2*strength);
}

export function onUpdate(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
export function getFlow(){ return { wave, vitality, harmony, curiosity, active }; }

// Volitelné senzory (když prohlížeč povolí)
window.addEventListener('pointerdown', ()=>nudge('touch', 1), {passive:true});
window.addEventListener('keydown',      ()=>nudge('touch', 0.6));
try {
  window.addEventListener('devicemotion', ()=>nudge('motion', 0.3), {passive:true});
} catch {}