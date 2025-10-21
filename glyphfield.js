// Hidden field for AI (no render by default)
export class GlyphField{
  constructor(glview){ this.view=glview; this.gl=glview.gl; this.time=0; this.enabled=false; }
  renderParticles(){ /* intentionally hidden */ }
}
