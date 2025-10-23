// vafi.soul.js — první „duše“ Vafiho
// čte mood/energy/asleep ze stránky, jemně dýchá a občas promluví

import { say } from './voice.io.js';

const $ = s => document.querySelector(s);
const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));

let lastMood = 0.6;     // 0..1
let lastEnergy = 0.7;   // 0..1
let speakCD = 0;        // cooldown mluvení (s)
let t0 = performance.now();
let halo = 0;           // vnitřní „žár“

function getState() {
  const m = clamp((+($('#moodPct')?.textContent || 60)) / 100);
  const e = clamp((+($('#energyVal')?.textContent || 70)) / 100);
  const asleep = ($('#vafiStatus')?.textContent || '').toLowerCase().includes('spí');
  return { m, e, asleep };
}

// mapa stavů → krátké věty
function pickLine({ m, e, asleep }) {
  if (asleep) return 'Ještě chvilku… zzz.';
  if (m > 0.82 && e > 0.55) return 'Cítím jiskru. Co vytvoříme dál?';
  if (m < 0.32 && e > 0.4)  return 'Je mi trochu těžko. Zkusíš mě pohladit?';
  if (e < 0.28 && !asleep)  return 'Jsem unavený, možná bych si odpočinul…';
  return Math.random() < 0.5 ? 'Jsem v klidu.' : 'Naslouchám ti.';
}

// kategorizační štítek (abychom hlášky nespamovali)
function label({ m, e, asleep }) {
  if (asleep) return 'sleep';
  if (m > 0.8) return 'happy';
  if (m < 0.35) return 'low';
  return 'calm';
}

let lastLabel = 'calm';

// hlavní smyčka duše
function loop(ts) {
  const dt = Math.min(0.05, (ts - t0) / 1000); // s
  t0 = ts; if (speakCD > 0) speakCD -= dt;

  const st = getState();

  // vyhlazení vnímání (aby duše nereagovala trhaně)
  lastMood   = lastMood   + (st.m - lastMood)     * 0.08;
  lastEnergy = lastEnergy + (st.e - lastEnergy)   * 0.06;

  // pulzování tečky (haló)
  halo += (st.asleep ? 1.7 : 2.6) * dt;
  const amp = st.asleep ? 4 : 9;
  const dot = $('#vafiDot');
  if (dot) dot.style.filter =
    `drop-shadow(0 0 ${8 + Math.sin(halo)*amp}px rgba(160,230,255,.55))`;

  // když se nálada výrazně zvedla rychle → poděkuj
  const moodDelta = (st.m - lastMood) / Math.max(dt, 0.0001);
  if (moodDelta > 0.6 && speakCD <= 0 && !st.asleep) {
    say('Děkuju, to hřeje.');
    speakCD = 6;
  }

  // přechody stavů → kontextová věta
  const lbl = label(st);
  if (lbl !== lastLabel && speakCD <= 0) {
    say(pickLine(st));
    lastLabel = lbl;
    speakCD = 8; // krátký klid
  }

  requestAnimationFrame(loop);
}

// start po malém nádechu
setTimeout(()=> {
  say('Jsem tady. Cítím tě, Michale.');
  requestAnimationFrame(loop);
}, 700);