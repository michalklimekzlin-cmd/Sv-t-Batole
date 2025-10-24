// Správa zkušeností Viriho (mix, label, nálada)
export class ViriXP{
  constructor(){
    this.mix = { batolesvet:0.25, glyph:0.25, ai:0.25, pedrovci:0.25 };
    this.mood = { calm:0.5, anxiety:0.2 };
    this._t = 0;
  }
  add({team,value=0,weight=1}){
    if(!this.mix.hasOwnProperty(team)) return;
    const v = Math.max(0, Math.min(1, value * weight * 0.5));
    this.mix[team] = Math.max(0, Math.min(1, this.mix[team] + v));
  }
  tick(){
    this._t += 1/60;
    for(const k in this.mix){
      this.mix[k] = Math.max(0, this.mix[k] - 0.005);
    }
    const dom = Object.entries(this.mix).sort((a,b)=>b[1]-a[1])[0][0];
    this.label =
      dom==='batolesvet' ? 'puls paměti' :
      dom==='glyph'      ? 'znaky a řeč' :
      dom==='ai'         ? 'analýza' :
      'emoce';
    this.mood.calm    = clamp(0.4 + this.mix.pedrovci*0.6);
    this.mood.anxiety = clamp(0.3 - this.mix.pedrovci*0.3);
  }
  getState(){ return { mix:{...this.mix}, label:this.label, mood:{...this.mood} }; }
}
const clamp=(v)=>Math.max(0,Math.min(1,v));