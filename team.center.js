// team.center.js — Srdce světa (spojení všech týmů)
import { Soul } from './vafi.soul.js';

let influence = { human: 0, ai: 0, world: 0, glyph: 0 };
let pulse = 0;

export function updateCenter(team, power=1){
  influence[team] = Math.min(1, influence[team] + power*0.1);
  const balance = Object.values(influence).reduce((a,b)=>a+b,0)/4;
  pulse = balance;

  const el = document.getElementById('centerCore') || createCore();
  el.style.transform = `translate(-50%,-50%) scale(${1+balance*0.4})`;
  el.style.filter = `drop-shadow(0 0 ${10+balance*40}px rgba(100,255,180,0.5))`;
  if (balance > 0.99) el.textContent = '⚡ PORTÁL OŽIL ⚡';
}

function createCore(){
  const el = document.createElement('div');
  el.id = 'centerCore';
  Object.assign(el.style,{
    position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
    font:'bold 22px system-ui', color:'#aff',
    textShadow:'0 0 12px #0f8', transition:'all .3s ease'
  });
  document.body.appendChild(el);
  return el;
}
