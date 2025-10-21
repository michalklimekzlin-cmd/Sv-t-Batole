import { GlyphText } from './glyph_text.js';
import { GlyphAtlas } from './glyph_atlas.js';

export class Orbit{
  constructor(glview){
    this.view=glview; this.gl=glview.gl;
    this.atlas=new GlyphAtlas(this.gl,{ size:512, cell:32, font:'22px monospace' });
    this.text=new GlyphText(glview, this.atlas);
    this.time=0; this.center={x:0,y:0}; this.radius=50;
    this.glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:+-*/@#☺";
    this.instances=[]; this._buildRing();
  }
  _uv(ch){ return this.atlas.uvForChar(ch.charCodeAt(0)); }
  _buildRing(){
    const N=48; this.instances=[];
    for(let i=0;i<N;i++){
      const a=(i/N)*Math.PI*2;
      const ch=this.glyphs[i % this.glyphs.length];
      const uv=this._uv(ch);
      this.instances.push({ x:0,y:0, scale:18, uv, alpha:0.0, angle:a });
    }
  }
  setCenterPx(x,y){ this.center.x=x; this.center.y=y; }
  update(dt){
    this.time+=dt;
    const breathe=(Math.sin(this.time*2.0)+1.0)*0.5;
    for(const it of this.instances){
      const r=this.radius + Math.sin(this.time*1.7 + it.angle*3.0)*3.0;
      const ang=it.angle + this.time*0.25;
      it.x=this.center.x + Math.cos(ang)*r;
      it.y=this.center.y + Math.sin(ang)*r;
      it.alpha=0.35 + 0.4*breathe;
    }
    this.text.setInstances(this.instances);
  }
  render(){ this.text.draw(); }
}
