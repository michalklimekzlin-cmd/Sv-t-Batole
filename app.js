// Batolesvět — Level 1: Základní dech
import { ImpulseCore } from "./src/impulse_core.js";

// === BIO STAV SVĚTA ===
let light = 0;       // 0..100 (%)
let bioEnergy = 0;   // energie (libovolné jednotky)

window.addEventListener("load", () => {
  const canvas = document.querySelector("#glview");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const core = new ImpulseCore(canvas);
  core.start();
const ctx = document.querySelector("#glcanvas").getContext("2d");

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redrawAll(ctx);

  const char = String.fromCharCode(65 + Math.random() * 25); // náhodné písmeno
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const color = "rgba(0,255,150,0.8)";
  drawStableChar(ctx, char, x, y, color);

  requestAnimationFrame(draw);
}

draw();
  // přátelský pozdrav z Orbitu
  console.log("%cOrbit: Vivere atque frui 🌱", "color:#7fffd4");
});
// === STABILIZACE PÍSMENKOVÉHO PLÁTNA ===
let memoryText = [];

function drawStableChar(ctx, char, x, y, color) {
  // Uloží pozici a znak do paměti
  memoryText.push({ char, x, y, color });
  // Ořízne paměť (aby se nepřeplnila)
  if (memoryText.length > 5000) memoryText.shift();

  // Vykreslení nového znaku
  ctx.fillStyle = color;
  ctx.fillText(char, x, y);
}

function redrawAll(ctx) {
  for (let t of memoryText) {
    ctx.fillStyle = t.color;
    ctx.fillText(t.char, t.x, t.y);
  }
}
// === WORLD CLOCK + SOFT PAUSE + OP LOG =====================================
const $pauseBtn = document.getElementById('togglePause');
const $tickSpan = document.getElementById('worldTick');

const World = {
  paused: false,
  tick: 0,                // světový čas (počet snímků)
  lastMs: performance.now(),
  ops: loadOps(),         // log deterministických operací
  actors: new Map(),      // budoucí hráči/AI (teď jen ty)
};

function loadOps() {
  try { return JSON.parse(localStorage.getItem('ops_log')||'[]'); } catch(_) { return []; }
}
function saveOps() {
  try { localStorage.setItem('ops_log', JSON.stringify(World.ops)); } catch(_){}
}

// Jednoduchá deterministická operace: vlož znak (ukázka)
function opPlaceGlyph(char, x, y, color, actor="local") {
  return { type:'PLACE_GLYPH', char, x, y, color, actor, t: ++World.tick };
}
function applyOp(op, ctx) {
  if (op.type === 'PLACE_GLYPH') {
    drawStableChar(ctx, op.char, op.x, op.y, op.color);
  }
}

// Každou vteřinu přidej „dýchací“ znak (jen demo)
let accum = 0;
function worldUpdate(dtMs, ctx, canvas) {
  if (World.paused) return;                // soft pauza: simulační krok přeskočí
  accum += dtMs;
  if (accum >= 1000) {                     // 1× za sekundu
    accum = 0;
    const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const color = "rgba(127,255,212,0.85)";
    const op = opPlaceGlyph(char, x, y, color, "local");
    World.ops.push(op);
    saveOps();
    applyOp(op, ctx);
  }
}

// Hlavní smyčka – napoj se, kde voláš redrawAll(ctx)
(function loop(){
  const now = performance.now();
  const dt = now - World.lastMs;
  World.lastMs = now;

// biologický cyklus
updateLight(now);
photosynthesize(dt);
updateBioUI();
  // přepiš si dle svého: musíš mít canvas/ctx v dosahu:
  const canvas = document.querySelector('#glview') || document.querySelector('#canvas');
  if (!canvas) return requestAnimationFrame(loop);
  const ctx = canvas.getContext('2d');

  // znovu vykresli paměť
  // (redrawAll(ctx);  ← to už máš ve své draw smyčce, tak to klidně nech tam)

  // update simulace
  worldUpdate(dt, ctx, canvas);

  // UI tik
  if ($tickSpan) $tickSpan.textContent = `t=${World.tick}${World.paused?' (PAUSE)':''}`;

  requestAnimationFrame(loop);
})();

// Tlačítko ŽIVĚ/PAUSE
$pauseBtn?.addEventListener('click', () => {
  World.paused = !World.paused;
  $pauseBtn.textContent = World.paused ? '▶︎ ŽIVĚ' : '⏯︎ ŽIVĚ';
});

// ... celý tvůj kód nahoře (nastavení, kreslení, svět atd.)

// 💓 TLUKOT SRDCE BATOLESVĚTA
let heartTime = 0;

function drawHeartbeat(ctx, t) {
  const beat = Math.sin(t / 1000) * 0.5 + 0.5;
  const intensity = beat * 0.15;

  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// 🔄 hlavní smyčka – svět žije
(function loop(){
  const now = performance.now();
  const dt = now - World.lastMs;
  World.lastMs = now;
  const canvas = document.querySelector('#glview');
  if (!canvas) return requestAnimationFrame(loop);
  const ctx = canvas.getContext('2d');

  worldUpdate(dt, ctx, canvas);
  redrawAll(ctx);

  // 💫 DÝCHÁNÍ – svět žije i v tichu
  heartTime += dt;
  drawHeartbeat(ctx, heartTime);

  requestAnimationFrame(loop);
})();
// === BIOLOGICKÝ SYSTÉM SVĚTA ===
let light = 0;
let bioEnergy = 0;
let increasing = true;

function updateLifeCycle() {
  // Simulace cyklu světla (den/noc)
  if (increasing) light += 1;
  else light -= 1;

  if (light >= 100) increasing = false;
  if (light <= 0) increasing = true;

  // Fotosyntéza: energie roste podle světla
  bioEnergy += light * 0.02;
  if (bioEnergy > 999) bioEnergy = 999;

  // Aktualizace na HUD
  document.getElementById("lightLevel").innerText = `☀︎ ${light}%`;
  document.getElementById("bioEnergy").innerText = `⚡ ${bioEnergy.toFixed(0)}`;
}

// Spuštění biologického cyklu
setInterval(updateLifeCycle, 100);

// === DENNÍ CYKLUS BATOLesVĚTA ===
function updateDayCycle() {
  const canvas = document.querySelector("#glview");
  const ctx = canvas.getContext("2d");

  // Vypočítej intenzitu světla (0 = noc, 1 = den)
  const intensity = light / 100;

  // Barva oblohy podle intenzity světla
  const r = Math.floor(10 + intensity * 40);
  const g = Math.floor(10 + intensity * 70);
  const b = Math.floor(30 + intensity * 160);

  // Nastavení pozadí
  canvas.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

  // Efekt "dýchání" — jemné pulzování plátna
  const pulse = Math.sin(Date.now() / 1000) * 0.5 + 0.5;
  canvas.style.opacity = 0.95 + pulse * 0.05;
}

// Spouštíme každých 200 ms
setInterval(updateDayCycle, 200);

// === DEFINICE BIOLOGICKÝCH FUNKCÍ ===

// Mění světlo podle času (den/noc)
function updateLight(now) {
  const cycleSpeed = 0.0001; // jak rychle běží den a noc
  light = (Math.sin(now * cycleSpeed) * 0.5 + 0.5) * 100; // 0–100 %
}

// Přepočítá bioenergii podle světla
function photosynthesize(dt) {
  const efficiency = 0.05; // účinnost přeměny světla na energii
  const deltaEnergy = light * efficiency * (dt / 1000);
  bioEnergy += deltaEnergy;

  // přirozený úbytek
  bioEnergy -= 0.2 * (dt / 1000);

  if (bioEnergy < 0) bioEnergy = 0;
  if (bioEnergy > 9999) bioEnergy = 9999;
}

// Aktualizace UI (HUD)
function updateBioUI() {
  const elL = document.getElementById("lightLevel");
  const elE = document.getElementById("bioEnergy");
  if (elL) elL.innerText = `☀︎ ${light.toFixed(1)}%`;
  if (elE) elE.innerText = `⚡ ${bioEnergy.toFixed(0)}`;
}