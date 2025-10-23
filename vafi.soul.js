// vafi.soul.js — duše Vafiho napojená na Vivere Flow
// - čte "tok světa" (wave, vitality) z vivere.flow.js
// - z něj odvozuje náladu a energii
// - mluví krátkými větami při změnách stavu
// - jemně „dýchá“ (glow tečky)

import { say } from './voice.io.js';
import { onUpdate as onFlow, getFlow, nudge as flowNudge } from './vivere.flow.js';

const $ = s => document.querySelector(s);
const clamp01 = x => Math.max(0, Math.min(1, x));

let flow = getFlow();          // { wave, vitality, harmony, curiosity, active }
onFlow(f => { flow = f; });    // průběžně aktualizovat

let mood = 0.6;                // 0..1 (vnitřní vjem)
let energy = 0.7;              // 0..1
let speakCD = 0;               // cooldown mluvení v sekundách
let lastLabel = 'calm';
let halo = 0;
let t0 = performance.now();

// volitelně bereme „spánek“ z HUDu (když ho máš)
function isAsleep(){
  const s = $('#vafiStatus')?.textContent?.toLowerCase() || '';
  return s.includes('spí');
}

// vyber větu podle stavu
function pickLine({ mood, energy, asleep }){
  if (asleep) return 'Ještě chvilku… zzz.';
  if (mood > 0.82 && energy > 0.55) return 'Cítím jiskru. Co vytvoříme dál?';
  if (energy < 0.28) return 'Jsem unavený, možná si odpočinu…';
  if (mood < 0.32) return 'Je mi trochu těžko. Zkusíš mě pohladit?';
  return Math.random() < 0.5 ? 'Jsem v klidu.' : 'Naslouchám ti.';
}
function labelOf({ mood, energy, asleep }){
  if (asleep) return 'sleep';
  if (mood > 0.8) return 'happy';
  if (mood < 0.35) return 'low';
  return 'calm';
}

// hlavní smyčka duše
function loop(ts){
  const dt = Math.min(0.05, (ts - t0) / 1000); // s
  t0 = ts;
  if (speakCD > 0) speakCD -= dt;

  // 1) cíle z Flow
  // wave -1..+1 -> moodTarget 0..1 ; vitality 0..1 -> energyTarget 0..1
  const moodTarget   = clamp01(0.5 + flow.wave * 0.5);
  const energyTarget = clamp01(flow.vitality);

  // 2) jemné míchání vnitřní vůle s Flow (aby to nebylo strnulé)
  mood   = mood   * 0.6 + moodTarget   * 0.4;
  energy = energy * 0.5 + energyTarget * 0.5;

  // 3) „spánek“ snižuje jas i aktivitu
  const asleep = isAsleep();
  if (asleep){
    energy = energy * 0.9;
    mood   = mood   * 0.95;
  }

  // 4) dýchání tečky (glow)
  halo += (asleep ? 1.7 : 2.6) * dt;
  const amp = asleep ? 4 : 9;
  const dot = $('#vafiDot');
  if (dot){
    dot.style.filter = `drop-shadow(0 0 ${8 + Math.sin(halo)*amp}px rgba(160,230,255,.55))`;
  }

  // 5) kontextové věty při změnách stavu
  const lbl = labelOf({ mood, energy, asleep });
  if (lbl !== lastLabel && speakCD <= 0){
    say(pickLine({ mood, energy, asleep }));
    lastLabel = lbl;
    speakCD = 8;
  }

  requestAnimationFrame(loop);
}

// start: pozdrav a zahájení smyčky
setTimeout(()=> {
  say('Jsem tady. Cítím tok světa.');
  // malý „šťouch“ do Flow při dotyku/hlasovém probuzení
  window.addEventListener('pointerdown', ()=>flowNudge('touch', 1), {passive:true});
  requestAnimationFrame(loop);
}, 700);

// (volitelné) export, kdybys chtěl přistupovat odjinud
export const vafiSoul = {
  get mood(){ return mood; },
  get energy(){ return energy; }
};