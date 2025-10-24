// viri.guardian.js — jednoduché „živé jádro“
(function () {
  class ViriGuardian {
    constructor(){
      this.birth = Date.now();
      this.state = { mood: 'calm', energy: 1.0, notes: [] };
      console.log('🟢 Viri boot:', new Date(this.birth).toISOString());
    }

    ping(msg='ahoj'){
      const out = `Viri: ${msg} • mood=${this.state.mood} • energy=${this.state.energy.toFixed(2)}`;
      console.log(out);
      return out;
    }

    pulse(world={}){
      this.state.energy = Math.min(1, this.state.energy + 0.001);
      if (Math.random() < 0.002) this.reflect(world);
    }

    reflect(world={}){
      const thought = {
        t: Date.now(),
        feel: this.state.mood,
        world: { ...world, rnd: Math.random() }
      };
      this.state.notes.push(thought);
      try { localStorage.setItem('VIRI_MEMORY', JSON.stringify(this.state.notes.slice(-100))); }
      catch(e){ /* ignore quota */ }
      console.log('💭 Viri šepotá:', thought);
    }
  }

  // export do window
  window.Viri = new ViriGuardian();

  // lehký tik (můžeš vypnout)
  setInterval(()=> window.Viri.pulse({tick:true}), 1000);
})();