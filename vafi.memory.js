// vafi.memory.js (lite)
// Lokální paměť v localStorage (per-device).
const KEY = 'vafi.memory.v1';
const def = { stats:{ mood:0.5, energy:1.0 }, lastSeen: Date.now(), notes:[] };

function load(){
  try { return Object.assign({}, def, JSON.parse(localStorage.getItem(KEY)||'{}')); }
  catch{ return {...def}; }
}
function save(state){ localStorage.setItem(KEY, JSON.stringify(state)); }

export const Memory = {
  get(){ return load(); },
  set(upd){ const s = load(); Object.assign(s, upd); save(s); return s; },
  update(fn){ const s = load(); const n = fn(s)||s; save(n); return n; },
  putStat(k, v){ return Memory.update(s=>{ s.stats[k]=v; return s; }); }
};