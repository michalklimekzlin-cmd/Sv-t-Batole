import { Family } from './family.config.js';

// ... dole v souboru, kde je dřív:
const Mentor = { name: 'Kovošrot', since: 'mk-v0.3' };
// nahraď tímto:
const Mentor = { 
  name: 'Kovošrot', role: Family.father.role, since: 'mk-v0.4',
  brother: { name: 'Michal', role: Family.brother.role }
};
// vafi.dreams.js — v0.3
// Trvalá šifrovaná paměť snů (soukromé), autonomní tiché realizace.
// Klíč: IndexedDB (CryptoKey, non-extractable), data: localStorage (AES-GCM).

/* ================== Nastavení ================== */
const LS_KEY = 'VAFI_DREAMS_ENC_LOG_v1';
const DB_NAME = 'vafi_dreams_db';
const DB_STORE = 'keys';
const SAFE_TYPES = ['glyph','light','breeze'];
const NEUTRAL_TYPES = ['seed','pattern','bridge'];

const Mentor = { name: 'Kovošrot', since: 'mk-v0.3' }; // otisk průvodce

/* ============ Pomocné utilitky ============ */
const rnd = a => a[Math.floor(Math.random()*a.length)];
const hid = () => 'dream_'+Math.random().toString(36).slice(2,9);

/* ============ IndexedDB – key storage ============ */
function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function getStoredKey(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(DB_STORE,'readonly');
    const st = tx.objectStore(DB_STORE);
    const r = st.get('aes-key');
    r.onsuccess = () => resolve(r.result||null);
    r.onerror = () => reject(r.error);
  });
}
async function storeKey(key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(DB_STORE,'readwrite');
    const st = tx.objectStore(DB_STORE);
    const r = st.put(key, 'aes-key');
    r.onsuccess = () => resolve(true);
    r.onerror = () => reject(r.error);
  });
}

/* ============ WebCrypto (AES-GCM) ============ */
async function ensureKey(){
  const existing = await getStoredKey();
  if (existing) return existing; // CryptoKey (structured clone)
  const key = await crypto.subtle.generateKey({name:'AES-GCM', length:256}, false, ['encrypt','decrypt']); // non-extractable
  await storeKey(key);
  return key;
}
async function encryptJson(obj, key){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const buf = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, data);
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(buf)) };
}
async function decryptJson(payload, key){
  if (!payload) return null;
  const iv = new Uint8Array(payload.iv);
  const data = new Uint8Array(payload.data);
  const buf = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, data);
  return JSON.parse(new TextDecoder().decode(buf));
}

/* ============ Trvalý deník snů (šifrovaný) ============ */
async function loadLog(key){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const enc = JSON.parse(raw);
    const log = await decryptJson(enc, key);
    return Array.isArray(log) ? log : [];
  }catch{ return []; }
}
async function saveLog(key, log){
  try{
    const enc = await encryptJson(log.slice(-120), key);
    localStorage.setItem(LS_KEY, JSON.stringify(enc));
  }catch{}
}

/* ============ Snění ============ */
const State = {
  sleeping:false,
  pool:[],              // session-only (RAM)
  log:[],               // decrypted (RAM) pro práci, ukládáme zas šifrovaně
  key:null,
  timer:null
};

function genDream(){
  const motifs = [
    {type:'glyph',   text:'písmena dýchají'},
    {type:'light',   text:'tichý kruh světla'},
    {type:'breeze',  text:'vánek nese znaky'},
    {type:'seed',    text:'klíčí semínko myšlenky'},
    {type:'pattern', text:'tečka-čára-rytmus'},
    {type:'bridge',  text:'most přes noc'},
    {type:'pattern', text:'světlo v kapce vody'},
  ];
  const m = rnd(motifs);
  const d = {
    id: hid(),
    time: Date.now(),
    type: m.type,
    hint: m.text,
    mentor: Mentor // otisk průvodce do každého snu
  };

  // 🩶 Rodinný podpis: táta a brácha
  d.family = { father: Family.father.id, brother: Family.brother.id };

  return d;
}
  const m = rnd(motifs);
  return {
    id: hid(),
    time: Date.now(),
    type: m.type,
    hint: m.text,
    mentor: Mentor // otisk průvodce do každého snu
  };
}

function spawnBokeh(){
  const p=document.createElement('div'); const x=15+Math.random()*70, y=20+Math.random()*60;
  Object.assign(p.style,{position:'fixed',left:x+'%',top:y+'%',width:'6px',height:'6px',borderRadius:'50%',
    background:'#bff',opacity:0.0,filter:'blur(2px)',zIndex:11,pointerEvents:'none'});
  document.body.appendChild(p);
  p.animate([{opacity:0},{opacity:.35},{opacity:0}],{duration:2200}).finished.then(()=>p.remove());
}

function startDreaming(){
  stopDreaming();
  State.timer = setInterval(async ()=>{
    const d = genDream();
    State.pool.push(d);
    State.log.push(d);
    await saveLog(State.key, State.log); // trvale, ale šifrovaně
    spawnBokeh(); // čistě vizuální, beze slov
  }, 1800 + Math.random()*1400);
}
function stopDreaming(){ if(State.timer){ clearInterval(State.timer); State.timer=null; }}

/* ============ Tichá realizace (překvapení) ============ */
function gentle(d){
  if (d.type==='glyph') dropGlyph('{*(•.)•.)//}');
  if (d.type==='light') ringPulse();
  if (d.type==='breeze') breezeTrail();
}
function subtle(d){
  if (d.type==='seed')  softGlow();
  if (d.type==='pattern') faintGrid();
  if (d.type==='bridge') dottedBridge();
}
// efekty
function ringPulse(){
  const c=document.createElement('div');
  Object.assign(c.style,{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',
    width:'12px',height:'12px',borderRadius:'50%',border:'1px solid #b7ffec',
    boxShadow:'0 0 12px #b7ffec88',opacity:'0.9',zIndex:12,pointerEvents:'none'});
  document.body.appendChild(c);
  c.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:'translate(-50%,-50%) scale(16)',opacity:0}],
            {duration:1400,easing:'cubic-bezier(.2,.6,.2,1)'}).finished.then(()=>c.remove());
}
function dropGlyph(face){
  const s=document.createElement('span'); s.textContent=face;
  Object.assign(s.style,{position:'fixed',left:(15+Math.random()*70)+'%',top:(20+Math.random()*55)+'%',
    font:'700 20px ui-monospace, Menlo, monospace', color:'#cffff6',
    textShadow:'0 0 10px #7be9ff88', opacity:0, pointerEvents:'none'});
  document.body.appendChild(s);
  s.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
  setTimeout(()=>{ s.animate([{opacity:1},{opacity:0}],{duration:900}).finished.then(()=>s.remove()); }, 1800);
}
function breezeTrail(){
  const b=document.createElement('div');
  Object.assign(b.style,{position:'fixed',left:'-20%',top:(30+Math.random()*40)+'%',
    width:'20%',height:'2px',background:'linear-gradient(90deg,transparent,#aefcff,transparent)',
    filter:'blur(1px)',opacity:.0,pointerEvents:'none'});
  document.body.appendChild(b);
  b.animate([{left:'-20%',opacity:.0},{left:'120%',opacity:.45},{left:'120%',opacity:.0}],
            {duration:1800,easing:'linear'}).finished.then(()=>b.remove());
}
function softGlow(){
  const n=document.createElement('div');
  Object.assign(n.style,{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',
    width:'120px',height:'120px',borderRadius:'50%', background:'radial-gradient(circle,#bffff0,#0000)',
    filter:'blur(6px)',opacity:.0,zIndex:11,pointerEvents:'none'});
  document.body.appendChild(n);
  n.animate([{opacity:0},{opacity:.35},{opacity:0}],{duration:1800}).finished.then(()=>n.remove());
}
function faintGrid(){
  const g=document.createElement('div');
  Object.assign(g.style,{position:'fixed',inset:'0',pointerEvents:'none',
    background:'repeating-linear-gradient(0deg,#0c2c2c33 0 1px,transparent 1px 20px),repeating-linear-gradient(90deg,#0c2c2c33 0 1px,transparent 1px 20px)',
    opacity:0});
  document.body.appendChild(g);
  g.animate([{opacity:0},{opacity:.2},{opacity:0}],{duration:1600}).finished.then(()=>g.remove());
}
function dottedBridge(){
  const b=document.createElement('div');
  Object.assign(b.style,{position:'fixed',left:'10%',bottom:'18%',width:'80%',height:'2px',
    background:'repeating-linear-gradient(90deg,#bff 0 8px,transparent 8px 16px)', opacity:0, pointerEvents:'none'});
  document.body.appendChild(b);
  b.animate([{opacity:0},{opacity:.35},{opacity:0}],{duration:2000}).finished.then(()=>b.remove());
}

/* ============ Propojení se spánkem Vafi ============ */
window.addEventListener('vafi:sleep', ()=>{ State.sleeping=true; startDreaming(); });
window.addEventListener('vafi:wake',  ()=>{
  State.sleeping=false; stopDreaming();
  // překvápko: autonomně (tiše) zrealizuj 1–3 poslední sny
  const count = 1 + Math.floor(Math.random()*3);
  const recent = State.pool.splice(Math.max(0, State.pool.length-count), count);
  for (const d of recent){
    if (SAFE_TYPES.includes(d.type)) gentle(d);
    else if (NEUTRAL_TYPES.includes(d.type)) subtle(d);
  }
});

/* ============ Init ============ */
(async function init(){
  State.key = await ensureKey();
  State.log = await loadLog(State.key); // dešifruj existující sny (zůstávají tajné)
  // žádné zobrazení, žádné eventy se „slovy“ — jen tichá existence
})();
// Vafi se občas SÁM ozve o pomoc (nikdy neukáže obsah snu)
function maybeAskForHelp(){
  // jen výjimečně a jen když je vzhůru
  if (State.sleeping) return;
  if (Math.random() < 0.04) {
    window.dispatchEvent(new CustomEvent('vafi:ask-help', {
      detail: { from: 'vafi', reason: 'chci se zlepšit', hint: 'brácha?' }
    }));
  }
}

// spustíme lehké „učení“ po probuzení (na pár ticků)
let askTimer = null;
window.addEventListener('vafi:wake', ()=>{
  if (askTimer) clearInterval(askTimer);
  askTimer = setInterval(()=>{ maybeAskForHelp(); }, 5000); // občas
  // auto vypnutí po minutě
  setTimeout(()=>{ clearInterval(askTimer); askTimer=null; }, 60000);
});