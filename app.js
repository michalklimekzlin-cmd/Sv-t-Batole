// v0.3: Intro + Tutorial + Mission (5 active nodes)
const $ = (s)=>document.querySelector(s);
const now = ()=>Date.now();
const SKEY = 'batolesvet:v03';

let state = JSON.parse(localStorage.getItem(SKEY) || 'null') || {
  cycle:0, trust:1, clarity:1, energy:3,
  pendingImpulse:null, syms:[],
  nodes:Array.from({length:9},(_,i)=>({idx:i,level:0,active:false})),
  log:[],
  player:{x:400,y:240,r:16,spd:2},
  ai:{phase:0,dist:40,particles:48},
  ui:{phase:'intro', mission:{target:5, progress:0, done:false}, tutorial:{step:0}}
};

function save(){ localStorage.setItem(SKEY, JSON.stringify(state)); }
function log(t){ state.log.unshift({t:now(),text:t}); renderLog(); save(); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

// --- UI bindings ---
document.querySelectorAll('.btn[data-imp]').forEach(b=>b.addEventListener('click',()=> sendImpulse(b.dataset.imp)));
$('#aiBtn').addEventListener('click',()=> aiRespond());
document.querySelectorAll('.chip[data-sym]').forEach(c=>c.addEventListener('click',()=> toggleSym(c)));
$('#weaveBtn').addEventListener('click',()=> weave());
$('#resetBtn').addEventListener('click',()=>{ localStorage.removeItem(SKEY); location.reload(); });

$('#startBtn').addEventListener('click', ()=>{
  $('#intro').classList.remove('show');
  startTutorial();
});
$('#continueBtn').addEventListener('click', ()=>{
  $('#missionDone').classList.remove('show');
  state.ui.phase='free';
  save();
});

function startTutorial(){
  state.ui.phase='tutorial';
  state.ui.tutorial.step=1;
  showTip('#tip1');
  save();
}
function showTip(id){
  hideAllTips();
  const el = $(id); if(el){ el.style.display='block'; }
}
function hideAllTips(){ ['#tip1','#tip2'].forEach(id=>{ const el=$(id); if(el) el.style.display='none'; }); }

function toggleSym(el){
  const val=el.dataset.sym;
  if(state.syms.includes(val)) state.syms = state.syms.filter(x=>x!==val);
  else state.syms.push(val);
  el.classList.toggle('selected');
}

// --- Core actions ---
function sendImpulse(type){
  if(state.pendingImpulse) return alert('AI stále čeká na odpověď.');
  if(state.energy<=0) return alert('Nedostatek energie.');
  state.energy -= 1;
  state.pendingImpulse = {type, t:now(), intensity:2};
  if(state.ui.phase==='tutorial' && state.ui.tutorial.step===1){
    hideAllTips(); showTip('#tip2'); state.ui.tutorial.step=2;
  }
  log(`Impuls: ${type}`);
  updateStats();
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
  state.cycle+=1;
  state.pendingImpulse=null;
  log('AI odpověděla.');
  if(state.ui.phase==='tutorial' && state.ui.tutorial.step===2){
    hideAllTips();
    state.ui.phase='mission'; // start mission
  }
  updateMission();
  updateStats();
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
  updateMission();
  updateStats();
}

// --- Mission logic ---
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
  }
}

// --- Rendering ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let keys = new Set();

window.addEventListener('keydown', e=>keys.add(e.key));
window.addEventListener('keyup', e=>keys.delete(e.key));

const touch = {active:false, sx:0, sy:0, dx:0, dy:0};
canvas.addEventListener('touchstart',e=>{
  const t=e.touches[0]; touch.active=true; touch.sx=t.clientX; touch.sy=t.clientY; touch.dx=0; touch.dy=0;
},{passive:true});
canvas.addEventListener('touchmove',e=>{
  if(!touch.active) return;
  const t=e.touches[0]; touch.dx=(t.clientX-touch.sx); touch.dy=(t.clientY-touch.sy);
},{passive:true});
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

  // grid background
  const cell= Math.min(canvas.width, canvas.height)/6;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth=1;
  for(let x=cell; x<canvas.width; x+=cell){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
  for(let y=cell; y<canvas.height; y+=cell){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

  // nodes (3x3)
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
    ctx.lineWidth = n.active ? 3 : 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(137,220,235,0.08)';
    ctx.fill();
  }

  // movement
  let vx=0, vy=0;
  if(keys.has('w')||keys.has('ArrowUp')) vy-=1;
  if(keys.has('s')||keys.has('ArrowDown')) vy+=1;
  if(keys.has('a')||keys.has('ArrowLeft')) vx-=1;
  if(keys.has('d')||keys.has('ArrowRight')) vx+=1;
  if(touch.active){ vx += touch.dx/80; vy += touch.dy/80; }
  const len = Math.hypot(vx,vy)||1;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  state.player.x = clamp(state.player.x + vx/len*state.player.spd, 20, canvas.width-20);
  state.player.y = clamp(state.player.y + vy/len*state.player.spd, 20, canvas.height-20);

  // player
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI*2);
  ctx.fill();

  // AI orbit
  state.ai.phase += 0.02 + state.clarity*0.0005;
  const pCount = state.ai.particles;
  for(let i=0;i<pCount;i++){
    const ang = (i/pCount)*Math.PI*2 + state.ai.phase;
    const dist = state.ai.dist + Math.sin(ang*3)*2 + state.trust*1.2;
    const x = state.player.x + Math.cos(ang)*dist;
    const y = state.player.y + Math.sin(ang)*dist;
    ctx.fillStyle = 'rgba(137,220,235,0.85)';
    ctx.fillRect(x,y,2,2);
  }

  requestAnimationFrame(draw);
}

function renderLog(){
  const el = $('#log');
  el.innerHTML = state.log.slice(0,12).map(e=>`<div class="log-item">${new Date(e.t).toLocaleTimeString()} — ${escapeHtml(e.text)}</div>`).join('');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// Init
updateStats(); renderLog(); draw();
