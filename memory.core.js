export const VAFI = (globalThis.VAFI ||= {});
const LS_KEY = "VIRI_MEMORY_V1";

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { return {}; }
}
function save(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
  catch {}
}

const mem = (VAFI.memory = {
  data: load(),
  save() { save(this.data); },
  push(kind, payload) {
    const t = new Date().toISOString();
    const item = { t, kind, ...payload };
    (this.data.log ||= []).push(item);
    if (this.data.log.length > 200) this.data.log.splice(0, this.data.log.length - 200);
    this.save();
    return item;
  },
  read(kind=null) {
    const L = this.data.log || [];
    return kind ? L.filter(x => x.kind === kind) : L;
  }
});