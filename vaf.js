// vaf.js — Vivere atque frui (VAF): puls světa
export const VAF = {
  started:false, t0:0, t:0, bpm:60, _beatT:0,
  _frameSubs:[], _beatSubs:[], _raf:null,

  start(){
    if(this.started) return;
    this.started = true; this.t0 = performance.now();

    const loop = (now)=>{
      this.t = (now - this.t0)/1000;
      const secPerBeat = 60/this.bpm;
      this._beatT += 1/60;

      const energy = 0.5 + 0.5*Math.sin((2*Math.PI*this._beatT)/secPerBeat);
      const root = document.documentElement;
      root.style.setProperty('--vaf-time', this.t.toFixed(3));
      root.style.setProperty('--vaf-energy', energy.toFixed(3));
      root.style.setProperty('--vaf-bpm', this.bpm.toFixed(2));

      if (this._beatT >= secPerBeat){
        this._beatT -= secPerBeat;
        for (const fn of this._beatSubs) try{ fn({t:this.t,bpm:this.bpm}); }catch{}
      }
      for (const fn of this._frameSubs) try{ fn({t:this.t, energy}); }catch{}
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },
  stop(){ if(!this.started) return; cancelAnimationFrame(this._raf); this._raf=null; this.started=false; },

  onFrame(fn){ this._frameSubs.push(fn); },
  onBeat(fn){ this._beatSubs.push(fn); },

  emit(kind){
    // drobné rozkmitání BPM po akci
    const before = this.bpm; const target = Math.min(180, before+2);
    this.bpm = target;
    setTimeout(()=>{
      const step=()=>{ const d=this.bpm-before; if(Math.abs(d)<0.1){ this.bpm=before; return; }
        this.bpm -= d*0.25; requestAnimationFrame(step);
      }; requestAnimationFrame(step);
    }, 900);
  },

  attachSensors(){
    window.addEventListener('pointerdown', ()=>this.emit('touch'), {passive:true});
    window.addEventListener('keydown', ()=>this.emit('word'), {passive:true});
  }
};