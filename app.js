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