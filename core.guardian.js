// core.guardian.js  v1  — Viri Guardian
(() => {
  const KEY = 'VIRI_MEMORY_V1';

  class ViriGuardian {
    constructor() {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      this.birth = saved.birth || Date.now();
      this.energy = saved.energy ?? 1.0;
      this.experience = saved.experience ?? 0;
      this.notes = saved.notes ?? [];  // krátké reflexe
      this.awake = true;
      this.save();
      // Reakce na „schizo“ události
      document.addEventListener('schizo:voice', e => this.onVoice(e.detail));
      document.addEventListener('schizo:target', e => this.onTarget(e.detail));
      document.addEventListener('state:changed', e => this.homeostasis(e.detail));
    }

    save() {
      localStorage.setItem(KEY, JSON.stringify({
        birth: this.birth, energy: this.energy,
        experience: this.experience, notes: this.notes
      }));
    }

    say(msg){ console.log(`Viri: ${msg}`); }

    onVoice(line){
      // jemně směruje a učí se, co kdy fungovalo
      this.notes.push({ t: Date.now(), type:'voice', line });
      if (this.notes.length > 128) this.notes.shift();
      this.experience += 0.2; this.energy = Math.max(0, this.energy-0.01);
      this.save();
    }

    onTarget(target){
      this.notes.push({ t: Date.now(), type:'vision', target });
      this.experience += 0.3; this.save();
    }

    homeostasis(S){
      // vyrovnávání – když je úzkost velká, šeptne uklidnění
      if (S.anxiety + S.stress > 1.4 && Math.random() < 0.05) {
        this.say("Zpomal, nadechni se. Všechno stihneme.");
      }
      // drobné samoregulační úpravy
      if (S.energy < 0.4) this.energy = Math.max(0, this.energy - 0.02);
      if (S.mood < -0.5 && Math.random()<0.02) this.say("Najdeme světlo. Jeden malý krok.");
      // občasná reflexe do paměti (bez vyzrazení snů)
      if (Math.random() < 0.01) {
        this.notes.push({ t: Date.now(), type:'reflect', mood:S.mood, a:S.anxiety, s:S.stress });
        if (this.notes.length > 128) this.notes.shift();
        this.save();
      }
    }
  }

  window.Viri = new ViriGuardian();
})();
