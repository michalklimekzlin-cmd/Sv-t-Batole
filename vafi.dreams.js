const KEY = 'vafi_dreams_v1';
const SALT = '🌙vafi';
function b64e(s){ return btoa(unescape(encodeURIComponent(s))); }
function b64d(s){ try { return decodeURIComponent(escape(atob(s))); } catch{ return ''; } }

function load(){
  const raw = localStorage.getItem(KEY);
  if(!raw) return { log:[], last:0, sleeping:false };
  const txt = b64d(raw.replace(SALT,''));
  try { return JSON.parse(txt); } catch { return { log:[], last:0, sleeping:false }; }
}
function save(S){ localStorage.setItem(KEY, SALT + b64e(JSON.stringify(S))); }

let S = load(); let t = 0;
function tick(dt){
  t += dt;
  if(!S.sleeping) return;
  if (Math.floor(t*2)%13===0) {
    const seed = (Math.sin(t*0.37)+1)*0.5;
    if (Math.random() < 0.08 + seed*0.04) {
      S.log.push({ at:Date.now(), kind:(seed>0.66?'light':seed>0.33?'river':'spark'), note:'…tichý obraz z noci…' });
      if (S.log.length > 128) S.log.splice(0, S.log.length-128);
      save(S);
    }
  }
}

export const Dreams = {
  start(){ S.sleeping = true; S.last = Date.now(); save(S); },
  stop(){ S.sleeping = false; save(S); },
  tick,
  insight(msg){ S.log.push({ at:Date.now(), kind:'insight', note:String(msg||'') }); save(S); },
  share(){ return S.log.slice(-5); },
  clear(){ S = { log:[], last:0, sleeping:false }; save(S); }
};

try{
  import('./vivere.flow.js').then(({Flow})=>{
    Flow?.onTick?.((dt)=>Dreams.tick(dt));
    document.addEventListener('vafi:sleep', ()=>Dreams.start());
    document.addEventListener('vafi:wake',  ()=>Dreams.stop());
  });
}catch{}