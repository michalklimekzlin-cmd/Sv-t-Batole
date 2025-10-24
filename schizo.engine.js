// schizo.engine.js  v1
// Překládá "schizo" osy do mechanik: waypointy, šeptání, modifikace obtížnosti
(() => {
  const RND = (a=0,b=1)=>a+Math.random()*(b-a);

  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }

  const VOICE_LINES_OK = [
    "Zkus krok vpravo.", "Tady to půjde.", "Dýchej. Máš to.",
    "Je to bezpečné.", "Všímej si světla.", "Koukej na rytmus."
  ];
  const VOICE_LINES_ALERT = [
    "Zpomal.", "Tohle smrdí.", "Radši obejdi.", "Dva kroky zpět.",
    "Vnímej stín.", "Nesahej na to teď."
  ];

  // generátor „obrazu“ (halucinace) – cíl na mapě
  function spawnHallucinationTarget() {
    // svět 0..1,0..1 – engine vyšší vrstvy si to promítne do plátna
    return { x: RND(0.15,0.85), y: RND(0.15,0.85), strength: RND(0.4,0.9) };
  }

  function step() {
    const S = window.StateCore?.get(); if (!S) return;

    // přirozené vlnění realityBlend dle úzkosti/stressu
    const rb = Math.min(1, Math.max(0, 0.3*S.anxiety + 0.2*S.stress + 0.1*Math.sin(S.tick/7)));
    // náhodné „fluktuace hlasů“ a cílů
    let voices = S.voices.level, halluc = S.hallucination.level;

    // disciplína tlumí výkyvy, energie je palivo
    const damp = 1 - Math.min(0.8, S.discipline*0.6);
    voices = Math.max(0, Math.min(1, voices*damp + (Math.random()*0.15 - 0.03)));
    halluc = Math.max(0, Math.min(1, halluc*damp + (Math.random()*0.15 - 0.02)));

    // občas nový „obraz“ – cíl
    if (Math.random() < 0.02 + halluc*0.05) {
      const target = spawnHallucinationTarget();
      window.StateCore.merge('hallucination', { target, level: Math.min(1, halluc+0.2) });
      document.dispatchEvent(new CustomEvent('schizo:target', { detail: target }));
    } else {
      window.StateCore.merge('hallucination', { level: halluc });
    }

    // šeptání – bezpečné vs. varující
    if (Math.random() < 0.03 + voices*0.07) {
      const safe = (S.anxiety + S.stress) < 0.9;
      const line = safe ? pick(VOICE_LINES_OK) : pick(VOICE_LINES_ALERT);
      window.StateCore.merge('voices', { level: voices, last: line });
      document.dispatchEvent(new CustomEvent('schizo:voice', { detail: line }));
    } else {
      window.StateCore.merge('voices', { level: voices });
    }

    // zapis realityBlend
    window.StateCore.set({ realityBlend: rb });
  }

  setInterval(step, 800);
  window.SchizoEngine = { step };
})();
