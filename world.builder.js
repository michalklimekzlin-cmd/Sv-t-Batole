import { VAFI } from "./memory.core.js";
export function getBlueprint(){
  const dreams = VAFI.memory.data.dreams || [];
  const last = dreams.slice(-20);
  return {
    title: "Vivere atque frui – Seed",
    version: 1,
    mood: last.at(-1)?.mood || "calm",
    energyAvg: +(last.reduce((a,b)=>a+b.energy,0)/(last.length||1)).toFixed(2),
    symbols: (VAFI.memory.data.log||[]).filter(x=>x.kind==="learn" && x.channel==="glyph").map(x=>x.signal).slice(-20),
    people:  (VAFI.memory.data.log||[]).filter(x=>x.kind==="learn" && x.channel==="pedrovci").slice(-20),
    aiNotes: (VAFI.memory.data.log||[]).filter(x=>x.kind==="learn" && x.channel==="ai").map(x=>x.note).slice(-10)
  };
}
globalThis.VAFI ||= {}; globalThis.VAFI.blueprint = { getBlueprint };