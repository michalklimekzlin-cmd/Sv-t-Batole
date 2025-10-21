export class ECS{
  constructor(){ this.entities = new Map(); this._id=1; this.systems=[]; }
  create(){ const id=this._id++; this.entities.set(id,{}); return id; }
  add(id, comp){ Object.assign(this.entities.get(id), comp); }
  get(id){ return this.entities.get(id); }
  addSystem(fn){ this.systems.push(fn); }
  update(dt){ for(const s of this.systems) s(dt, this); }
}
