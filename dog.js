export class Dog{
  constructor(ecs, bus, glyph){
    this.ecs = ecs;
    this.bus = bus;
    this.glyph = glyph;
    this.pos = {x:0, y:0};
    this.target = {x:0, y:0};
    this.speed = 0.6; // units per second in NDC
    this.unsubscribe = bus.on('impulse', (e)=>{
      this.target = e.pos;
      this._wagTimer = 0.35;
    });
  }
  spawn(p){ this.pos = {x:p.x, y:p.y}; this.target = {...this.pos}; }
  update(dt){
    const dx = this.target.x - this.pos.x;
    const dy = this.target.y - this.pos.y;
    const d = Math.hypot(dx, dy);
    const step = Math.min(d, this.speed * dt);
    if(d > 1e-4){
      this.pos.x += dx/d * step;
      this.pos.y += dy/d * step;
    }
    if(this._wagTimer>0) this._wagTimer -= dt;
  }
  render(){
    const gl = this.glyph.gl;
    // draw simple cross as stand-in sprite
    gl.enable(gl.SCISSOR_TEST);
    const x = (this.pos.x*0.5 + 0.5) * this.glyph.view.canvas.width;
    const y = (this.pos.y*-0.5 + 0.5) * this.glyph.view.canvas.height;
    const s = 8 + (this._wagTimer>0 ? 4 : 0);
    gl.scissor(x-s, y-1, s*2, 2); gl.clearColor(0.9,0.95,1,1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.scissor(x-1, y-s, 2, s*2); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0.04,0.05,0.08,1); // restore
  }
}
