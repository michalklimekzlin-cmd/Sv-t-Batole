// life.glyph.js — Tým 3: Glyph (znaky)
import { createLife } from './life.core.js';
const life = createLife({
  id:'glyph', label:'Glyph', color:'#9AE6FF', corner:'tr',
  inflow:(S)=>0.18,
  think:(S,dt,el)=>{
    // drobný puls každé ~2 s
    if ((S.t%2)<0.02) window.MK?.pulse?.('glyph', 0.015);
    el.textContent = 'Glyph {*(•.)•.)//} • '+Math.round(S.energy*100)+'%';
  }
});
export default life;
