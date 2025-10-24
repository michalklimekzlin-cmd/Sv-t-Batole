// viri.learning.js — události z UI -> XP + drobný log/toast
export function initViriLearning(xp){
  const log = [];
  const toast = createToast();

  function voice({team, text, weight=0.5}){
    xp.add({ team: normalizeTeam(team), value: Math.max(0.02, weight)*0.2 });
    addLog('voice', {team, text, weight});
    toast(`🗣️ ${team}: ${text}`);
  }

  function mood({calm=0, anxiety=0}){
    xp.mood.calm    = clamp(xp.mood.calm + calm);
    xp.mood.anxiety = clamp(xp.mood.anxiety + anxiety);
    addLog('mood', {calm, anxiety});
    toast(`🫧 nálada: calm ${fmt(calm)} | anxiety ${fmt(anxiety)}`);
  }

  function vision({kind='symbol', truth=1, ttl=3000}){
    xp.add({ team: 'glyph', value: 0.15*truth });
    addLog('vision', {kind, truth, ttl});
    toast(kind === 'path' ? '🧭 stopa vpřed' : '✨ symbol');
  }

  function ground(){
    // přizemnit – posílit batolesvět, zklidnit
    xp.add({ team: 'batolesvet', value: 0.25 });
    xp.mood.calm = clamp(xp.mood.calm + 0.1);
    xp.mood.anxiety = clamp(xp.mood.anxiety - 0.1);
    addLog('ground', {});
    toast('🌱 uzemněno');
  }

  window.EVENTS = { voice, mood, vision, ground, _log:log };
  return window.EVENTS;

  function addLog(kind, payload){
    log.push({ t: Date.now(), kind, ...payload });
    if (log.length > 400) log.shift();
  }
}

function normalizeTeam(t){
  if (t==='batole') return 'batolesvet';
  if (t==='pedro')  return 'pedrovci';
  return t;
}
function clamp(v){ return Math.max(0, Math.min(1, v)); }
function fmt(n){ return (n>0?'+':'') + (Math.round(n*100)/100); }

function createToast(){
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;left:50%;bottom:18px;transform:translateX(-50%);
    padding:8px 14px;border-radius:.7rem;border:1px solid #355;
    background:rgba(18,30,35,.9);color:#cff;font-weight:600;
    font-family:system-ui,-apple-system,sans-serif;font-size:14px;
    backdrop-filter:blur(8px) saturate(120%); opacity:0; transition:.25s;
    z-index:9999; pointer-events:none;
  `;
  document.body.appendChild(el);
  let hideT=null;
  return msg=>{
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(hideT);
    hideT = setTimeout(()=>{ el.style.opacity='0'; }, 1200);
  };
}