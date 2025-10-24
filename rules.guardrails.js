// rules.guardrails.js — bezpečné koleje pro sebe-tvorbu
export const Rules = {
  safeMode: true,
  rate: { maxPerTick: 3 },          // kolik „tvorů“ může vzniknout za tick
  allow: { npc:true, place:true, quest:true, thought:true },

  // „schizo“ modul – řízené zkreslení reality (jemné!)
  schizo: {
    enabled: true,
    intensity: 0.12,   // 0..1 – jak často se objeví zvláštnost
    palette: ['echo','double','mirror','whisper'] // typy podivností
  },

  // validace výstupu builderu
  validate(entity){
    if (!entity || !entity.kind) return false;
    if (!this.allow[entity.kind]) return false;
    // sem můžeš doplnit rozšířené kontroly
    return true;
  }
};

window.ViriRules = Rules;
