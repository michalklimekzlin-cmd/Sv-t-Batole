// ================================================================
// Batolesvět — app.js (bio cyklus + tlukot + písmenkový dech)
// ================================================================

// ---------- Canvas / Resize ----------
const canvas = document.querySelector('#glview');
if (!canvas) {
  console.error('Nenalezen <canvas id="glview">');
}
const ctx = canvas?.getContext('2d');
function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width  = Math.floor(window.innerWidth  * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width  = '100vw';
  canvas.style.height = '100vh';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // kreslení v CSS pixelech
}
window.addEventListener('resize', resize);
resize();

// ---------- World time ----------
const World = { lastMs: 0 };

// ---------- Biologie (světlo/energie) ----------
const Bio = {
  light: 0,        // 0..1 noc..den
  energy: 0,       // 0..100
  dayMs: 60000,    // 60 s = 1 den (pro test)
  uiLight: document.getElementById('lightLevel'),
  uiEnergy: document.getElementById('bioEnergy'),
};

function updateLight(nowMs){
  const phase = (nowMs % Bio.dayMs) / Bio.dayMs;   // 0..1
  Bio.light = Math.max(0, Math.sin(phase * Math.PI)); // 0..1 (sin přes půl periody)
}

function photosynthesize(dtMs){
  const dt = dtMs / 1000;
  Bio.energy += Bio.light * 6 * dt; // přírůstek přes den
  Bio.energy -= 0.8 * dt;           // bazální „spalování“ i v noci
  if (Bio.energy < 0) Bio.energy = 0;
  if (Bio.energy > 100) Bio.energy = 100;
}

function updateBioUI(){
  if (Bio.uiLight)  Bio.uiLight.textContent  = `☀︎ ${Math.round(Bio.light*100)}%`;
  if (Bio.uiEnergy) Bio.uiEnergy.textContent = `⚡ ${Math.round(Bio.energy)}`;
}

// ---------- Tlukot srdce ----------
let heartAcc = 0, heartFlash = 0;

function updateHeartbeat(dtMs){
  const bpm = 60 + (Bio.energy / 100) * 60; // 60..120 BPM
  const interval = 60000 / bpm;
  heartAcc += dtMs;
  if (heartAcc >= interval) {
    heartAcc = 0;
    heartFlash = 1; // spustit krátký puls
    // console.log('💓 Batolesvět bije…');
  }
}

// ---------- Písmenkový dech ----------
const glyphs = [];
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let spawnAcc = 0;

function spawnGlyph(){
  if (!canvas || !ctx) return;
  const ch = alphabet[(Math.random()*alphabet.length)|0];
  const x = canvas.width  / (2 * (ctx.getTransform().a || 1)) + (Math.random()*80 - 40);
  const y = canvas.height / (2 * (ctx.getTransform().a || 1)) + (Math.random()*80 - 40);
  const color = `rgba(127,255,212,${0.7 + Math.random()*0.3})`;
  glyphs.push({ x, y, char: ch, life: 2500 + Math.random()*1500, color });
}

function updateGlyphs(dt){
  spawnAcc += dt;
  const spawnEvery = 140 - Bio.light * 80; // 140..60 ms (víc světla → víc písmenek)
  while (spawnAcc >= spawnEvery) {
    spawnAcc -= spawnEvery;
    spawnGlyph();
  }
  for (let i = glyphs.length - 1; i >= 0; i--) {
    glyphs[i].life -= dt;
    if (glyphs[i].life <= 0) glyphs.splice(i, 1);
  }
}

function drawGlyphs(){
  if (!ctx) return;
  ctx.save();
  ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.textBaseline = 'top';
  for (const g of glyphs) {
    const a = Math.max(0, Math.min(1, g.life / 3000));
    ctx.globalAlpha = a;
    ctx.fillStyle = g.color;
    ctx.fillText(g.char, g.x, g.y);
  }
  ctx.restore();
}

// ---------- Pozadí (den/noc + dýchání + pulz) ----------
function drawBackground(nowMs){
  if (!ctx || !canvas) return;
  const L = Bio.light; // 0..1
  const r = Math.floor(10 + 40 * L);
  const g = Math.floor(12 + 90 * L);
  const b = Math.floor(20 + 160 * L);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // „dýchání“
  const breath = (Math.sin(nowMs/1000) * 0.5 + 0.5) * 0.06; // 0..0.06
  ctx.save();
  ctx.globalAlpha = breath;
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = '#7fffd4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // srdeční záblesk
  if (heartFlash > 0) {
    ctx.save();
    ctx.globalAlpha = heartFlash * 0.25;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#ff5078';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    heartFlash = Math.max(0, heartFlash - 0.06);
  }
}

// ---------- Chat (krmí svět slovem) ----------
const input = document.querySelector('#msg');
const sendBtn = document.querySelector('#send');

function feedWorldByChat(text){
  if (!text || !text.trim()) return;
  const words = text.trim().split(/\s+/).length;
  Bio.energy = Math.min(100, Bio.energy + Math.min(8, words * 1.2));
  heartFlash = 1;
  updateBioUI();
}

sendBtn?.addEventListener('click', () => {
  feedWorldByChat(input?.value || '');
  if (input) input.value = '';
});
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    feedWorldByChat(input.value);
    input.value = '';
  }
});

// ---------- Hlavní smyčka ----------
function loop(now){
  if (!World.lastMs) World.lastMs = now;
  const dt = now - World.lastMs;
  World.lastMs = now;

  // biologie
  updateLight(now);
  photosynthesize(dt);
  updateBioUI();
  updateHeartbeat(dt);

  // vykreslení
  drawBackground(now);
  updateGlyphs(dt);
  drawGlyphs();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

console.log('Batolesvět: bio cyklus aktivní ✅');