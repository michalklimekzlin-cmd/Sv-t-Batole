export class ViriXP {
  constructor(){ this.state={batolesvet:0,glyph:0,ai:0,pedrovci:0}; }
  add({team,value}){ if(this.state[team]!=null) this.state[team]+=value||0; }
  tick(){
    for(const k in this.state)
      this.state[k]*=0.98; // postupné vyprchání vlivu
  }
  getMix(){
    const total=Object.values(this.state).reduce((a,b)=>a+b,0.0001);
    const norm={};
    for(const k in this.state) norm[k]=this.state[k]/total;
    return norm;
  }
}