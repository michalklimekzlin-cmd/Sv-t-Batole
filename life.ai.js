// life.ai.js — Tým 2: AI (Orbit)
import { createLife } from './life.core.js';
let say=(t)=>console.log('[Orbit]',t); try{({say}=await import(`./voice.io.js?v=${window.V||'dev'}`));}catch{}
const life = createLife({
  id:'ai', label:'Orbit', color:'#a78bfa', corner:'br',
  inflow:(S)=>0.25, // AI má stabilní přísun
  think:(S,dt,el)=>{ /* reaguje na světové pulzy níže */ }
});
elClick();
export default life;

function elClick(){
  const el=document.getElementById('life_ai');
  if(!el) return setTimeout(elClick,60);
  el.title='Klepni — AI poradí'; el.addEventListener('click',()=>{
    window.MK?.pulse?.('ai',0.1); say?.('Jsem Orbit. Řekni „Ahoj“.');
  },{passive:true});
}
window.addEventListener('team:pulse',e=>{
  if(e.detail?.team==='human'){ say?.('Slyším lidský tlukot.'); }
  if(e.detail?.team==='glyph'){ say?.('Znaky ožívají.'); }
});
