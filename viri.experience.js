// viri.experience.js — jednoduché „XP“ týmů => mix + slovní štítek
export class ViriXP {
  constructor(){
    this.v = { batolesvet:0.25, glyph:0.25, ai:0.25, pedrovci:0.25 };
    this.mood = { calm: 0.5, anxiety: 0.2 };
    this.label = 'zrození';
  }

  add({team, value}) {
    if(!this.v.hasOwnProperty(team)) return;
    this.v[team] += value;
  }

  tick(){
    // jemný rozpad a ořez
    for (const k in this.v) {
      this.v[k] = Math.max(0, this.v[k] * 0.985);
    }
    // normalizace do 0..1
    const sum = Object.values(this.v).reduce((a,b)=>a+b,0) || 1;
    for (const k in this.v) this.v[k] = this.v[k]/sum;

    // nálady lehce vyvaž
    this.mood.calm     = clamp(this.mood.calm*0.99 + 0.01);
    this.mood.anxiety  = clamp(this.mood.anxiety*0.99);

    // štítek podle dominanty
    const top = Object.entries(this.v).sort((a,b)=>b[1]-a[1])[0][0];
    this.label = ({
      batolesvet: 'zrod',
      glyph:      'znaky',
      ai:         'analýza',
      pedrovci:   'cit',
    })[top] || 'rovnováha';
  }

  getState(){
    return { mix:{...this.v}, label:this.label, mood:{...this.mood} };
  }
}

function clamp(v){ return Math.max(0, Math.min(1, v)); }