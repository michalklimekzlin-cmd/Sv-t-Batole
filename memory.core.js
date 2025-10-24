// memory.core.js — append-only paměť + stav
const KEY_LOG   = 'VIRI_LOG';
const KEY_STATE = 'VIRI_STATE';
const VER = 1;

function now(){ return new Date().toISOString(); }

function load(key, def){
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}
function save(key, val){
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch(e){ console.warn('Memory save fail', e); }
}

let LOG   = load(KEY_LOG,   []);           // časová osa událostí
let STATE = load(KEY_STATE, { ver: VER }); // dlouhodobý stav

export const Memory = {
  version: VER,

  readLog({since=0, limit=200}={}) {
    return LOG.slice(Math.max(0, LOG.length - limit - since), LOG.length - since);
  },

  write(type, payload={}, meta={}) {
    const entry = {
      t: now(),
      type,               // např. 'seed','thought','place','npc','quest','error'
      payload,
      meta: { ...meta, agent:'Viri' }
    };
    LOG.push(entry);
    if (LOG.length > 5000) LOG = LOG.slice(-3000); // průběžná komprese
    save(KEY_LOG, LOG);
    return entry;
  },

  getState(path, def){
    if (!path) return STATE;
    return path.split('.').reduce((o,k)=>o && o[k], STATE) ?? def;
  },

  setState(path, value){
    if (!path) { STATE = value; save(KEY_STATE, STATE); return; }
    const keys = path.split('.');
    let ref = STATE;
    for (let i=0;i<keys.length-1;i++){
      ref[keys[i]] ??= {};
      ref = ref[keys[i]];
    }
    ref[keys.at(-1)] = value;
    save(KEY_STATE, STATE);
  },

  snapshot(label='auto'){ // uloží checkpoint do logu
    return this.write('snapshot', { state: STATE }, { label });
  },

  resetAll(){ LOG=[]; STATE={ver:VER}; save(KEY_LOG,LOG); save(KEY_STATE,STATE); }
};

window.ViriMemory = Memory;
Memory.write('boot', { msg:'Memory online', ver:VER });
