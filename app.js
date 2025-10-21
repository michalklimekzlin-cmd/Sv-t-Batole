// ================================================================
// Batolesvět — app.js (drop-in, samostatná verze)
// Světlo (den/noc) → fotosyntéza → energie ⚡ → tlukot srdce 💓
// + živé písmenkové „dechy“ na plátně
// ================================================================

// ---------- Canvas / Resize ----------
const canvas = document.querySelector('#glview');
const ctx = canvas.getContext('2d');
function resize() {
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width  = Math.floor(window.innerWidth  * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width  = '100vw';
  canvas.style.height = '100vh';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // kreslíme v CSS pixelech
}
window.addEventListener('resize', resize);
resize();

// ---------- World state ----------
const World = { lastMs: 0 };

// ---------- Bio (světlo, energie) ----------
const Bio = {
  light: 0,        // 0..1 (noc..poledne)
  energy: 0,       // 0..100 (UI ⚡)
  dayMs: 60000,    // 60 s = 1 den (můžeš změnit)
  uiLight: document.getElementById('lightLevel'),
  uiEnergy: document.getElementById('bioEnergy'),
};

function updateLight(nowMs){
  const phase = (nowMs % Bio.dayMs) / Bio.dayMs;      // 0..1
  // hladký cyklus: noc(0) → svítání → poledne(1) → soumrak → noc(0)
  // sinus přes půl periody, aby nebyla záporná hodnota
  Bio.light = Math.max(0, Math.sin(phase * Math.PI)); // 0..1
}

function photosynthesize(dtMs){
  const dt = dtMs / 1000;
  // základní přírůstek energie ze světla (jemný)
  Bio.energy += Bio.light * 6 * dt;
  // přirozené „spalování“ i v noci
  Bio.energy -= 0.8 * dt;
  // omezit rozsah
  if (Bio.energy < 0) Bio.energy = 0;
  if (Bio.energy > 100) Bio.energy = 100;
}

function updateBioUI(){
  if (Bio.uiLight)  Bio.uiLight.textContent  = `☀︎ ${Math.round(Bio.light*100)}%`;
  if (Bio.uiEnergy) Bio.uiEnergy.textContent = `⚡ ${Math.round(Bio.energy)}`;
}

// ---------- Heartbeat (tlukot srdce) ----------
let heartAcc = 0;
function updateHeartbeat(dtMs){
  const bpm = 60 + (Bio.energy / 100) * 60;      // 60..120 BPM podle ⚡
  const interval = 60000 / bpm;                  // ms mezi údery
  heartAcc += dtMs;
  if (heartAcc >= interval) {
    heartAcc = 0;
    beatHeartOverlay();                          // vizuální puls
    // console.log('💓 Batolesvět bije…');
  }
}

// jemný záblesk přes obraz (screen mix)
let heartFlash = 0; // 0..1
function beatHeartOverlay(){
  heartFlash = 1; // nastartuj záblesk, vyprchá v renderu
}

// ---------- Glyph world (živá písmenka) ----------
const glyphs = []; // {x,y,char,life,color}
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let spawnAcc = 0;

function spawnGlyph(){
  const ch = alphabet[Math.floor(Math.random() * alphabet.length)];
  // spawn uprostřed s lehkým rozptylem
  const x = canvas.width  / (2 * (ctx.getTransform().a || 1)) + (Math.random()*80 - 40);
  const y = canvas.height / (2 * (ctx.getTransform().a || 1)) + (Math.random()*80 - 40);
  const color = `rgba(127,255,212,${0.7 + Math.random()*0.3})`;
  glyphs.push({ x, y, char: ch, life: 2500 + Math.random()*1500, color });
}

function updateGlyphs(dt){
  spawnAcc += dt;
  // čím více světla, tím častější „dech“ písmen
  const spawnEvery = 140 - Bio.light * 80; // 140..60 ms
  while (spawnAcc >= spawnEvery) {
    spawnAcc -= spawnEvery;
    spawnGlyph();
  }
  // stárnutí
  for (let i = glyphs.length - 1; i >= 0; i--) {
    const g = glyphs[i];
    g.life -= dt;
    if (g.life <= 0) glyphs.splice(i, 1);
  }
}

function drawGlyphs(){
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

// ---------- Background (den/noc + dech) ----------
function drawBackground(nowMs){
  // barva se odvíjí od světla
  const L = Bio.light; // 0..1
  const r = Math.floor(10 + 40 * L);
  const g = Math.floor(12 + 90 * L);
  const b = Math.floor(20 + 160 * L);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // globální „dýchání“ světa (pomalé vlnění jasu)
  const breath = (Math.sin(nowMs/1000) * 0.5 + 0.5) * 0.06; // 0..0.06
  ctx.save();
  ctx.globalAlpha = breath;
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = '#7fffd4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // srdeční záblesk (rychlé vyprchání)
  if (heartFlash > 0) {
    ctx.save();
    ctx.globalAlpha = heartFlash * 0.25; // max 0.25
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#ff5078';          // teplý „tep“
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    heartFlash = Math.max(0, heartFlash - 0.06); // vyprchávání
  }
}

// ---------- Chat → svět krmí slovem ----------
const input = document.querySelector('#msg');
const sendBtn = document.querySelector('#send');
function feedWorldByChat(text){
  if (!text || !text.trim()) return;
  // každé slovo = trocha energie + mikro záblesk
  const words = text.trim().split(/\s+/).length;
  Bio.energy = Math.min(100, Bio.energy + Math.min(8, words * 1.2));
  beatHeartOverlay();
  updateBioUI();
}
if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    const t = input?.value || '';
    feedWorldByChat(t);
    if (input) input.value = '';
  });
}
if (input) {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      feedWorldByChat(input.value);
      input.value = '';
    }
  });
}

// ---------- Main loop ----------
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

// ---------- Start logs ----------
console.log('Batolesvět: světlo/fotosyntéza/tep aktivní ✅');