// life.human.js — Tým 1: Člověk (Piko)
import { createLife } from './life.core.js';
const life = createLife({
  id:'human', label:'Piko', color:'#7dd3fc', corner:'bl',
  inflow:(S)=>0.2,              // minimální vlastní zdroj
  think:(S,dt,el)=>{
    // každé ~3 s pošli pulz do světa
    if (Math.floor(S.t*2)%6===0) {
      window.MK?.pulse?.('human', 0.01);
      window.dispatchEvent(new CustomEvent('team:pulse',{detail:{team:'human',strength:0.01}}));
    }
  }
});
export default life;
