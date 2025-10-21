// 🌱 Batolesvět v0.4 — Michal & Kovošrot build

console.log("✨ Batolesvět se probouzí...");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ========================
// 💡 BIOLOGICKÝ SYSTÉM
// ========================
let Bio = { light: 0, energy: 0, pulse: 0 };

function updateLight(now) {
  const day = 60000; // 1 minuta = 1 den
  const t = (now % day) / day;
  Bio.light = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
}

function photosynthesize(dt) {
  Bio.energy += Bio.light * dt * 0.00005;
  Bio.energy = Math.min(Bio.energy, 1);
}

function updateBioUI() {
  document.getElementById("lightLevel").innerText = `☀︎ ${(Bio.light*100).toFixed(0)}%`;
  document.getElementById("bioEnergy").innerText = `⚡ ${(Bio.energy*100).toFixed(0)}`;
}

function updateHeartbeat(dt) {
  Bio.pulse += dt * (0.002 + Bio.energy * 0.002);
  const beat = 0.5 + 0.5 * Math.sin(Bio.pulse * Math.PI * 2);
  ctx.globalAlpha = 0.03 + 0.05 * beat;
  ctx.fillStyle = `rgba(255,255,255,${0.1 * beat})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ========================
// 🧠 CORE
// ========================
const Core = {
  mood: { val: 0.5 },
  lastSpawn: 0
};

// ========================
// 🧍‍♂️ AVATARY (Michal & Kovošrot)
// ========================
let avatars = [
  { name: "Michal", color: "#00ffcc", x: 100, y: 100, keys: {up:"w",down:"s",left:"a",right:"d"}, active:true },
  { name: "Kovošrot", color: "#ffaa00", x: 200, y: 200, keys: {up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"}, active:false }
];

function stepAvatars(dt, keys) {
  const speed = 0.2;
  for (let a of avatars) {
    if (!a.active) continue;
    if (keys[a.keys.up]) a.y -= speed * dt;
    if (keys[a.keys.down]) a.y += speed * dt;
    if (keys[a.keys.left]) a.x -= speed * dt;
    if (keys[a.keys.right]) a.x += speed * dt;
  }
}

function drawAvatars(ctx) {
  for (let a of avatars) {
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.active ? 10 : 6, 0, Math.PI*2);
    ctx.fill();
  }
}

function toggleAvatar() {
  avatars.forEach(a => a.active = !a.active);
}

// ========================
// ⚡ PERKY (vylepšení 101%)
// ========================
const PERKS = [
  { id:'lidskost', tag:'Lidskost 101%', effect:(pair)=>{ pair.skills.aura = 20; } },
  { id:'inteligence', tag:'Inteligence 101%', effect:(pair)=>{ pair.host.sight += 30; } },
  { id:'tvorivost', tag:'Tvořivost 101%', effect:(pair)=>{ pair.skills.build = true; } },
  { id:'zdravi', tag:'Zdraví 101%', effect:(pair)=>{ pair.skills.heal = true; } },
  { id:'chytrost', tag:'Chytrost 101%', effect:(pair)=>{ pair.host.speed *= 1.05; } },
  { id:'hudba', tag:'Hudba 101%', effect:(pair)=>{ pair._pulseHue = true; } },
  { id:'ekologie', tag:'Ekologie 101%', effect:(pair)=>{ pair._green = true; } },
];

function pickPerks() {
  const n = Math.floor(1 + Math.random() * 2);
  const shuffled = [...PERKS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// ========================
// 🤝 WORLD PAIRS (Host + Buddy)
// ========================
let pairs = [];

function newPairDesign() {
  const design = {
    host: { x: Math.random()*canvas.width, y: Math.random()*canvas.height, color:"#fff", speed:0.05, sight:30 },
    buddy: { x: 0, y: 0, color:"#0ff" },
    skills: {},
    perks: []
  };
  design.buddy.x = design.host.x + 10;
  design.buddy.y = design.host.y + 10;

  design.perks = pickPerks();
  for (const p of design.perks) p.effect(design);

  return design;
}

function spawnWorldPair() {
  if (Bio.energy > 0.3 && pairs.length < 10) {
    pairs.push(newPairDesign());
    Bio.energy -= 0.1;
  }
}

function drawPairs(ctx) {
  const t = performance.now();
  for (let p of pairs) {
    if (p._pulseHue){
      ctx.globalAlpha = 0.06 + 0.06*Math.sin(t/300);
      ctx.fillStyle = '#ffd3f0';
      ctx.beginPath(); ctx.arc(p.host.x, p.host.y, 22, 0, Math.PI*2); ctx.fill();
    }
    if (p._green){
      ctx.globalAlpha = 0.06 + 0.04*Math.sin(t/500);
      ctx.fillStyle = '#aaffdd';
      ctx.beginPath(); ctx.arc(p.buddy.x, p.buddy.y, 16, 0, Math.PI*2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = p.host.color;
    ctx.beginPath();
    ctx.arc(p.host.x, p.host.y, 5, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = p.buddy.color;
    ctx.beginPath();
    ctx.arc(p.buddy.x, p.buddy.y, 4, 0, Math.PI*2);
    ctx.fill();
  }
}

// === ♻️ RECYKLACE: ŠROT & MÍZY ==================================
const Scrap = [];   // {x,y,amt}
const Miza  = [];   // {x,y,vx,vy,life}

const RECY = {
  scrapMax: 50,
  mizaMax:  40,
  scrapUnit: 4,          // kolik ⚡ dá 1 kus šrotu (v promile => 0.004)
  spawnEveryMs: 3500,    // pasivní vznik šrotu (stará stopa)
  lastSpawn: 0
};

// náhodný bod v plátně
function RndPos() {
  return { x: Math.random()*canvas.width, y: Math.random()*canvas.height };
}

// přidá šrot (omezíme množství)
function addScrap(x, y, amt=1){
  if (Scrap.length >= RECY.scrapMax) Scrap.shift();
  Scrap.push({x,y,amt:Math.max(1,amt|0)});
}

// vizuální šrot
function drawScrap(ctx){
  ctx.save();
  for (const s of Scrap){
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#8dd7be";
    ctx.font = "14px monospace";
    ctx.fillText("#", s.x, s.y);        // „kousek šrotu“ jako znak
  }
  ctx.restore();
}

// Mízy – drobné životy
function spawnMiza(n=1){
  for (let i=0;i<n;i++){
    if (Miza.length >= RECY.mizaMax) return;
    const {x,y} = RndPos();
    Miza.push({ x, y, vx:0, vy:0, life: 8000 + Math.random()*8000 });
  }
}

function updateMiza(dt){
  // světlo podporuje vznik života
  if (Bio.light > 0.4 && Math.random() < 0.0015*dt) spawnMiza(1);

  for (let i=Miza.length-1;i>=0;i--){
    const m = Miza[i];
    m.life -= dt;
    if (m.life <= 0) { Miza.splice(i,1); continue; }

    // hledej nejbližší šrot
    let best = null, bestD = 1e9;
    for (const s of Scrap){
      const d = Math.hypot(s.x - m.x, s.y - m.y);
      if (d < bestD){ bestD = d; best = s; }
    }

    // směr: ke šrotu; když není, bloudej ke světlu (střed)
    let tx = canvas.width*0.5, ty = canvas.height*0.5;
    if (best){ tx = best.x; ty = best.y; }

    const dx = tx - m.x, dy = ty - m.y;
    const len = Math.hypot(dx,dy) || 1;
    const speed = 0.07 + 0.08*Bio.light; // víc světla = svižnější
    m.vx = (m.vx + (dx/len)*speed*dt) * 0.93;
    m.vy = (m.vy + (dy/len)*speed*dt) * 0.93;
    m.x += m.vx*dt; m.y += m.vy*dt;

    // kontakt se šrotem => recyklace na energii
    if (best && bestD < 12){
      best.amt -= 1;
      Bio.energy = Math.min(1, Bio.energy + RECY.scrapUnit*0.001); // drobný přírůstek ⚡
      if (best.amt <= 0){
        const idx = Scrap.indexOf(best);
        if (idx>=0) Scrap.splice(idx,1);
      }
    }
  }
}

function drawMiza(ctx){
  const t = performance.now();
  ctx.save();
  for (const m of Miza){
    const pulse = 0.5 + 0.5*Math.sin((t+m.x*0.2+m.y*0.2)/300);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = `hsl(${180+80*Bio.light} 80% ${60+20*pulse}%)`;
    ctx.font = "12px monospace";
    ctx.fillText("*", m.x, m.y);   // Míza jako jiskřička
  }
  ctx.restore();
}

// pasivní vznik „staré stopy“ (recyklovatelný inkoust)
function passiveScrap(now){
  if (now - RECY.lastSpawn > RECY.spawnEveryMs){
    const {x,y} = RndPos();
    addScrap(x, y, 1 + (Math.random()*2)|0);
    RECY.lastSpawn = now;
  }
}

// události recyklace – když je svět zahlcen, přemění část páru na šrot (jemně)
function recyclePressure(){
  if (pairs && pairs.length > 8 && Math.random() < 0.02){
    const p = pairs.shift();
    if (p){
      addScrap(p.host.x, p.host.y, 3);
      // lehké „vrácení“ energie za recyklaci
      Bio.energy = Math.min(1, Bio.energy + 0.02);
    }
  }
}

// pomocný hook: hráč si může „zahodit“ písmeno na šrot (klávesa R)
window.addEventListener('keydown', (e)=>{
  if (e.key.toLowerCase() === 'r'){
    // vezmeme aktivního avatara (nebo střed plátna)
    const a = (avatars && avatars.find(v=>v.active)) || {x:canvas.width/2, y:canvas.height/2};
    addScrap(a.x + (Math.random()*14-7), a.y + (Math.random()*14-7), 2);
  }
});

// ========================
// 🌀 HLAVNÍ SMYČKA
// ========================
let keys = {};
window.addEventListener("keydown", e => {
  if (e.key === "1" || e.key === "2") toggleAvatar();
  keys[e.key] = true;
});
window.addEventListener("keyup", e => keys[e.key] = false);

let last = 0;
function loop(now) {
  const dt = now - last;
  last = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 💚 BIOLOGICKÝ CYKLUS
  updateLight(now);
  photosynthesize(dt);
  updateBioUI();
  updateHeartbeat(dt);

  // 🌍 ŽIVOT SVĚTA
  spawnWorldPair();
  drawPairs(ctx);

  // 🧍‍♂️ AVATARY
  stepAvatars(dt, keys);
  drawAvatars(ctx);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);