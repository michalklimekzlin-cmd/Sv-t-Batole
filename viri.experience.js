// viri.experience.js — XP → mix → popis stavu
export class ViriXP {
  constructor(){
    this.xp = { batolesvet:0, glyph:0, ai:0, pedrovci:0 };
    this.decay = 0.998; // vyprchávání
    this.last = performance.now();
    this._sm  = null;
  }
  tick(){
    const now = performance.now();
    const dt = Math.min(1, (now - this.last) / 1000);
    this.last = now;
    for (const k in this.xp) this.xp[k] *= Math.pow(this.decay, dt*30);
  }
  add({team, value=1}){
    if (!this.xp.hasOwnProperty(team)) return;
    this.xp[team] += Math.max(0, value);
  }
  getMix(){
    const v=this.xp, arr=Object.values(v), max=Math.max(1, ...arr);
    const mix = {
      batolesvet: Math.min(1, v.batolesvet/max),
      glyph:      Math.min(1, v.glyph     /max),
      ai:         Math.min(1, v.ai        /max),
      pedrovci:   Math.min(1, v.pedrovci  /max),
    };
    const s=0.08; if(!this._sm) this._sm={...mix};
    for(const k in mix) this._sm[k] = this._sm[k] + (mix[k]-this._sm[k])*s;
    return {...this._sm};
  }
  getState(){
    const m = this.getMix();
    const order = Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k])=>k);
    const top2 = order.slice(0,2).join('+');
    const mood =
      m.pedrovci > .6 ? 'warm' :
      m.ai       > .6 ? 'sharp' :
      m.glyph    > .6 ? 'talkative' :
      m.batolesvet>.6 ? 'curious' : 'calm';
    return { mix:m, label:top2, mood };
  }
}