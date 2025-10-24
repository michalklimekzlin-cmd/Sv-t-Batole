// viri.guardian.js — jednoduché „živé jádro“ Viri
(function () {
  class ViriGuardian {
    constructor() {
      this.birth = Date.now();
      this.state = {
        mood: "calm",
        energy: 1.0,
        notes: []
      };
      console.log("🟢 Viri boot:", new Date(this.birth).toISOString());
    }

    // ping pro rychlý test
    ping(msg = "ahoj") {
      const out = `Viri: ${msg} • mood=${this.state.mood} • E=${this.state.energy.toFixed(2)}`;
      console.log(out);
      return out;
    }

    // jemný „pulz“ – může se volat z mapy/ticku
    pulse(world = {}) {
      // drobná obnova energie
      this.state.energy = Math.min(1, this.state.energy + 0.001);
      if (Math.random() < 0.002) this.reflect(world);
    }

    // občasná reflexe – prozatím jen log + zápis do paměti
    reflect(world = {}) {
      const thought = {
        t: Date.now(),
        feel: this.state.mood,
        world: { ...world, rnd: Math.random().toFixed(3) }
      };
      this.state.notes.push(thought);
      try {
        localStorage.setItem("VIRI_MEMORY", JSON.stringify(this.state.notes.slice(-100)));
      } catch {}
      console.log("🧠 Viri reflect:", thought);
    }

    // pomocná změna nálady
    setMood(m) {
      this.state.mood = m;
      return this.state.mood;
    }
  }

  // vystavíme do window, ať jde volat z konzole/ostatních modulů
  const viri = new ViriGuardian();
  window.Viri = viri;
  document.dispatchEvent(new CustomEvent("viri:ready", { detail: { when: viri.birth } }));
})();