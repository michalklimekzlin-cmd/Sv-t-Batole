// vafi.soul.js (lite)
// Duše – drží náladu/energii a posílá změny do světa.
import { Flow }   from './vivere.flow.js';
import { Memory } from './vafi.memory.js';

const clamp = (x,a=0,b=1)=>Math.min(b,Math.max(a,x));
let state = Memory.get(); // {stats:{mood,energy},...}
let t = 0;

function emit(){
  const detail = { mood: state.stats.mood, energy: state.stats.energy };
  document.dispatchEvent(new CustomEvent('vafi:state', { detail }));
}

Flow.onTick((dt, now)=>{
  t += dt;
  // jemná vlna nálady (0..1)
  state.stats.mood   = clamp(0.5 + 0.5*Math.sin(t*0.25));
  // energie mírně regeneruje
  state.stats.energy = clamp(state.stats.energy + 0.005*dt*60);
  Memory.set(state);
  emit();
});

export const Soul = {
  get(){ return { mood: state.stats.mood, energy: state.stats.energy }; },
  nudgeEnergy(d){ state.stats.energy = clamp(state.stats.energy + d); Memory.set(state); emit(); }
};