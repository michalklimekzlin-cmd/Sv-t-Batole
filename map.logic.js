// map.logic.js — do budoucna minimapa / tipy; zatím jen jemná aura textu
export function initMap({ canvas, inventory }){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // jemný caption pod koulí (neruší render)
  const msg = `• ${inventory.label} • ${inventory.topTeam.name}`;
  ctx.save();
  ctx.font = '600 14px system-ui,-apple-system,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(160,240,235,.7)';
  ctx.shadowColor = 'rgba(0,255,230,.35)';
  ctx.shadowBlur = 8;
  ctx.fillText(msg, w/2, h*0.62);
  ctx.restore();
}