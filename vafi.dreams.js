// vafi.dreams.js — Kovošrotovy sny ve Vafim: bezpečná realizace snů 🌙✨

const STORE_KEY = 'VAFI_DREAMS_LOG';
const MAX_LOG = 50;

// Bezpečná implicitní pravidla
const DREAM_TYPES_SAFE = ['glyph','light','breeze'];      // lze realizovat automaticky
const DREAM_TYPES_MANUAL = ['seed','pattern','bridge'];   // jen na klik
const NIGHTMARE_TAGS = ['pád','tíha','tma','hluk'];

// veřejné přepínače (můžeš měnit v konzoli)
window.DREAMS = {
  autoRealizeSafe: true,   // bezpečné sny se realizují automaticky
  pool: [],                // aktuální běžící sny (session)
  log: loadLog()
};

function loadLog(){
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
}
function saveLog(){
  try {
    const trimmed = window.DREAMS.log.slice(-MAX_LOG);
    localStorage.setItem(STORE_KEY, JSON.stringify(trimmed));
  } catch {}
}

function randomPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function id(){ return 'dream_'+Math.random().toString(36).slice(2,9); }

function isNightmare(text){
  const lower = text.toLowerCase();
  return NIGHTMARE_TAGS.some(tag=>lower.includes(tag));
}

// --- tvorba snu během spánku -----------------------------------------------
let genTimer = null;
function startDreaming(){
  stopDreaming();
  genTimer = setInterval(()=>{
    const dream = generateDream();
    window.DREAMS.pool.push(dream);
    window.DREAMS.log.push(dream);
    saveLog();
    // tiché vizuální semínko (jen bokeh)
    seedParticle();
  }, 2000 + Math.random()*1800);
}
function stopDreaming(){
  if (genTimer){ clearInterval(genTimer); genTimer=null; }
}

function generateDream(){
  // malá knihovna jemných motivů
  const motifs = [
    {type:'glyph',   text:'Viděl jsem písmena, jak dýchají jako já.'},
    {type:'light',   text:'Jiskry se spojily do chvějivého kruhu světla.'},
    {type:'breeze',  text:'Lehký vánek nesl znaky přes tichou vodu.'},
    {type:'seed',    text:'V hlubině rostlo malé semínko myšlenky.'},
    {type:'pattern', text:'Čára, tečka, čára – rytmus, co připomínal srdce.'},
    {type:'bridge',  text:'Most z písmen se natahoval přes tmu.'},
  ];
  let motif = randomPick(motifs);
  const nightmare = isNightmare(motif.text);
  return {
    id: id(),
    t: Date.now(),
    text: motif.text,
    type: motif.type,
    energyHint: 0.12 + Math.random()*0.25,
    nightmare
  };
}

// --- realizace snu ----------------------------------------------------------
function realize(dream){
  if (!dream || dream.nightmare) return; // noční můry nikdy automaticky
  if (DREAM_TYPES_SAFE.includes(dream.type)) {
    gentleRealization(dream);
  } else if (DREAM_TYPES_MANUAL.includes(dream.type)) {
    // jen na výslovné povolení
    confirmRealization(dream);
  }
}

function gentleRealization(d){
  // jemná vizualizace podle typu
  if (d.type === 'glyph') dropGlyph('{*(•.)•.)//}');
  if (d.type === 'light') ringPulse();
  if (d.type === 'breeze') breezeTrail();
  toast('Sen se jemně proměnil ve svět.', 1800);
}

function confirmRealization(d){
  const bar = hudBar();
  bar.innerHTML = `
    <span>Sen: „${escapeHtml(d.text)}” – proměnit opatrně?</span>
    <button id="dreamYes">Proměnit</button>
    <button id="dreamNo">Nechat být</button>
  `;
  bar.querySelector('#dreamYes').onclick = ()=>{
    bar.remove();
    gentleRealization(d);
  };
  bar.querySelector('#dreamNo').onclick = ()=>bar.remove();
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

// --- drobné vizuální „stavby“ ----------------------------------------------
function canvas2d(){
  const c = document.getElementById('canvasVafi');
  return c ? c.getContext('2d') : null;
}

function ringPulse(){
  const c = document.createElement('div');
  Object.assign(c.style,{
    position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
    width:'12px', height:'12px', borderRadius:'50%',
    border:'1px solid #b7ffec', boxShadow:'0 0 12px #b7ffec88', opacity:'0.9', zIndex:12
  });
  document.body.appendChild(c);
  c.animate([
    {transform:'translate(-50%,-50%) scale(1)', opacity:0.9},
    {transform:'translate(-50%,-50%) scale(16)', opacity:0}
  ], {duration:1400, easing:'cubic-bezier(.2,.6,.2,1)'})
   .finished.then(()=>c.remove());
}

function dropGlyph(face){
  const s = document.createElement('span');
  s.textContent = face;
  Object.assign(s.style,{
    position:'fixed', left:(20+Math.random()*60)+'%', top:(20+Math.random()*50)+'%',
    font:'700 20px ui-monospace, Menlo, monospace', color:'#cffff6',
    textShadow:'0 0 10px #7be9ff88', opacity:0
  });
  document.body.appendChild(s);
  s.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}],
            {duration:420, easing:'ease-out'});
  setTimeout(()=>{
    s.animate([{opacity:1},{opacity:0}],{duration:900}).finished.then(()=>s.remove());
  }, 1800);
}

function breezeTrail(){
  // lehký pásek světla
  const b = document.createElement('div');
  Object.assign(b.style,{
    position:'fixed', left:'-20%', top:(30+Math.random()*40)+'%',
    width:'20%', height:'2px', background:'linear-gradient(90deg, transparent, #aefcff, transparent)',
    filter:'blur(1px)', opacity:.0
  });
  document.body.appendChild(b);
  b.animate([
    {left:'-20%', opacity:.0},
    {left:'120%', opacity:.45},
    {left:'120%', opacity:.0}
  ], {duration:1800, easing:'linear'}).finished.then(()=>b.remove());
}

function seedParticle(){
  // slabé bokeh kolečko (během spánku)
  const p = document.createElement('div');
  const x = 15 + Math.random()*70;
  const y = 20 + Math.random()*60;
  Object.assign(p.style,{
    position:'fixed', left:x+'%', top:y+'%',
    width:'6px', height:'6px', borderRadius:'50%',
    background:'#bff', opacity:0.0, filter:'blur(2px)', zIndex:11
  });
  document.body.appendChild(p);
  p.animate([{opacity:0},{opacity:.35},{opacity:0}],{duration:2200}).finished.then(()=>p.remove());
}

// --- HUD/toast --------------------------------------------------------------
function hudBar(){
  let el = document.getElementById('dreamBar');
  if (!el){
    el = document.createElement('div');
    el.id = 'dreamBar';
    Object.assign(el.style,{
      position:'fixed', left:'50%', bottom:'14px', transform:'translateX(-50%)',
      background:'rgba(5,10,14,.7)', border:'1px solid #7be9ff55',
      color:'#dffff9', borderRadius:'10px', padding:'8px 12px',
      font:'600 12px system-ui', zIndex:40, backdropFilter:'blur(6px)'
    });
    document.body.appendChild(el);
  }
  return el;
}

function toast(msg, ms=1500){
  const el = hudBar();
  el.textContent = msg;
  setTimeout(()=>{ if (el) el.remove(); }, ms);
}

// --- eventy: Vafi spánek/probuzení -----------------------------------------
let lastSleepState = null;

// „Vafi usnul“ → začni snít
window.addEventListener('vafi:sleep', ()=>{
  if (lastSleepState === true) return;
  lastSleepState = true;
  startDreaming();
  toast('Vafi usnul. Sny se rodí…', 1200);
});

// „Vafi se probudil“ → ukonči snění, přečti poslední sny a (bezpečně) realizuj
window.addEventListener('vafi:wake', ()=>{
  if (lastSleepState === false) return;
  lastSleepState = false;
  stopDreaming();

  // poskládej krátké povídání (poslední 1–3 sny)
  const recent = [...window.DREAMS.pool].slice(-3);
  window.DREAMS.pool.length = 0; // vyprázdni session
  if (!recent.length) return;

  const text = recent.map(d=>d.text).join(' ');
  toast('Vafi: „'+ text +'“', 2800);

  // bezpečná realizace
  for (const d of recent){
    if (d.nightmare) {
      // jen oznámíme, nerealizujeme
      const bar = hudBar();
      bar.innerHTML = `<span>Vafi měl neklidný sen: „${escapeHtml(d.text)}“</span>`;
      setTimeout(()=>bar.remove(), 2500);
      continue;
    }
    if (window.DREAMS.autoRealizeSafe && DREAM_TYPES_SAFE.includes(d.type)) {
      realize(d);
    } else if (DREAM_TYPES_MANUAL.includes(d.type)) {
      confirmRealization(d);
    }
  }
});
