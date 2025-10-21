export class ECS{
  constructor(){
    this.entities = new Map();
    this.systems = [];
    this._id = 1;
  }
  create(){
    const id = this._id++;
    this.entities.set(id, {});
    return id;
  }
  add(id, comp){
    Object.assign(this.entities.get(id), comp);
  }
  get(id){ return this.entities.get(id); }
  update(dt){
    for(const sys of this.systems) sys(dt, this);
  }
  addSystem(fn){ this.systems.push(fn); }
}
