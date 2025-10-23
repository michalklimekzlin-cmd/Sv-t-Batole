// miza.hud.js — zobrazení Mízy v HUD (pravá strana), automaticky vytvoří badge
import { onMizaUpdate, getMiza } from './miza.core.js';

function ensureBadge(){
  let host = document.getElementById('hud') || document.body;
  let b = document.getElementById('mizaBadge');
  if (!b){
    b = document.createElement('span');
    b.id = 'mizaBadge';
    b.style.cssText = `
      margin-left:.6rem; padding:.2rem .55rem; border:1px solid rgba(255,255,255,.25);
      border-radius:.6rem; font:600 12px/1 system-ui,-apple-system,Segoe UI,Roboto;
      opacity:.9; display:inline-flex; align-items:center; gap:.35rem;
      background:rgba(16,28,20,.66); backdrop-filter:saturate(120%) blur(4px);
    `;
    // vlož do HUD pokud existuje
    const hud = document.getElementById('hud');
    (hud||host).appendChild(b);
  }
  return b;
}

function hueFor(v){ // 0..1 => zelený odstín
  return 120 + Math.round(60 * v);
}

const badge = ensureBadge();
function render(val){
  const p = Math.max(0, Math.min(100, Math.round(val*100)));
  badge.textContent = `Míza ${p}%`;
  badge.style.borderColor = 'rgba(200,255,220,.35)';
  badge.style.color = `hsl(${hueFor(val)} 90% 78%)`;
  badge.style.boxShadow = `0 0 .6rem hsla(${hueFor(val)} 90% 72% / .25) inset`;
}
render(getMiza());

onMizaUpdate(({value})=>render(value));
