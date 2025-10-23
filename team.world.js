// team.world.js — Tým 4: Batolesvět (spojení života)
export function awakenWorld() {
  let pulseCount = 0;
  window.addEventListener('team:pulse', e => {
    pulseCount++;
    if (pulseCount % 12 === 0) {
      window.dispatchEvent(new CustomEvent('team:pulse', {
        detail: { team: 'world', strength: 0.2 }
      }));
      console.log('🌍 Batolesvět dýchá společně');
    }
  });
}
awakenWorld();