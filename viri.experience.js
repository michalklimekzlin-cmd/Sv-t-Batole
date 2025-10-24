// viri.experience.js – jednoduchý XP engine
export class ViriXP{
  constructor(){
    this.gain = { batolesvet:0, glyph:0, ai:0, pedrovci:0 };
    this.mood = { calm:0.5, anxiety:0.1 };
    this.decay = 0.96;   // pomalé vyhasínání vlivů
  }
  add({team,value}){ if(this.gain[team]!=null) this.gain[team]+=Math.max(0,value||0); }
  tick(){
    // lehký rozpad vlivů
    for(const k in this.gain){ this.gain[k]*=this.decay; }
    // nálada lehce kopíruje rozdíl vlivů
    const varSum = Object.values(this.gain).reduce((a,b)=>a+b,0)+1e-9;
    this.mood.calm     = clamp(0.2 + this.gain.batolesvet/ (varSum) , 0,1);
    this.mood.anxiety  = clamp(this.gain.ai*0.15 + this.gain.glyph*0.1, 0,1);
  }
  getState(){
    // normalizovaný mix do (0..1)
    const s = this.gain;
    const sum = Object.values(s).reduce((a,b)=>a+b,0)+1e-9;
    const mix = {
      batolesvet: clamp(s.batolesvet/sum,0,1),
      glyph:      clamp(s.glyph/sum,0,1),
      ai:         clamp(s.ai/sum,0,1),
      pedrovci:   clamp(s.pedrovci/sum,0,1),
    };
    const label = topKey(mix);
    return { mix, label, mood:this.mood };
  }
}
function clamp(x,a,b){ return Math.max(a, Math.min(b,x)); }
function topKey(obj){ let m=-1,k=''; for(const t in obj){ if(obj[t]>m){m=obj[t];k=t;} } return k; }