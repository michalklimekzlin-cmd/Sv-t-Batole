// team.layout.js — rozložení badge/indikátorů týmů do rohů

function place(id, corner) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.position = 'fixed';
  el.style.zIndex = '20';
  el.style.pointerEvents = 'none';   // ať nepřekáží dotykům
  el.style.filter = 'drop-shadow(0 0 .6rem rgba(0,0,0,.6))';

  // default odsazení pro „safe area“
  const padX = 14;  // px
  const padY = 10;

  switch (corner) {
    case 'tl': // top-left
      el.style.left = padX + 'px';
      el.style.top  = padY + 'px';
      break;
    case 'tr': // top-right
      el.style.right = padX + 'px';
      el.style.top   = padY + 'px';
      break;
    case 'bl': // bottom-left
      el.style.left  = padX + 'px';
      el.style.bottom= padY + 'px';
      break;
    case 'br': // bottom-right
      el.style.right = padX + 'px';
      el.style.bottom= padY + 'px';
      break;
  }
}

export function initTeamLayout(){
  // ↙︎ člověk, ↘︎ glyph, ↗︎ AI, ↖︎ svět – klidně kdykoli prohodíme
  place('badgeHuman', 'bl');
  place('badgeGlyph', 'br');
  place('badgeAI',    'tr');
  place('badgeWorld', 'tl');
}

window.addEventListener('resize', ()=>initTeamLayout());
document.addEventListener('DOMContentLoaded', ()=>initTeamLayout());
