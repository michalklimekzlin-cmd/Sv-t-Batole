export class SignalBus{
  constructor(){ this.listeners = new Map(); }
  on(type, fn){ if(!this.listeners.has(type)) this.listeners.set(type,new Set()); this.listeners.get(type).add(fn); return ()=>this.listeners.get(type).delete(fn); }
  emit(type, data){ const set=this.listeners.get(type); if(!set) return; for(const fn of set) try{ fn(data); }catch(e){ console.error(e); } }
}
