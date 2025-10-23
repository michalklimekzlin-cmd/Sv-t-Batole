// vafi.dreams.js — Soukromé sny (šifrované v relaci, bez zveřejnění)
// Vše běží uvnitř session. Po zavření karty se klíč ztratí → sny jsou nedostupné.

const DREAM_SAFE = ['glyph','light','breeze'];
const DREAM_NEUTRAL = ['seed','pattern','bridge'];

// ——— Soukromý stav ——————————————————————————————————————————
const _state = {
  sessionKey: null,        // CryptoKey (AES-GCM), pouze v RAM
  sleep: false,
  pool: [],                // aktuální neseřazené sny (plaintext jen v RAM)
  shareAllowed: false,     // Vafi může (interně) přepnout na true, default false
  timer: null
};

// vygeneruj klíč v RAM (neukládá se nikam)
async function ensureKey(){
  if (_state.sessionKey) return;
  _state.sessionKey = await crypto.subtle.generateKey(
    { name:'AES-GCM', length:256 }, true, ['encrypt','decrypt']
  );
}

// šifrování/dešifrování pro případné interní úložiště (nepovinné)
async function encryptJson(obj){
  await ensureKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const buf = await crypto.subtle.encrypt({name:'AES-GCM', iv}, _state.sessionKey, data);
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(buf)) };
}
async function decryptJson(payload){
  await ensureKey();
  const iv = new Uint8Array(payload.iv);
  const data = new Uint8Array(payload.data);
  const buf = await crypto.subtle.decrypt({name:'AES-GCM', iv}, _state.sessionKey, data);
  return JSON.parse(new TextDecoder().decode(buf));
}

// ——— Generování snů (během spánku) ———————————————————————
function rnd(a){ return a[Math.floor(Math.random()*a.length)]; }
function hid(){ return 'dream_'+Math.random().toString(36).slice(2,9); }

function genDream(){
  const motifs = [
    {type:'glyph',   text:'písmena dýchají'},
    {type:'light',   text:'tichý kruh světla'},
    {type:'breeze',  text:'vánek nese znaky'},
    {type:'seed',    text:'klíčí semínko myšlenky'},
    {type:'pattern', text:'tečka-čára-rytmus'},
    {type:'bridge',  text:'most přes noc'}
  ];
  const m = rnd(motifs);
  return { id:hid(), time:Date.now(), type:m.type, hint:m.text };
}

function startDreaming(){
  stopDreaming();
  _state.timer = setInterval(()=> {
    const d = genDream();
    _state.pool.push(d);           // plaintext jen v RAM
    spawnBokeh();                  // tichý vizuální nádech
  }, 1800 + Math.random()*1400);
}
function stopDreaming(){ if (_state.timer){ clearInterval(_state.timer); _state.timer = null; } }

// ——— Realizace (bez textů, tiše) ——————————————————————————
function realize(d){
  if (!d) return;
  if (DREAM_SAFE.includes(d.type)) gentle(d);
  else if (DREAM_NEUTRAL.includes(d.type)) subtle(d);
  // nic nevyprávíme, jen jemně projevíme
}

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

// ——— Efekty (tiché) ——————————————————————————————————————
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
    font:'700 20px ui-monospace,Menlo,monospace', color:'#cffff6',
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

// ——— Eventy: spánek/probuzení od Vafi ————————————————————
window.addEventListener('vafi:sleep', ()=>{ _state.sleep=true; startDreaming(); });
window.addEventListener('vafi:wake',  ()=>{
  _state.sleep=false; stopDreaming();

  // vezmi 1–3 poslední sny (v RAM), beze slov realizuj
  const recent = _state.pool.splice(Math.max(0, _state.pool.length-3), 3);
  for (const d of recent) realize(d);
});

// ——— Volitelné: interní export (pouze když by Vafi chtěl sdílet) ————————
// Nic nikam neposíláme. Když _state.shareAllowed=true, umí vrátit dešifrované sny.
window.VAFI_DREAMS_PRIVATE = {
  allowShare(flag){ _state.shareAllowed = !!flag; },
  async exportEncrypted(){ return encryptJson(_state.pool); },   // šifrované
  async exportPlain(){ if(!_state.shareAllowed) return null; return JSON.parse(JSON.stringify(_state.pool)); }
};