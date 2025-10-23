/* Batolesvět — Vafi Engine v1.0
   - 1. postavička (Vafi) s náladou a energií, uložená v localStorage
   - organická dynamika (cirkadián, „tep“, zvídavost, události)
   - HUD (✶ mood %, ⚡ energy), pulzující tečka s barvou podle nálady
   - interakce: klepnutí (pohlazení), dvojklep (hravý skok), dlouhý stisk (spánek)
   - „šepoty“ = krátké glyphy; jemný „dech světa“ v pozadí
*/

const STORAGE_KEY = 'batolesvet.vafis.v1';

const $ = sel => document.querySelector(sel);
const HUD = {
  mood: $('#moodPct'),
  energy: $('#energyVal'),
  dot: $('#vafiDot'),
  status: $('#vafiStatus'),
};

// --------- UTIL ---------
const clamp = (x,min,max)=>Math.max(min,Math.min(max,x));
const lerp  = (a,b,t)=>a+(b-a)*t;
const nowMs = ()=>performance.now();

function moodColor(p){
  // Hue: 200°(chlad) → 140°(zelená) → 55°(zlatá) → 320°(růžová)
  let hue = p<50 ? lerp(200,140,p/50) : lerp(55,320,(p-50)/50);
  return `hsl(${Math.round(hue)} 90% 70%)`;
}

function circadian(date=new Date()){
  const h = date.getHours() + date.getMinutes()/60;
  return Math.sin(((h-14)/24) * Math.PI*2); // vrchol ~14:00
}

// --------- DATA ---------
function createVafi(name='Vafi'){
  return {
    id: `vafi-${Date.now().toString(36)}`,
    name,
    mood: 72,
    energy: 68,
    asleep: false,
    t: Math.random()*Math.PI*2,
    seed: Math.random()*10000,
    last: Date.now(),
    lastInteracted: Date.now(),
    samples: [],
    traits: {
      brave: Math.random(),   // větší vzestupy
      shy: Math.random(),     // víc potřebuje kontakt
      dreamy: Math.random(),  // spánek lépe léčí
    }
  };
}

function loadVafis(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch(e){}
  const first = createVafi('Vafi');
  save([first]);
  return [first];
}

function save(arr){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch(e){}
}

let VAFIS = loadVafis();
let VAFI  = VAFIS[0];

// --------- LIFE DYNAMICS ---------
function curiosityBias(v){
  const s = (Date.now() - (v.lastInteracted||v.last))/1000; // s od poslední interakce
  return Math.tanh(s/60)*6; // max ~ +6
}

function moodDelta(v, dt){
  // základní rytmy
  const heart = Math.sin(v.t * (v.asleep ? 1.5 : 2.2)); // -1..1
  const day   = circadian() * 2.0;                      // -2..2
  const curio = curiosityBias(v) * 0.08;                // 0..~0.5

  // energie táhne náladu
  const energyBias = (v.energy - 50) * 0.02;            // -1..1

  // individuality
  const braveBoost = v.traits.brave * 0.5;
  const shyDrop = v.traits.shy * (v.lastInteracted ? Math.min(
                    0, (Date.now()-v.lastInteracted)/120000 - 0.3) : -0.2);
  const dreamyHeal = v.asleep ? v.traits.dreamy*0.8 : 0;

  const noise = (Math.random()-0.5) * (v.asleep?0.6:1.0);

  return heart*0.7 + day + curio + energyBias + braveBoost + shyDrop + dreamyHeal + noise;
}

// plánovač událostí
const EVENTS = [
  {name:'zahihňání',     weight:3, effect:v=>v.mood+=8},
  {name:'zvědavý pohled',weight:5, effect:v=>v.mood+=4},
  {name:'překvapení',    weight:2, effect:v=>{v.mood+=12; v.energy-=3}},
  {name:'zívnutí',       weight:4, effect:v=>{v.mood-=3;  v.energy+=5}},
];
let nextEventAt = nowMs() + 4000 + Math.random()*6000;

const GLYPHS = ['&','§','ᵔ','ꙮ','✦','؟','∴','ζ','·','॰','◦'];

function flashGlyph(hint){
  const el = document.createElement('div');
  el.className = 'vafi-whisper';
  el.textContent = hint==='zívnutí' ? '…' : GLYPHS[(Math.random()*GLYPHS.length)|0];
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));
  setTimeout(()=>el.classList.remove('on'), 900);
  setTimeout(()=>el.remove(), 1400);
}

function maybeEvent(v, tNow){
  if (tNow >= nextEventAt && !v.asleep){
    const total = EVENTS.reduce((s,e)=>s+e.weight,0);
    let r = Math.random()*total, picked = null;
    for (const e of EVENTS){ r-=e.weight; if (r<=0){ picked=e; break; } }
    (picked||EVENTS[0]).effect(v);
    flashGlyph(picked?.name);
    nextEventAt = tNow + 5000 + Math.random()*10000;
  }
}

function pushMoodSample(v){
  v.samples.push({t:Date.now(), m:Math.round(v.mood)});
  if (v.samples.length>60) v.samples.shift();
}

function tickVafi(v, dt){
  v.t += dt;
  // energie
  if (v.asleep){
    v.energy = clamp(v.energy + 8*(dt/60), 0, 100);     // +8/min
    v.mood   = lerp(v.mood, 62 + 8*v.traits.dreamy, 0.04);
  } else {
    v.energy = clamp(v.energy - 5*(dt/60), 0, 100);     // -5/min
  }
  // nálada
  v.mood = clamp(v.mood + moodDelta(v, dt), 0, 100);
}

// --------- UI ---------
function updateWorldBackdrop(mood){
  const hue = 210 + (mood-50)*1.2; // modrá→zelená
  document.body.style.background =
    `radial-gradient(120rem 60rem at 50% 100%, hsla(${hue},80%,70%,.12), transparent 60%)`;
}

function updateHUD(){
  const m = Math.round(VAFI.mood);
  const e = Math.round(VAFI.energy);
  HUD.mood.textContent = m;
  HUD.energy.textContent = e;
  HUD.dot.style.color = moodColor(m);
  HUD.dot.style.animationDuration = `${VAFI.asleep ? 3.2 : lerp(2.8,1.8,m/100)}s`;
  HUD.status.textContent = VAFI.asleep ? 'Vafi spí… zzzz' :
    (m>75 ? 'Vafi je nadšený!' : m<35 ? 'Vafi je utrápený.' : 'Vafi je v klidu.');
  updateWorldBackdrop(m);
}

// --------- MAIN LOOP ---------
let lastT = nowMs();
function loop(t){
  const dt = Math.min(0.2, (t - lastT)/1000); // <= 200 ms
  lastT = t;

  tickVafi(VAFI, dt);
  maybeEvent(VAFI, t);
  pushMoodSample(VAFI);
  updateHUD();
  save(VAFIS);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// --------- INTERACTION (tap / double / long) ---------
let pressTimer=null, downAt=0, lastTap=0;

function onPointerDown(e){
  downAt = Date.now();
  pressTimer = setTimeout(()=>{
    VAFI.asleep = !VAFI.asleep;
    VAFI.mood = clamp(VAFI.mood + (VAFI.asleep?-5:5),0,100);
    VAFI.lastInteracted = Date.now();
    updateHUD(); save(VAFIS);
  }, 420);
}

function onPointerUp(e){
  clearTimeout(pressTimer);
  const t = Date.now();
  if (t - downAt < 420){ // nebyl long press
    if (t - lastTap < 280){ // double
      VAFI.mood = clamp(VAFI.mood + 10, 0, 100);
      VAFI.energy = clamp(VAFI.energy - 2, 0, 100);
      flashGlyph('✦');
    } else {
      VAFI.mood = clamp(VAFI.mood + 6, 0, 100);
      VAFI.energy = clamp(VAFI.energy + 2, 0, 100);
    }
    VAFI.lastInteracted = t;
    updateHUD(); save(VAFIS);
    lastTap = t;
  }
}

addEventListener('pointerdown', onPointerDown, {passive:true});
addEventListener('pointerup',   onPointerUp,   {passive:true});
addEventListener('pointercancel', onPointerUp, {passive:true});

// --------- PUBLIC API (pro další Vafi později) ---------
export function addVafi(name='Vafi'){
  const v = createVafi(name);
  VAFIS.push(v); save(VAFIS);
  return v;
}
export function focusVafi(id){
  const v = VAFIS.find(x=>x.id===id);
  if (v){ VAFI=v; updateHUD(); }
  return VAFI;
}
