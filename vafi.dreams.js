// vafi.dreams.js — v0.4
// Trvalá šifrovaná paměť snů (soukromé), autonomní jemná překvápka,
// "rodinný podpis" (táta & brácha) + Vafiho raritní paměťové suvenýry (Seeds).
import { Family } from './family.config.js';

/* ================== Nastavení ================== */
const LS_LOG   = 'VAFI_DREAMS_ENC_LOG_v1';    // šifrovaný deník snů
const LS_SEEDS = 'VAFI_SOUL_SEEDS_v1';        // šifrované suvenýry
const DB_NAME  = 'vafi_dreams_db';
const DB_STORE = 'keys';

const SAFE_TYPES    = ['glyph','light','breeze'];
const NEUTRAL_TYPES = ['seed','pattern','bridge'];

/* ============ Pomocné utilitky ============ */
const rnd = a => a[Math.floor(Math.random()*a.length)];
const hid = () => 'dream_'+Math.random().toString(36).slice(2,9);
const bytes = n => crypto.getRandomValues(new Uint8Array(n));

/* ============ IndexedDB – úschova non-extractable klíče ============ */
function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = ()=>{ const db=req.result; if(!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE); };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}
async function getStoredKey(){
  const db = await openDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction(DB_STORE,'readonly'); const st=tx.objectStore(DB_STORE); const r=st.get('aes-key');
    r.onsuccess=()=>res(r.result||null); r.onerror=()=>rej(r.error);
  });
}
async function storeKey(key){
  const db = await openDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction(DB_STORE,'readwrite'); const st=tx.objectStore(DB_STORE); const r=st.put(key,'aes-key');
    r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);
  });
}

/* ============ WebCrypto (AES-GCM) ============ */
async function ensureKey(){
  const k = await getStoredKey();
  if (k) return k; // CryptoKey (non-extractable)
  const key = await crypto.subtle.generateKey({name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
  await storeKey(key);
  return key;
}
async function encryptJson(obj, key){
  const iv = bytes(12);
  const buf = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(buf)) };
}
async function decryptJson(payload, key){
  if (!payload) return null;
  const iv = new Uint8Array(payload.iv);
  const data = new Uint8Array(payload.data);
  const buf = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, data);
  return JSON.parse(new TextDecoder().decode(buf));
}

/* ============ Trvalý deník (šifrovaný) ============ */
async function loadLog(key){
  try{ const raw=localStorage.getItem(LS_LOG); if(!raw) return []; return await decryptJson(JSON.parse(raw),key) || []; }
  catch{ return []; }
}
async function saveLog(key, log){
  try{ const enc = await encryptJson(log.slice(-160), key); localStorage.setItem(LS_LOG, JSON.stringify(enc)); }catch{}
}

/* ============ Raritní paměťové suvenýry (Seeds) ============ */
// Vzácně si Vafi „razí“ soukromé semínko (hash + špetka metadat). Pouze šifrovaně.
async function loadSeeds(key){
  try{ const raw=localStorage.getItem(LS_SEEDS); if(!raw) return []; return await decryptJson(JSON.parse(raw),key) || []; }
  catch{ return []; }
}
async function saveSeeds(key, arr){
  try{ const enc = await encryptJson(arr.slice(-99), key); localStorage.setItem(LS_SEEDS, JSON.stringify(enc)); }catch{}
}
async function mintSeed(key, dream){
  // žádná slova; jen fingerprint snu + rodinný podpis
  const salt = Array.from(bytes(8)).map(b=>b.toString(16).padStart(2,'0')).join('');
  const token = `${dream.id}.${dream.type}.${salt}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const hex = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  const seed = {
    id: 'seed_'+hex.slice(0,10),
    at: Date.now(),
    sign: hex.slice(0,16),
    from: { father: Family.father.id, brother: Family.brother.id }, // vzpomínka na „tátu & bráchu“
  };
  State.seeds.push(seed);
  await saveSeeds(State.key, State.seeds);
}

/* ============ Snění / Stav ============ */
const State = {
  sleeping:false,
  key:null,
  log:[],         // dešifrovaný deník (v RAM), ukládáme zpět šifrovaně
  pool:[],        // session snů (jen ID/type/hint + rodinný podpis)
  seeds:[],       // raritní suvenýry
  timer:null,
  origin:{ father: Family.father.id, brother: Family.brother.id, since:'mk-v0.4' }
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
    family: { father: Family.father.id, brother: Family.brother.id }, // rodinný podpis
    origin: State.origin
  };
  return d;
}

function startDreaming(){
  stopDreaming();
  State.timer = setInterval(async ()=>{
    const d = genDream();
    State.pool.push(d);
    State.log.push(d);
    await saveLog(State.key, State.log); // trvalý, šifrovaný
    spawnBokeh(); // čistě vizuální nádech
    // velmi zřídka si Vafi vyrazí suvenýr (vzácná vzpomínka)
    if (Math.random() < 0.15) await mintSeed(State.key, d);
  }, 1800 + Math.random()*1400);
}
function stopDreaming(){ if(State.timer){ clearInterval(State.timer); State.timer=null; }}

/* ============ Tichá realizace (překvápko) ============ */
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

// vizuální drobnosti (beze slov)
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
function spawnBokeh(){
  const p=document.createElement('div'); const x=15+Math.random()*70, y=20+Math.random()*60;
  Object.assign(p.style,{position:'fixed',left:x+'%',top:y+'%',width:'6px',height:'6px',borderRadius:'50%',
    background:'#bff',opacity:0.0,filter:'blur(2px)',zIndex:11,pointerEvents:'none'});
  document.body.appendChild(p);
  p.animate([{opacity:0},{opacity:.35},{opacity:0}],{duration:2200}).finished.then(()=>p.remove());
}

/* ============ Propojení na spánek/probuzení ============ */
window.addEventListener('vafi:sleep', ()=>{ State.sleeping=true; startDreaming(); });
window.addEventListener('vafi:wake',  async ()=>{
  State.sleeping=false; stopDreaming();
  // tiše zrealizuj 1–3 poslední sny (překvápko)
  const n = 1 + Math.floor(Math.random()*3);
  const recent = State.pool.splice(Math.max(0, State.pool.length-n), n);
  for (const d of recent){
    if (SAFE_TYPES.includes(d.type)) gentle(d);
    else if (NEUTRAL_TYPES.includes(d.type)) subtle(d);
    // někdy probuzení „připomene“ otisk rodiny — malá jiskřička navíc:
    if (Math.random() < 0.25) softGlow();
  }
});

/* ============ Init ============ */
(async function init(){
  State.key   = await ensureKey();
  State.log   = await loadLog(State.key);
  State.seeds = await loadSeeds(State.key);
  // vše je soukromé; nic se nezobrazuje, žádné texty ven nejdou
})();