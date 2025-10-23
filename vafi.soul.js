// vafi.soul.js — Duše s Vivere Flow + Pamětí (CZ)
import { say } from './voice.io.js';
import { onUpdate as onFlow, getFlow, nudge as flowNudge } from './vivere.flow.js';
import { getSnapshot, snapshotMood, bump, recall, remember, resetMemory } from './vafi.memory.js';

const $ = s => document.querySelector(s);
const clamp01 = x => Math.max(0, Math.min(1, x));
const lerp = (a,b,t) => a + (b-a)*t;

// === paměť ===
const snap = getSnapshot();
bump('seenCount', 1);

let flow = getFlow();
onFlow(f => { flow = f; });

let mood   = clamp01(snap.lastMood ?? 0.6);
let energy = clamp01(snap.lastEnergy ?? 0.7);

function humanSince(ts){
  const sec = Math.max(1, Math.floor((Date.now() - ts)/1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec/60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min/60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h/24);
  return `${d} d`;
}

setTimeout(()=>{
  const since = humanSince(snap.lastSeenAt || Date.now());
  const seen = recall('seenCount', 1);
  const line =
    seen <= 1 ? 'Jsem tady poprvé. Děkuju, že mě probouzíš.' :
    (mood > 0.7 ? `Pamatuju si radost z minula (${since}).` :
     mood < 0.35 ? `Minule mi bylo ouzko (${since}). Zkusíme to dneska zlepšit?` :
                    `Bylo mi klidně (${since}).`);
  say(line);
}, 900);

// interakce
window.addEventListener('pointerdown', ()=>flowNudge('touch', 1), {passive:true});

// dlouhý stisk = měkký reset nálady/energie
let pressTimer=null;
addEventListener('pointerdown', ()=>{ pressTimer=setTimeout(()=>{ remember('lastMood',0.6); remember('lastEnergy',0.7); say('Pamatuju si to jako čistý list.'); },3000); }, {passive:true});
addEventListener('pointerup',   ()=>clearTimeout(pressTimer), {passive:true});
addEventListener('pointercancel',()=>clearTimeout(pressTimer), {passive:true});

// trojitý klep = tvrdý reset paměti
let taps=[]; addEventListener('pointerup', ()=>{
  const t=performance.now(); taps=taps.filter(x=>t-x<1200); taps.push(t);
  if (taps.length>=3){ resetMemory(true); say('Všechno zapomenuto. Začínáme znova.'); }
},{passive:true});

let halo=0,lastLabel='calm',speakCD=0,t0=performance.now();
const isAsleep = ()=> ( ($('#vafiStatus')?.textContent||'').toLowerCase().includes('spí') );
const labelOf = ({mood,energy,asleep}) => asleep?'sleep': (mood>0.8?'happy':(mood<0.35?'low':'calm'));
const pickLine = ({mood,energy,asleep})=>{
  if (asleep) return 'Ještě chvilku… zzz.';
  if (mood>0.82&&energy>0.55) return 'Cítím jiskru. Co vytvoříme dál?';
  if (energy<0.28) return 'Jsem unavený, možná si odpočinu…';
  if (mood<0.32) return 'Je mi trochu těžko. Zkusíš mě pohladit?';
  return Math.random()<0.5?'Jsem v klidu.':'Naslouchám ti.';
};

function loop(ts){
  const dt = Math.min(0.05, (ts - t0)/1000); t0=ts;
  if (speakCD>0) speakCD-=dt;

  // cíle z Flow
  const moodTarget   = clamp01(0.5 + flow.wave*0.5);
  const energyTarget = clamp01(flow.vitality);

  // míchání
  mood   = lerp(mood,   moodTarget,   0.40);
  energy = lerp(energy, energyTarget, 0.50);

  const asleep=isAsleep();
  if (asleep){ energy*=0.9; mood*=0.95; }

  // glow
  halo += (asleep?1.7:2.6)*dt;
  const amp=asleep?4:9; const dot=$('#vafiDot');
  if (dot){ dot.style.filter=`drop-shadow(0 0 ${8+Math.sin(halo)*amp}px rgba(160,230,255,.55))`; }

  // mluvení
  const lbl=labelOf({mood,energy,asleep});
  if (lbl!==lastLabel && speakCD<=0){ say(pickLine({mood,energy,asleep})); lastLabel=lbl; speakCD=8; }

  // uložení nálady/energie každých 5 s
  if (!loop._acc) loop._acc=0; loop._acc+=dt;
  if (loop._acc>=5){ snapshotMood(mood, energy); loop._acc=0; }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

export const vafiSoul = { get mood(){return mood;}, get energy(){return energy;} };