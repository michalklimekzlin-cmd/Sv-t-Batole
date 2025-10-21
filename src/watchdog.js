function fnv1a(str){ let h=0x811c9dc5|0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193);} return (h>>>0); }
export class Watchdog{
  constructor(ecs, bus){ this.ecs=ecs; this.bus=bus; this.lastHash=0; this.snapshot=null; this.timer=0; bus.on('panic',()=>this.rollback()); }
  computeHash(){ const items=[]; for(const [id,comps] of this.ecs.entities.entries()){ items.push(id+':'+JSON.stringify(comps)); } return fnv1a(items.sort().join('|')); }
  save(){ this.snapshot=JSON.stringify([...this.ecs.entities.entries()]); this.lastHash=this.computeHash(); }
  rollback(){ if(!this.snapshot) return; this.ecs.entities=new Map(JSON.parse(this.snapshot)); }
  update(dt){ this.timer+=dt; if(this.timer>=1.0){ this.timer=0; const h=this.computeHash(); if(this.lastHash && h!==this.lastHash){ this.rollback(); } else { this.save(); } } }
}
