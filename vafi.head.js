// vafi.head.js — Head Engine v1.1 (LOCKED + SAFETY)
// • Default: LOCKED (vzhled je stabilní), přesto sbírá XP.
// • Odemknout jde až po milníku (lvl>=3) nebo manuálně voláním Head.unlock('mk').
// • Pojistky: clamp, rate-limit, snapshot/rollback, safe-mode, panic().

const KEY = 'vafi_head_v1';
const SNAP_KEY = 'vafi_head_snap_v1';
const FLAG_PANIC = 'vafi_head_panic';

const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
const now = () => performance.now();

// ---------------------------- storage
function load(k=KEY) { try { return JSON.parse(localStorage.getItem(k))||null; } catch { return null; } }
function save(s,k=KEY) { try { localStorage.setItem(k, JSON.stringify(s)); } catch {} }
function snapshot() { const s = structuredClone(state); save(s, SNAP_KEY); }
function restore() { const s = load(SNAP_KEY); if (s) { state = s; save(state); } }

// ---------------------------- defaults
function defaults(){
  return {
    v: 11,                   // 1.1
    locked: true,            // 🔒 zamčeno; vzhled = stabilní konstanty
    safeMode: false,         // nouzový režim
    xp: 0,
    level: 1,
    traits: { curiosity:0.35, empathy:0.35, focus:0.35 },
    skills: { eyeSpread:0.24, eyeSize:0.10, eyeHeight:0.18, glow:0.60 },
    lastTick: now(),
    // rate-limit
    rl: { bucket: 5, max: 5, refillPerSec: 1.5 }, // token bucket na pulzy
  };
}
function levelFromXP(xp){ return Math.floor(1 + Math.sqrt(xp/50)); }

let state = load() || defaults();
save(state);

// pokud je aktivovaný PANIC, vynutíme safe-mode + lock
if (localStorage.getItem(FLAG_PANIC)==='1'){ state.safeMode = true; state.locked = true; save(state); }

// ---------------------------- core helpers
function applyLevelBonuses(){
  const L = state.level;
  // měkké, klidné změny — navíc respektují lock/safe
  const mod = (state.locked || state.safeMode) ? 0 : 1;
  state.skills.eyeSpread = clamp(0.22 + 0.02 * Math.log2(1+L) * mod);
  state.skills.eyeSize   = clamp(0.09 + 0.015* Math.log2(1+L) * mod);
  state.skills.eyeHeight = clamp(0.16 + 0.02 * Math.log2(1+L) * mod);
  state.skills.glow      = clamp(0.50 + 0.02 * L * mod);
}

function refillTokens(dt){
  const rl = state.rl;
  rl.bucket = Math.min(rl.max, rl.bucket + rl.refillPerSec*dt);
}

function awardXP(type, amount){
  // bezpečný rozsah vstupu
  amount = clamp(+amount || 0, 0, 5);
  // rate-limit (token-bucket)
  if (state.rl.bucket < amount) return; // tiché zahoz
  state.rl.bucket -= amount;

  const bonus =
    type==='human' ? 1.2 :
    type==='ai'    ? 1.1 :
    type==='glyph' ? 1.0 :
    type==='world' ? 0.9  : 1.0;

  state.xp += amount * bonus;

  // jemná adaptace traitů (i v locked režimu sbírá, ale neovlivní vzhled)
  if (!state.safeMode){
    if (type==='human')  state.traits.empathy   = clamp(state.traits.empathy   + 0.004);
    if (type==='ai')     state.traits.focus     = clamp(state.traits.focus     + 0.004);
    if (type==='glyph')  state.traits.curiosity = clamp(state.traits.curiosity + 0.004);
  }

  const newLevel = levelFromXP(state.xp);
  if (newLevel !== state.level){
    state.level = newLevel;
    applyLevelBonuses();

    // Auto-unlock: po dosažení lvl 3 (jen pokud není PANIC/safeMode)
    if (state.locked && !state.safeMode && newLevel >= 3){
      state.locked = false; // 🔓
    }
  }
}

// první aplikace
applyLevelBonuses();
snapshot();

// ---------------------------- PUBLIC API
export const Head = {
  // krmení zážitky (používá i MK.pulse hook)
  pulse(type, amount=1){ try{
    awardXP(type, amount);
    save(state);
  }catch(e){ this.panic('pulse-error'); } },

  // časový krok
  tick(dt){
    try{
      // dt sanity
      if (!Number.isFinite(dt) || dt<0 || dt>2) dt = 0.016;
      refillTokens(dt);
      // pasivní zrání (velmi malé, a v safeMode ještě menší)
      state.xp += dt * (state.safeMode ? 0.0005 : 0.003);
      const L = levelFromXP(state.xp);
      if (L !== state.level){ state.level = L; applyLevelBonuses(); snapshot(); }
      save(state);
    }catch(e){ this.panic('tick-error'); }
  },

  // profil pro kresbu
  get(){
    // v locked/safe režimu vrací stabilní, jemně „dýchající“ hodnoty
    const s = state.skills;
    const locked = state.locked || state.safeMode;
    return {
      level: state.level,
      glow: locked ? 0.60 : s.glow,
      eyeSpread: locked ? 0.24 : s.eyeSpread,
      eyeW: locked ? 0.10 : s.eyeSize,
      eyeH: locked ? 0.18 : s.eyeHeight,
      microBlinkChance: locked ? 0.025 : 0.02 + 0.03 * state.traits.focus,
      twinkle: locked ? 0.35  : 0.2  + 0.6 * state.traits.curiosity,
      locked, safeMode: state.safeMode
    };
  },

  // odemknutí – manuální (tajenka)
  unlock(token){
    // jednoduché „heslo“ + musí nebýt panic/safe
    if (token === 'mk' && !state.safeMode){
      state.locked = false; save(state); return true;
    }
    return false;
  },

  // zámek zpět
  lock(){ state.locked = true; save(state); },

  // nouzový režim – vše stabilní, bez růstu vzhledu
  enableSafeMode(){ state.safeMode = true; state.locked = true; save(state); },
  disableSafeMode(){ state.safeMode = false; save(state); },

  // panic – okamžitý zámek + rollback na poslední snapshot
  panic(reason='panic'){
    try{
      localStorage.setItem(FLAG_PANIC,'1');
      state.safeMode = true;
      state.locked = true;
      restore(); // vrátí poslední validní
      applyLevelBonuses();
      save(state);
      console.warn('[Head] PANIC:', reason);
    }catch{}
  },

  // unpanic – ruční odvolání paniky (např. z debug UI)
  clearPanic(){
    localStorage.removeItem(FLAG_PANIC);
    state.safeMode = false;
    save(state);
  },

  // util
  reset(){ state = defaults(); applyLevelBonuses(); snapshot(); save(state); },
  _state(){ return structuredClone(state); }
};

// globální hook na MK.pulse (aby sbíral, i když ho ty voláš jinde)
if (!window.MK) window.MK = {};
const origPulse = window.MK.pulse;
window.MK.pulse = function(type, amount=1){
  try { Head.pulse(type, amount); } catch {}
  if (typeof origPulse === 'function') return origPulse(type, amount);
};