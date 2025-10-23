// vafi.memory.v1.1.js — Učící paměť Vafi (v1.1)
// - lokální perzistence (localStorage) pod klíčem vafi_mem_v1
// - učení z „ticků“ a událostí (oči vykresleny, spánek, energie…)
// - auto-opravy: pamatuje si poslední „dobré“ hodnoty a vrací je při chybě
// - jemné ladění multiplikátorů očí + clamping do bezpečných mezí
// - žádná síťová komunikace, vše zůstává v zařízení

const LS_KEY = 'vafi_mem_v1';
const VERSION = 11;

// Bezpečné meze (clamping) pro parametry vzhledu
const SAFE = {
  eyeSpreadMul: { min: 0.18, max: 0.36, def: 0.27 },
  eyeWMul:      { min: 0.06, max: 0.14, def: 0.10 },
  eyeHMul:      { min: 0.07, max: 0.18, def: 0.10 },
};

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch { return null; }
}

function save(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

function freshState() {
  return {
    version: VERSION,
    createdAt: Date.now(),
    lastTick: 0,
    ticks: 0,
    // poslední „zdravé“ hodnoty (na které se dá vrátit)
    lastGood: {
      eyeSpreadMul: SAFE.eyeSpreadMul.def,
      eyeWMul: SAFE.eyeWMul.def,
      eyeHMul: SAFE.eyeHMul.def,
    },
    // adaptivní multiplikátory, které se jemně učí
    morph: {
      eyeSpreadMul: SAFE.eyeSpreadMul.def,
      eyeWMul: SAFE.eyeWMul.def,
      eyeHMul: SAFE.eyeHMul.def,
    },
    // stavové info pro učení
    energyAvg: 0.85,
    asleepTicks: 0,
    // jednoduchý error log
    errors: { eyesNotDrawn: 0 },
  };
}

let MEM = load() || freshState();
if (!MEM.version || MEM.version < VERSION) {
  // upgrade schématu, ale zachovej, co jde
  const older = MEM;
  MEM = freshState();
  MEM.lastGood = older.lastGood || MEM.lastGood;
  MEM.morph    = older.morph    || MEM.morph;
  MEM.energyAvg = older.energyAvg ?? MEM.energyAvg;
  save(MEM);
}

export const Memory = {
  get(){ return MEM; },

  set(key, val){
    MEM[key] = val;
    save(MEM);
  },

  // Aplikuj naučené/clampnuté hodnoty do globálního State (pokud ho publikuješ)
  applyToState(State){
    if (!State) return;
    const m = MEM.morph;

    // clamp + ukládej jako „lastGood“
    m.eyeSpreadMul = clamp(m.eyeSpreadMul, SAFE.eyeSpreadMul.min, SAFE.eyeSpreadMul.max);
    m.eyeWMul      = clamp(m.eyeWMul,      SAFE.eyeWMul.min,      SAFE.eyeWMul.max);
    m.eyeHMul      = clamp(m.eyeHMul,      SAFE.eyeHMul.min,      SAFE.eyeHMul.max);

    MEM.lastGood = { ...m };
    save(MEM);

    // pokud máš někde State.Morph, můžeš je tam propsat:
    if (State.Morph) {
      State.Morph.eyeSpreadMul = m.eyeSpreadMul;
      State.Morph.eyeWMul      = m.eyeWMul;
      State.Morph.eyeHMul      = m.eyeHMul;
    }
  },

  // Tick z hlavní smyčky (nebo z app.js) — posílej mu třeba energii a flags
  tick({ energy=0.85, asleep=false } = {}){
    const now = Date.now();
    MEM.ticks++;
    MEM.lastTick = now;

    // exponenciální průměr energie
    MEM.energyAvg = 0.92 * MEM.energyAvg + 0.08 * energy;

    if (asleep) MEM.asleepTicks++; else MEM.asleepTicks = Math.max(0, MEM.asleepTicks - 1);

    // jemné učení vzhledu podle energie (jen drobné kroky)
    const m = MEM.morph;
    const delta = (MEM.energyAvg - 0.8) * 0.02; // ±0.004 při běžném rozsahu

    m.eyeSpreadMul += delta;
    m.eyeWMul      += delta * 0.7;
    m.eyeHMul      += delta * 0.5;

    // bezpečné meze + uložit
    m.eyeSpreadMul = clamp(m.eyeSpreadMul, SAFE.eyeSpreadMul.min, SAFE.eyeSpreadMul.max);
    m.eyeWMul      = clamp(m.eyeWMul,      SAFE.eyeWMul.min,      SAFE.eyeWMul.max);
    m.eyeHMul      = clamp(m.eyeHMul,      SAFE.eyeHMul.min,      SAFE.eyeHMul.max);

    save(MEM);
  },

  // Události z plátna/enginu
  onEyesDrawn(ok=true){
    if (!ok){
      MEM.errors.eyesNotDrawn++;
      // návrat k poslední „dobré“ sadě při vyšší chybovosti
      if (MEM.errors.eyesNotDrawn >= 3) {
        MEM.morph = { ...MEM.lastGood };
        MEM.errors.eyesNotDrawn = 0;
      }
      save(MEM);
      return;
    }
    // potvrď „dobrý“ stav
    MEM.lastGood = { ...MEM.morph };
    save(MEM);
  },

  // Jednoduché debug API (volitelně)
  expose(){
    window.VafiMemory = {
      get: () => JSON.parse(JSON.stringify(MEM)),
      reset: () => { MEM = freshState(); save(MEM); },
      setMorph: (p) => {
        MEM.morph = { ...MEM.morph, ...p };
        this.applyToState(window.State);
        save(MEM);
      },
    };
  }
};

// Automatické připojení na události z avataru:
//  - `document.dispatchEvent(new CustomEvent('vafi:eyesDrawn', {detail:{ok:true}}))`
document.addEventListener('vafi:eyesDrawn', (e)=>{
  const ok = !!(e?.detail?.ok ?? true);
  Memory.onEyesDrawn(ok);
});

// Volitelně: posílej průběžné stavy (energie/spánek) z app.js:
// document.dispatchEvent(new CustomEvent('vafi:tick', {detail:{energy, asleep}}));
document.addEventListener('vafi:tick', (e)=>{
  const energy = Number(e?.detail?.energy ?? 0.85);
  const asleep = !!(e?.detail?.asleep ?? false);
  Memory.tick({ energy, asleep });
});

// Vystav pro konzoli
Memory.expose();
