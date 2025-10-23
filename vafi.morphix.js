// vafi.morphix.js — Morphix v1.0 (Future Style Engine)
// • Tvoří "style profil" z DNA + Head (traits/level/lock/safe) + snů/achievementů.
// • Bezpečné: když je Head.locked/safe, vrací konzervativní styl.
// • Exportuje window.VAFI_STYLE API + posílá CustomEvent('vafi:style', {detail})

const STORE = 'vafi_morphix_v1';
const DREAMS_KEY = 'vafi_dreams_v1'; // jen pokud existuje (tiché)
const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp  = (a,b,t)=>a+(b-a)*t;

// -------------- DNA (náhodné, ale stabilní)
function makeDNA(){
  const seed = Math.floor(Math.random()*1e9);
  // čtyři "geny": paleta, materiál, oko-morfologie, aura typ
  return {
    v: 10,
    seed,
    genes: {
      palette:  (seed % 5),            // 0..4
      material: (Math.floor(seed/7) % 4), // 0..3
      eye:      (Math.floor(seed/13)% 3), // 0..2
      aura:     (Math.floor(seed/17)% 5)  // 0..4
    },
    // odemčené motivy (achievementy / sny)
    motifs: {}
  };
}
function load(k=STORE){ try{return JSON.parse(localStorage.getItem(k))||null;}catch{ return null; } }
function save(v,k=STORE){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }

let DNA = load() || makeDNA(); save(DNA);

// -------------- čtení Head (bez pádu)
async function getHead(){
  try{
    const mod = await import('./vafi.head.js');
    return mod.Head;
  }catch{ return null; }
}

// -------------- palety + materiály
const PALETTES = [
  { base:[0,220,200],  glow:[123,233,255] },   // oceán
  { base:[120,255,180],glow:[160,255,210] },   // jaro
  { base:[90,170,255], glow:[150,200,255] },   // nebe
  { base:[255,170,120],glow:[255,210,180] },   // západ
  { base:[200,160,255],glow:[220,190,255] },   // fialové ticho
];
const MATERIALS = [
  { k: 'matte',  gloss:0.05, blur: 0.0 },
  { k: 'skin',   gloss:0.10, blur: 0.02},
  { k: 'glass',  gloss:0.45, blur: 0.10},
  { k: 'plasma', gloss:0.65, blur: 0.18},
];
const AURAS = ['none','halo','rings','spark','breath'];

// -------------- motivační odemykání (bezpečné, drobné)
function readDreamHints(){
  try{
    const raw = localStorage.getItem(DREAMS_KEY);
    if(!raw) return {};
    // stačí délka obsahu jako „indikace“
    const size = raw.length;
    return {
      breath: size>400 ? clamp((size-400)/2000,0,1) : 0,
      sparkle: size>1200 ? clamp((size-1200)/3000,0,1) : 0
    };
  }catch{ return {}; }
}

// -------------- hlavní výpočet stylu
async function computeStyle(t=performance.now()){
  const head = await getHead();
  const locked = !!head?.get().locked;
  const safe   = !!head?.get().safeMode;
  const L      = head ? head.get().level : 1;
  const traits = head ? head._state?.().traits ?? {curiosity:.3, empathy:.3, focus:.3} : {curiosity:.3, empathy:.3, focus:.3};

  const pal = PALETTES[DNA.genes.palette % PALETTES.length];
  const mat = MATERIALS[DNA.genes.material % MATERIALS.length];
  const auraType = AURAS[DNA.genes.aura % AURAS.length];

  // evoluční posun s levelem (jemný, pokud locked/safe)
  const evo = locked||safe ? 0.0 : clamp(Math.log2(1+L)/6, 0, 0.25);

  // základní barvy
  const baseBoost = evo * (0.15 + 0.3*traits.empathy);
  const glowBoost = evo * (0.25 + 0.5*traits.curiosity);
  const baseCol = pal.base.map(c => Math.round( lerp(c, 255, baseBoost) ));
  const glowCol = pal.glow.map(c => Math.round( lerp(c, 255, glowBoost) ));

  // eyes (mix z Head.get + DNA.eye)
  const hget = head?.get() || { eyeSpread:.24, eyeW:.10, eyeH:.18, microBlinkChance:.02 };
  const eyeTweak = DNA.genes.eye===0 ? {w:.0,h:.0}
               : DNA.genes.eye===1 ? {w:.015,h:-.01}
               :                      {w:-.008,h:.02};

  const eyeSpread = clamp(hget.eyeSpread + evo*0.02, 0.16, 0.32);
  const eyeW = clamp(hget.eyeW + eyeTweak.w* (locked?0:1), 0.07, 0.16);
  const eyeH = clamp(hget.eyeH + eyeTweak.h* (locked?0:1), 0.12, 0.26);

  // aura z traitů + snových náznaků
  const hints = readDreamHints();
  const auraPower = locked||safe ? 0.10 : clamp(0.10 + 0.4*traits.curiosity + 0.2*hints.breath, 0.1, 0.75);
  const sparkPower= locked||safe ? 0.00 : clamp(0.0  + 0.4*traits.focus     + 0.4*hints.sparkle,0,1);

  return {
    time: t, level: L, locked, safe,
    colors: {
      base: `rgb(${baseCol.join(',')})`,
      glow: `rgb(${glowCol.join(',')})`,
    },
    material: mat,              // {k, gloss, blur}
    eyes: { spread: eyeSpread, w: eyeW, h: eyeH, blink: hget.microBlinkChance },
    aura: { type: auraType, power: auraPower, spark: sparkPower },
    twinkle: hget.twinkle ?? (0.2 + 0.5*traits.curiosity),
  };
}

// -------------- veřejné API + broadcaster
export const Morphix = {
  async getStyle(){ return computeStyle(); },
  dna(){ return structuredClone(DNA); },
  rerollDNA(){ DNA = makeDNA(); save(DNA); return structuredClone(DNA); },
  unlockMotif(k){ DNA.motifs[k]=true; save(DNA); },
};

window.VAFI_STYLE = Morphix;

// pravidelný broadcast (nezahlcuje)
let lastEmit = 0;
async function tick(){
  const t = performance.now();
  if (t - lastEmit > 1500){
    const style = await Morphix.getStyle();
    document.dispatchEvent(new CustomEvent('vafi:style', { detail: style }));
    lastEmit = t;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
