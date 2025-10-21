export class Matter{
  constructor(ecs, bus){
    this.ecs = ecs;
    this.bus = bus;
    this.iskra = 0;
    this.quantaPerBrick = 6;
    this.lastPos = {x:0,y:0};
    bus.on('impulse', ({pos})=>{
      this.iskra += 1;
      this.lastPos = pos;
      this._updateHud();
      if(this.iskra >= this.quantaPerBrick){
        this.iskra -= this.quantaPerBrick;
        this.spawnBrick(pos);
        this._updateHud();
      }
    });
  }
  _updateHud(){
    const el = document.getElementById('iskra');
    if(el) el.textContent = String(this.iskra);
  }
  spawnBrick(pos){
    const id = this.ecs.create();
    this.ecs.add(id, { block:true, x:pos.x, y:pos.y, size:10 });
  }
  render(glview){
    const gl = glview.gl;
    // draw all blocks as small squares
    for(const [id, c] of this.ecs.entities.entries()){
      if(!c.block) continue;
      const x = (c.x*0.5 + 0.5) * glview.canvas.width;
      const y = (c.y*-0.5 + 0.5) * glview.canvas.height;
      const s = c.size;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x-s, y-s, s*2, s*2);
      gl.clearColor(0.6,0.85,1.0,1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0.04,0.05,0.08,1);
    }
  }
}
