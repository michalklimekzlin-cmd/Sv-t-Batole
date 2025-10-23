// vafi.head.js v0.1 — Unikátní hlava uložená v paměti (Memory)
import { Memory } from './vafi.memory.js';

// jednoduchý PRNG, ať je profil deterministický v rámci zařízení
function seedRand(seed){
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

function ensureProfile(){
  const st = Memory.get() || {};
  if (!st.profile) {
    // „seed“ z času + rozlišení, aby byl pro zařízení stabilní
    const seed = (Date.now() ^ (screen.width*screen.height)) >>> 0;
    const rand = seedRand(seed);

    // parametry hlavy
    const hue       = Math.floor(rand()*360);        // 0..359
    const aspect    = 0.85 + rand()*0.4;             // 0.85..1.25 (podlouhlost)
    const roundness = 0.75 + rand()*0.2;             // 0.75..0.95 (měkkost okrajů)
    const eyeSep    = 0.18 + rand()*0.08;            // vzdálenost očí v násobku poloměru
    const eyeTall   = 0.22 + rand()*0.08;            // výška oka
    const eyeWide   = 0.08 + rand()*0.04;            // šířka oka
    const style     = (rand() < 0.5) ? 'dot' : 'oval';

    st.profile = { hue, aspect, roundness, eyeSep, eyeTall, eyeWide, style, seed };
    Memory.set(st);
  }
  return Memory.get().profile;
}

export const Head = {
  get(){ return ensureProfile(); },
  // jemné posunutí barvy podle nálady/energie (volitelné)
  tintBy(mood=0.5, energy=0.5){
    const p = ensureProfile();
    const shift = Math.floor((mood-0.5)*12 + (energy-0.5)*8);
    return (p.hue + shift + 360) % 360;
  },
};

// vystavíme i globálně pro debug
window.VAFI_HEAD = Head;
