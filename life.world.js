// life.world.js — Tým 4: World (Batolesvět core)
import { createLife } from './life.core.js';
let getMiza=()=>0.6; try{({getMiza}=await import(`./miza.core.js?v=${window.V||'dev'}`));}catch{}
const life = createLife({
  id:'world', label:'Batolesvět', color:'#34d399', corner:'tl',
  inflow:(S)=>0.3 + 0.7*(getMiza?getMiza():0.6), // živí se Mízou
  think:(S,dt,el)=>{
    // když svět cítí souhru, pošle sjednocující puls
    if (Math.random()<0.002) window.MK?.pulse?.('world', 0.02);
  }
});
export default life;
