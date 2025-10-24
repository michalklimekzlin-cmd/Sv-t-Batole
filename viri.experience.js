// Správa zkušeností Viriho (mix, label, nálada)
export class ViriXP {
  constructor(){
    this.mix = { batolesvet:0, glyph:0, ai:0, pedrovci:0 };
    this.mood = { calm:0.5, anxiety:0.2 };
    this.t = 0;
  }

  add({team, value=0, weight=1}){
    if(!this.mix.hasOwnProperty(team)) return;
    const v = Math.max(0, Math.min(1, value * weight * 0.5));
    this.mix[team] = Math.max(0, Math.min(1, this.mix[team] + v));
  }

  // drobné vyprchávání + label podle dominantního týmu
  tick(){
    this.t += 1/60;
    for(const k in this.mix){
      this.mix[k] = Math.max(0, this.mix[k] - 0.005); // decay
    }
    const dom = Object.entries(this.mix).sort((a,b)=>b[1]-a[1])[0][0];
    this.label =
      dom==='batolesvet' ? 'puls paměti' :
      dom==='glyph'      ? 'znaky a řeč' :
      dom==='ai'         ? 'analýza' :
      'emoce';

    // nálada – lehká vazba na pedrovce (emoce)
    this.mood.calm    = Math.max(0, Math.min(1, 0.4 + this.mix.pedrovci*0.6));
    this.mood.anxiety = Math.max(0, Math.min(1, 0.3 - this.mix.pedrovci*0.3));
  }

  getState(){ return { mix:{...this.mix}, label:this.label, mood:{...this.mood} }; }
}