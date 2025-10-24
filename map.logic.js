// map.logic.js — „živé dýchání“ orbu podle energie Viriho
// -------------------------------------------------------
// Co dělá:
// 1) vytvoří neklikací překryvný canvas s jemnou aurou
// 2) dýchání (pulz) = funkce času a Viri.energy (0..1)
// 3) poslouchá na custom eventu `viri:energy` a hned upraví rytmus

(() => {
  // --- canvas aura (překryv) ---
  const aura = document.createElement('canvas');
  Object.assign(aura.style, {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0   // nechává UI nad sebou; orb pluje „pod“ aurou, ale vizuálně to sedí
  });
  aura.id = 'auraCanvas';
  document.body.appendChild(aura);
  const ctx = aura.getContext('2d');

  // --- stav ---
  let energy = clamp(Number(window?.Viri?.energy) || 0.75, 0, 1); // výchozí „klid“
  let t0 = performance.now();
  let W = 0, H = 0, CX = 0, CY = 0, baseR = 0;

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    W = aura.width  = Math.floor(innerWidth  * dpr);
    H = aura.height = Math.floor(innerHeight * dpr);
    aura.style.width  = innerWidth + 'px';
    aura.style.height = innerHeight + 'px';
    CX = W * 0.5;
    // orb bývá cca pod středem; jemně posuneme ~ 42 % výšky
    CY = H * 0.42;
    baseR = Math.min(W, H) * 0.18;
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  // --- naslouchání na energii z Viriho ---
  // můžeš volat window.dispatchEvent(new CustomEvent('viri:energy', {detail:{energy:0.6}}))
  addEventListener('viri:energy', (ev) => {
    if (ev?.detail?.energy != null) {
      energy = clamp(Number(ev.detail.energy), 0, 1);
    }
  });

  // --- jádro animace ---
  function loop(ts){
    const dt = (ts - t0) / 1000; // sekundy
    t0 = ts;

    // „dech“: rychlost a hloubka závisí na energii
    // perioda  = 5s (nízká energie) -> 2s (vysoká energie)
    const period = 5 - 3 * energy;
    const w = (Math.PI * 2) / Math.max(0.001, period);
    // amplituda poloměru 3–7 % podle energie
    const amp = 0.03 + 0.04 * energy;
    const breath = Math.sin(performance.now() * 0.001 * w) * amp;

    // vyčistit
    ctx.clearRect(0,0,W,H);

    // aura – jemný více-stupňový radiální gradient
    const r = baseR * (1 + breath);
    const grad = ctx.createRadialGradient(CX, CY, r*0.15, CX, CY, r*1.6);
    // barvy: vnitřek lehce jasnější, vnější temný do ztracena
    const coreAlpha  = 0.25 + 0.35 * energy; // 0.25–0.60
    const ringAlpha  = 0.10 + 0.25 * energy; // 0.10–0.35
    grad.addColorStop(0.00, `rgba(123,233,205,${coreAlpha})`);
    grad.addColorStop(0.35, `rgba( 40,120,110,${ringAlpha})`);
    grad.addColorStop(1.00, `rgba(  0,  0,  0, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CX, CY, r*1.6, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // --- volitelný ping: drobné zvýšení energie na chvilku ---
  addEventListener('viri:ping', () => {
    // krátký „nádech“ po pingnutí
    energy = clamp(energy + 0.08, 0, 1);
    setTimeout(() => energy = clamp(energy - 0.06, 0, 1), 1200);
  });

  // Pomocná API pro ostatní skripty (nepovinné)
  window.ViriAura = {
    setEnergy: (e) => { energy = clamp(Number(e)||0, 0, 1); },
    getEnergy: () => energy
  };
})();
