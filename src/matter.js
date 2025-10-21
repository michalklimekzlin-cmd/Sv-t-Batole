export class Matter{
  constructor(ecs, bus){
    this.ecs=ecs; this.bus=bus; this.iskra=0; this.quantaPerBrick=6; this.lastPos={x:0,y:0};
    bus.on('impulse',({pos})=>{ this.iskra+=1; this.lastPos=pos; this._updateHud(); if(this.iskra>=this.quantaPerBrick){ this.iskra-=this.quantaPerBrick; this.spawnBrick(pos); this._updateHud(); } });
  }
  _updateHud(){ const el=document.getElementById('iskra'); if(el) el.textContent=String(this.iskra); }
  spawnBrick(pos){ const id=this.ecs.create(); this.ecs.add(id,{ block:true, x:pos.x, y:pos.y, size:10 }); }
  render(glview){ /* replaced by glyph rectangles in app.js */ }
}
