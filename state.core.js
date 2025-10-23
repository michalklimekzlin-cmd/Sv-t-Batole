// state.core.js — Centrální stav + tick + jednoduchá event bus

const listeners = new Map(); // event -> Set(f)
function on(event, f){ if(!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(f); return ()=>off(event,f); }
function off(event, f){ listeners.get(event)?.delete(f); }
function emit(event, detail){ listeners.get(event)?.forEach(f=>{ try{ f(detail);}catch(e){console.error('[VAFI]',e);} }); }

const clamp = (x,a=0,b=1)=>Math.min(b,Math.max(a,x));

const state = {
  mood: 0.5,         // 0..1
  energy: 1.0,       // 0..1
  asleep: false,
  t: 0,
  dt: 0,
};

export const State = {
  get: ()=>({ ...state }),
  setMood(v){ state.mood = clamp(v); emit('state:mood', state.mood); },
  setEnergy(v){ state.energy = clamp(v); emit('state:energy', state.energy); },
  setAsleep(v){ state.asleep = !!v; emit('state:sleep', state.asleep); },
  pulse(tag = 'generic', amount = 0.02){
    // krátké zvýšení energie/mood s lehkým rozpadem
    state.energy = clamp(state.energy + amount);
    state.mood = clamp(state.mood + amount*0.5);
    emit('pulse', { tag, amount, now: performance.now() });
  },
  on, off, emit
};

// hlavní tick
let last = performance.now();
function tick(now){
  const dt = (now - last)/1000;
  last = now;
  state.dt = dt;
  state.t += dt;

  // přirozený drobný posun nálady/energie
  if(!state.asleep){
    state.energy = clamp(state.energy - dt*0.005); // pomalé ubývání
  }else{
    state.energy = clamp(state.energy + dt*0.02);  // regenerace ve spánku
  }

  emit('tick', { dt, now: state.t, state: { ...state } });
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// kvalitativní signál očí (nastaví avatar)
State.on('eyes:drawn', ({ drawn })=>{
  // můžeme logovat/diagnostikovat, zatím jen emise
  State.emit('diag', { eyesDrawn: drawn, at: performance.now() });
});
