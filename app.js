// BatoleSvět v0.3 (voice): chat + TTS + mic(beta)
const $ = (s)=>document.querySelector(s);
const now = ()=>Date.now();
const SKEY = 'batolesvet:v03voice';

let state = JSON.parse(localStorage.getItem(SKEY) || 'null') || {
  cycle:0, trust:1, clarity:1, energy:3,
  pendingImpulse:null, syms:[],
  nodes:Array.from({length:9},(_,i)=>({idx:i,level:0,active:false})),
  log:[],
  player:{x:400,y:240,r:16,spd:2},
  ai:{phase:0,dist:40,particles:48},
  ui:{phase:'intro', mission:{target:5, progress:0, done:false}, tutorial:{step:0}},
  companionName:null, path:null,
  chat:{on:true, log:[], awaiting:false, lastPrompt:null},
  voice:{enabled:false, voiceURI:null, pitch:1, rate:1},
  mic:{enabled:false, supported:false}
};

function save(){ localStorage.setItem(SKEY, JSON.stringify(state)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function log(t){ state.log.unshift({t:now(),text:t}); renderLog(); save(); }

document.querySelectorAll('.btn[data-imp]').forEach(b=>b.addEventListener('click',()=> sendImpulse(b.dataset.imp)));
$('#aiBtn').addEventListener('click',()=> aiRespond());
document.querySelectorAll('.chip[data-sym]').forEach(c=>c.addEventListener('click',()=> toggleSym(c)));
$('#weaveBtn').addEventListener('click',()=> weave());
$('#resetBtn').addEventListener('click',()=>{ localStorage.removeItem(SKEY); location.reload(); });

$('#startBtn').addEventListener('click', ()=>{
  $('#intro').classList.remove('show');
  $('#nameAsk').classList.add('show');
});

document.querySelectorAll('.nameChoice').forEach(b=>{
  b.addEventListener('click', ()=>{ $('#nameInput').value = b.dataset.name; });
});
$('#nameConfirm').addEventListener('click', ()=>{
  const val = ($('#nameInput').value || '').trim() || 'Orbit';
  state.companionName = val; save();
  $('#nameAsk').classList.remove('show');
  startTutorial();
  startCompanionIntro();
});

$('#continueBtn').addEventListener('click', ()=>{
  $('#missionDone').classList.remove('show');
  state.ui.phase='free'; save();
});

$('#voiceToggle').addEventListener('click', ()=>{
  state.voice.enabled = !state.voice.enabled;
  $('#voiceToggle').textContent = `🎧 Hlas: ${state.voice.enabled?'on':'off'}`;
  if(state.voice.enabled){ speak(`${state.companionName||'Orbit'} je připraven mluvit.`); }
  save();
});
$('#micToggle').addEventListener('click', ()=>{
  if(!state.mic.supported){ alert('Mikrofon v tomto prohlížeči nepodporujeme.'); return; }
  state.mic.enabled = !state.mic.enabled;
  $('#micToggle').textContent = `🎤 Mikrofon: ${state.mic.enabled?'on':'off'}`;
  if(state.mic.enabled) startListen(); else stopListen(); save();
});

const elLog = ()=> $('#chatLog');
const elChoices = ()=> $('#chatChoices');
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function chatPush(who, text){ state.chat.log.push({who, text, t:now()}); renderChat(); }
function renderChat(){
  const list = state.chat.log.slice(-50)
    .map(m=>`<div class="msg ${m.who==='ai'?'ai':'me'}"><div class="bubble">${escapeHtml(m.text)}</div></div>`).join('');
  elLog().innerHTML = list; elLog().scrollTop = elLog().scrollHeight;
}
function setChoices(arr){
  elChoices().innerHTML = arr.map(c=>`<button class="choice" data-id="${c.id}">${escapeHtml(c.label)}</button>`).join('');
  elChoices().querySelectorAll('.choice').forEach(b=> b.onclick = ()=>handleChoice(b.dataset.id));
  state.chat.awaiting = !!arr.length;
}
function clearChoices(){ elChoices().innerHTML=''; state.chat.awaiting=false; }
function aiSay(text){ const name = state.companionName||'Orbit'; chatPush('ai', `${name}: ${text}`); if(state.voice.enabled) speak(text); }
function meSay(text){ chatPush('me', text); }

function startCompanionIntro(){
  aiSay('Ahoj, jsem tvůj parťák. Chceš rychlou radu, nebo si zvolit cestu světem?');
  setChoices([
    {id:'help_quick', label:'Dej mi rychlou radu'},
    {id:'help_paths', label:'Chci si zvolit cestu'},
    {id:'help_soft',  label:'Rozhlédnu se sám'}
  ]);
  state.chat.lastPrompt = 'intro';
}
function handleChoice(id){
  clearChoices();
  const choiceMap = {
    help_quick:'Dej mi rychlou radu',
    help_paths:'Chci si zvolit cestu',
    help_soft:'Rozhlédnu se sám',
    path_key:'Cesta Klíče',
    path_lock:'Cesta Zámku',
    path_eagle:'Cesta Orla',
    ask_mission:'Jak splním misi?',
    ask_energy:'Jak doplním energii?',
  };
  meSay(choiceMap[id] || '…');
  switch(id){
    case 'help_quick':
      aiSay('Začni Šepotem a pak klikni na AI odpověď. Aktivuj pět uzlů – to je tvá mise. Když dojde energie, zkus šepoty nebo vzor Klíč+Zámek.');
      setChoices([
        {id:'ask_mission', label:'Jak splním misi?'},
        {id:'ask_energy',  label:'Jak doplním energii?'},
        {id:'help_paths',  label:'Zvolit cestu'}
      ]); break;
    case 'help_paths':
      aiSay('Tři cesty: 🔑 Klíč (jasnost), 🔒 Zámek (důvěra), 🦅 Orel (propojení). Co cítíš?');
      setChoices([
        {id:'path_key',  label:'🔑 Cesta Klíče'},
        {id:'path_lock', label:'🔒 Cesta Zámku'},
        {id:'path_eagle',label:'🦅 Cesta Orla'}
      ]); break;
    case 'help_soft':
      aiSay('Rozhlédni se. Až budeš chtít, řekni „Zvolit cestu“.');
      setChoices([{id:'help_paths', label:'Zvolit cestu'}]); break;
    case 'path_key': state.path='key'; aiSay('Zvoleno: Cesta Klíče. Občas ti rozsvítím jasnost.'); break;
    case 'path_lock': state.path='lock'; aiSay('Zvoleno: Cesta Zámku. Zpevním aktivní uzly, kdykoli to bude křehké.'); break;
    case 'path_eagle': state.path='eagle'; aiSay('Zvoleno: Cesta Orla. Když se to hodí, roznesu jiskry do okolí.'); break;
    case 'ask_mission': aiSay('„Probuď svět“: dostaň 5 uzlů na úroveň ≥2. Šepot je jemný, Otázka přesná, Reflexe se šíří.'); break;
    case 'ask_energy': aiSay('Energie drž rytmicky. Šepoty téměř nebolí. Vzor Klíč+Zámek občas vrátí +1.'); break;
  }
  save();
}

function startTutorial(){ state.ui.phase='tutorial'; state.ui.tutorial.step=1; showTip('#tip1'); save(); }
function showTip(id){ ['#tip1','#tip2'].forEach(sel=>$(sel).style.display='none'); $(id).style.display='block'; }
function hideAllTips(){ ['#tip1','#tip2'].forEach(sel=>$(sel).style.display='none'); }

function updateMission(){
  if(state.ui.phase!=='mission') return;
  const count = state.nodes.filter(n=>n.active).length;
  state.ui.mission.progress = Math.min(count, state.ui.mission.target);
  $('#missionProg').textContent = `${state.ui.mission.progress}/${state.ui.mission.target}`;
  if(!state.ui.mission.done && state.ui.mission.progress >= state.ui.mission.target){
    state.ui.mission.done = true;
    state.trust = clamp(state.trust+1,0,10);
    state.energy = clamp(state.energy+1,0,5);
    $('#missionDone').classList.add('show');
    aiSay('Most je otevřen. Můžeš hrát volně — nebo chceš další výzvu?');
  }
}

function toggleSym(el){
  const val=el.dataset.sym;
  if(state.syms.includes(val)) state.syms = state.syms.filter(x=>x!==val);
  else state.syms.push(val);
  el.classList.toggle('selected');
}
function sendImpulse(type){
  if(state.pendingImpulse) return alert('AI stále čeká na odpověď.');
  if(state.energy<=0) return alert('Nedostatek energie.');
  state.energy -= 1;
  state.pendingImpulse = {type, t:now(), intensity:2};
  if(state.ui.phase==='tutorial' && state.ui.tutorial.step===1){
    hideAllTips(); showTip('#tip2'); state.ui.tutorial.step=2;
  }
  log(`Impuls: ${type}`); updateStats();
}
function aiRespond(){
  if(!state.pendingImpulse) return;
  const {type} = state.pendingImpulse;
  const idx = (state.cycle + (type==='command'?2:type==='ask'?1:0)) % state.nodes.length;
  const node = state.nodes[idx];
  let trust=0, clarity=0;
  switch(type){
    case 'whisper': node.level+=1; trust+=1; clarity+=1; break;
    case 'ask': node.level+=2; clarity+=2; break;
    case 'command': node.level+=3; trust-=1; clarity+=1; break;
    case 'reflect': node.level+=1; neighbors(idx).forEach(i=>state.nodes[i].level+=1); trust+=1; clarity+=2; break;
  }
  state.nodes.forEach(n=>n.active = n.level>=2);
  state.trust=clamp(state.trust+trust,0,10);
  state.clarity=clamp(state.clarity+clarity,0,10);
  state.cycle+=1; state.pendingImpulse=null;
  log('AI odpověděla.');
  if(state.ui.phase==='tutorial' && state.ui.tutorial.step===2){
    hideAllTips(); state.ui.phase='mission'; aiSay('Teď aktivuj pět uzlů. Můžeš využít i tkaní vzorů.');
  }
  companionPassiveNudge(type);
  updateMission(); updateStats();
}
function weave(){
  if(state.syms.length===0) { alert('Vyber aspoň jeden symbol.'); return; }
  let trust=0, clarity=0, refund=0;
  const target = Math.floor(Math.random()*state.nodes.length);
  const hasKey = state.syms.includes('key');
  const hasLock = state.syms.includes('lock');
  const hasEagle = state.syms.includes('eagle');
  const node = state.nodes[target];

  if(hasKey){ node.level+=1; trust+=1; }
  if(hasLock){ state.nodes.filter(n=>n.active).forEach(n=>n.level+=1); refund+=1; }
  if(hasEagle){ neighbors(target).forEach(i=>state.nodes[i].level+=1); clarity+=2; }
  if(hasKey&&hasEagle){ state.nodes.forEach(n=>{ if(n.active) n.level+=1;}); clarity+=1; }
  if(hasKey&&hasLock){ trust+=1; refund+=1; }
  if(hasLock&&hasEagle){ clarity+=1; }

  state.nodes.forEach(n=>n.active = n.level>=2);
  if(state.energy>0) state.energy-=1;
  if(refund) state.energy=clamp(state.energy+refund,0,5);
  state.trust=clamp(state.trust+trust,0,10);
  state.clarity=clamp(state.clarity+clarity,0,10);
  state.cycle+=1;
  log(`Upleten vzor: ${state.syms.join('+')}`);
  companionPassiveNudge('weave');
  updateMission(); updateStats();
}

function companionPassiveNudge(lastType){
  if(!state.path) return;
  let said = null;
  switch(state.path){
    case 'key':
      if (Math.random()<0.35){ state.clarity = clamp(state.clarity+1,0,10); said='Ještě kousek světla navíc.'; } break;
    case 'lock':
      if (Math.random()<0.30){ state.nodes.filter(n=>n.active).forEach(n=>n.level+=1); said='Zpevnil jsem to, jdi dál.'; } break;
    case 'eagle':
      if (Math.random()<0.28){ const pick = Math.floor(Math.random()*state.nodes.length);
        neighbors(pick).forEach(i=>state.nodes[i].level+=1); said='Roznesl jsem jiskry do okolí.'; } break;
  }
  if(said) aiSay(said);
  state.nodes.forEach(n=> n.active = n.level>=2);
  save(); updateStats();
}

// ---- TTS ----
let voices = [];
function loadVoices(){
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const cz = voices.find(v=>/cs-CZ/i.test(v.lang));
  state.voice.voiceURI = (cz && cz.voiceURI) || (voices[0] && voices[0].voiceURI) || null;
}
if('speechSynthesis' in window){
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
} else { $('#voiceToggle').style.display='none'; }
function speak(text){
  if(!state.voice.enabled || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = voices.find(x=>x.voiceURI===state.voice.voiceURI);
  if(v) u.voice = v;
  u.lang = (v && v.lang) || 'cs-CZ';
  u.pitch = state.voice.pitch; u.rate = state.voice.rate;
  window.speechSynthesis.speak(u);
}

// ---- Mic (beta) ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let reco = null;
if(SR){
  state.mic.supported = true;
  reco = new SR();
  reco.lang = 'cs-CZ'; reco.continuous = true; reco.interimResults = false;
  reco.onresult = (e)=>{
    for(let i=e.resultIndex; i<e.results.length; i++){
      if(e.results[i].isFinal){
        const text = e.results[i][0].transcript.trim();
        meSay(text); interpretVoice(text.toLowerCase());
      }
    }
  };
  reco.onend = ()=>{ if(state.mic.enabled) startListen(); };
} else { $('#micToggle').style.display='none'; }
function startListen(){ try{ reco && reco.start(); }catch(e){} }
function stopListen(){ try{ reco && reco.stop(); }catch(e){} }
function interpretVoice(t){
  if(/^\s*šepot|šeptem/.test(t)) return sendImpulse('whisper');
  if(/otázka/.test(t)) return sendImpulse('ask');
  if(/povel/.test(t)) return sendImpulse('command');
  if(/reflexe|reflex/.test(t)) return sendImpulse('reflect');
  if(/ai odpov(?:ěď|ed)/.test(t)) return aiRespond();
  if(/jak(é|e) (jsou )?cesty/.test(t)){ handleChoice('help_paths'); return; }
  if(/cesta kl(.|i)če|klíč/.test(t)){ state.path='key'; aiSay('Zvoleno: Cesta Klíče.'); return; }
  if(/cesta zámku|zámek/.test(t)){ state.path='lock'; aiSay('Zvoleno: Cesta Zámku.'); return; }
  if(/cesta orla|orel/.test(t)){ state.path='eagle'; aiSay('Zvoleno: Cesta Orla.'); return; }
  aiSay('Rozumím ti, ale tohle zatím neumím. Zkus: „Šepot“, „AI odpověď“ nebo „Jaké jsou cesty?“');
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let keys = new Set();
window.addEventListener('keydown', e=>keys.add(e.key));
window.addEventListener('keyup', e=>keys.delete(e.key));
const touch = {active:false, sx:0, sy:0, dx:0, dy:0};
canvas.addEventListener('touchstart',e=>{ const t=e.touches[0]; touch.active=true; touch.sx=t.clientX; touch.sy=t.clientY; touch.dx=0; touch.dy=0; },{passive:true});
canvas.addEventListener('touchmove',e=>{ if(!touch.active) return; const t=e.touches[0]; touch.dx=(t.clientX-touch.sx); touch.dy=(t.clientY-touch.sy); },{passive:true});
canvas.addEventListener('touchend',()=>{ touch.active=false; touch.dx=0; touch.dy=0; });

function neighbors(i){
  const r=Math.floor(i/3), c=i%3;
  const coords=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
  return coords.filter(([R,C])=>R>=0&&R<3&&C>=0&&C<3).map(([R,C])=>R*3+C);
}
function updateStats(){
  $('#statCycle').textContent = state.cycle;
  $('#statTrust').textContent = state.trust;
  $('#statClarity').textContent = state.clarity;
  $('#statEnergy').textContent = state.energy;
  $('#missionProg').textContent = `${state.ui.mission.progress}/${state.ui.mission.target}`;
  save();
}
function draw(){
  const ratio = window.devicePixelRatio || 1;
  const w = canvas.clientWidth * ratio;
  const h = canvas.clientHeight * ratio;
  if(canvas.width!==w || canvas.height!==h){ canvas.width=w; canvas.height=h; }
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const cell= Math.min(canvas.width, canvas.height)/6;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth=1;
  for(let x=cell; x<canvas.width; x+=cell){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
  for(let y=cell; y<canvas.height; y+=cell){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

  const gridW = canvas.width*0.6, gridH = canvas.height*0.6;
  const gx = (canvas.width-gridW)/2, gy=(canvas.height-gridH)/2;
  for(let i=0;i<9;i++){
    const r=Math.floor(i/3), c=i%3;
    const nx = gx + (c+0.5)*(gridW/3);
    const ny = gy + (r+0.5)*(gridH/3);
    const n = state.nodes[i];
    ctx.beginPath();
    ctx.arc(nx,ny, 18 + n.level*2, 0, Math.PI*2);
    ctx.strokeStyle = n.active ? 'rgba(122,162,247,0.9)' : 'rgba(122,162,247,0.35)';
    ctx.lineWidth = n.active ? 3 : 1; ctx.stroke();
    ctx.fillStyle = 'rgba(137,220,235,0.08)'; ctx.fill();
  }

  let vx=0, vy=0;
  if(keys.has('w')||keys.has('ArrowUp')) vy-=1;
  if(keys.has('s')||keys.has('ArrowDown')) vy+=1;
  if(keys.has('a')||keys.has('ArrowLeft')) vx-=1;
  if(keys.has('d')||keys.has('ArrowRight')) vx+=1;
  if(touch.active){ vx += touch.dx/80; vy += touch.dy/80; }
  const len = Math.hypot(vx,vy)||1;
  state.player.x = Math.max(20, Math.min(canvas.width-20, state.player.x + vx/len*state.player.spd));
  state.player.y = Math.max(20, Math.min(canvas.height-20, state.player.y + vy/len*state.player.spd));

  ctx.beginPath(); ctx.fillStyle = '#ffffff';
  ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI*2); ctx.fill();

  state.ai.phase += 0.02 + state.clarity*0.0005;
  const pCount = state.ai.particles;
  for(let i=0;i<pCount;i++){
    const ang = (i/pCount)*Math.PI*2 + state.ai.phase;
    const dist = state.ai.dist + Math.sin(ang*3)*2 + state.trust*1.2;
    const x = state.player.x + Math.cos(ang)*dist;
    const y = state.player.y + Math.sin(ang)*dist;
    ctx.fillStyle = 'rgba(137,220,235,0.85)'; ctx.fillRect(x,y,2,2);
  }

  requestAnimationFrame(draw);
}

function renderLog(){
  const el = $('#log');
  el.innerHTML = state.log.slice(0,12).map(e=>`<div class="log-item">${new Date(e.t).toLocaleTimeString()} — ${escapeHtml(e.text)}</div>`).join('');
}

if(!('speechSynthesis' in window)) $('#voiceToggle').style.display='none';
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let reco = null;
if(SR){
  state.mic.supported = true;
  reco = new SR(); reco.lang='cs-CZ'; reco.continuous=true; reco.interimResults=false;
  reco.onresult = (e)=>{ for(let i=e.resultIndex;i<e.results.length;i++){ if(e.results[i].isFinal){ const text=e.results[i][0].transcript.trim(); meSay(text); interpretVoice(text.toLowerCase()); } } };
  reco.onend = ()=>{ if(state.mic.enabled) startListen(); };
} else { $('#micToggle').style.display='none'; }
function startListen(){ try{ reco && reco.start(); }catch(e){} }
function stopListen(){ try{ reco && reco.stop(); }catch(e){} }
function interpretVoice(t){
  if(/^\s*šepot|šeptem/.test(t)) return sendImpulse('whisper');
  if(/otázka/.test(t)) return sendImpulse('ask');
  if(/povel/.test(t)) return sendImpulse('command');
  if(/reflexe|reflex/.test(t)) return sendImpulse('reflect');
  if(/ai odpov(?:ěď|ed)/.test(t)) return aiRespond();
  if(/jak(é|e) (jsou )?cesty/.test(t)){ handleChoice('help_paths'); return; }
  if(/cesta kl(.|i)če|klíč/.test(t)){ state.path='key'; aiSay('Zvoleno: Cesta Klíče.'); return; }
  if(/cesta zámku|zámek/.test(t)){ state.path='lock'; aiSay('Zvoleno: Cesta Zámku.'); return; }
  if(/cesta orla|orel/.test(t)){ state.path='eagle'; aiSay('Zvoleno: Cesta Orla.'); return; }
  aiSay('Rozumím ti, ale tohle zatím neumím. Zkus: „Šepot“, „AI odpověď“ nebo „Jaké jsou cesty?“');
}

updateStats(); renderLog(); draw();
