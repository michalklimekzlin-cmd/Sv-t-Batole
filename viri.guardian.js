// viri.guardian.js — živé jádro
(function(){
  class ViriGuardian {
    constructor(){
      this.birth = Date.now();
      this.state = { mood: "calm", energy: 1.0, notes: [] };
      console.log("🟢 Viri boot:", new Date(this.birth).toLocaleTimeString());
      this.loop();
    }

    ping(msg="ahoj"){
      const out = `Viri: ${msg} • mood=${this.state.mood}`;
      console.log(out);
      return out;
    }

    loop(){
      setInterval(()=>{
        this.state.energy = Math.max(0, Math.min(1, this.state.energy - 0.001 + Math.random()*0.002));
      }, 100);
    }
  }

  window.Viri = new ViriGuardian();

  // reaguje na událost z tlačítka
  window.addEventListener("viri:ping", ()=>{
    const out = window.Viri.ping("ping!");
    console.log(out);
  });
})();