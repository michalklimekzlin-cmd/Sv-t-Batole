// vafi.soul.js — duše + Flow, s lokální pamětí
import { Memory } from './vafi.memory.js';

export const Soul = (() => {
  const defaults = () => ({
    createdAt: Date.now(),
    lastSeen: Date.now(),
    mood: 0.5,     // 0..1
    energy: 1.0,   // 0..1
    sap: 1.0,      // míza 0..1
    flow: 0.5,     // vnitřní tok 0..1
    ticks: 0
  });

  let S = defaults();

  async function load(){
    const saved = await Memory.load();
    if (saved && typeof saved === 'object') {
      S = { ...defaults(), ...saved };
      whisper('Vafi je nadšený!');
    } else {
      // první spuštění – žádná „zapomněl minulost“
      whisper('Ahoj, jsem Vafi 🌱');
    }
    S.lastSeen = Date.now();
    Memory.saveSoon(S);
  }

  function whisper(text){
    try{
      const el = document.getElementById('vafiStatus');
      if (el) { el.textContent = text; }
    }catch{}
  }

  function clamp01(x){ return Math.max(0, Math.min(1, x)); }

  function tick(dt){
    // jemný metabolismus
    const decay = 0.003 * dt;        // ztráta energie
    const recharge = 0.002 * dt;     // obnova mízy v klidu
    S.energy = clamp01(S.energy - decay + (S.sap * 0.5 * recharge));
    // nálada pomalu driftuje k flow
    S.mood   = clamp01(S.mood + (S.flow - S.mood) * (0.25 * dt));
    // míza lehce klesá, ale regeneruje
    S.sap    = clamp01(S.sap - 0.0005 * dt + 0.0008 * dt);
    S.ticks++;
  }

  function nudge(by){
    S.mood = clamp01(S.mood + by);
    S.energy = clamp01(S.energy + Math.sign(by)*0.03);
    S.flow = clamp01(S.flow + by*0.5);
    Memory.saveSoon(S);
  }

  // veřejné API
  return {
    state: () => S,
    async init(){
      await load();
      // autosave: každých 10 s a při skrytí/odchodu
      setInterval(()=>Memory.save(S), 10_000);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) Memory.save(S);
      });
      window.addEventListener('beforeunload', () => Memory.save(S));
    },
    tick,
    nudge
  };
})();