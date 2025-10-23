// team.human.js — Tým 1: Lidé (Piko)
export function startHumanPulse() {
  let t = 0;
  function loop() {
    t += 0.1;
    // jemný pulz člověka každé ~3 sekundy
    if (Math.floor(t * 2) % 6 === 0) {
      window.dispatchEvent(new CustomEvent('team:pulse', {
        detail: { team: 'human', strength: 0.01 }
      }));
    }
    requestAnimationFrame(loop);
  }
  loop();
}
startHumanPulse();