// vafi.memory.js  — robustní lokální paměť (telefon-first)
const DB_NAME = 'vafi.db';
const STORE = 'state';
const KEY = 'soul';
const LS_KEY = 'VAFI_DATA_V2';  // zvedni pokud měníš strukturu
const SAVE_DEBOUNCE_MS = 400;

let idb;
let saveTimer = null;

function openDB(){
  return new Promise((resolve) => {
    if (!('indexedDB' in self)) return resolve(null);
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbGet(db){
  return new Promise((resolve) => {
    try{
      const tx = db.transaction(STORE, 'readonly');
      const st = tx.objectStore(STORE);
      const r = st.get(KEY);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    }catch{ resolve(null); }
  });
}

async function idbSet(db, value){
  return new Promise((resolve) => {
    try{
      const tx = db.transaction(STORE, 'readwrite');
      const st = tx.objectStore(STORE);
      const r = st.put(value, KEY);
      r.onsuccess = () => resolve(true);
      r.onerror = () => resolve(false);
    }catch{ resolve(false); }
  });
}

function lsGet(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}
function lsSet(value){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(value)); }catch{}
}

export const Memory = {
  async load(){
    if (!idb) idb = await openDB();
    // 1) zkuste IndexedDB
    let v = idb ? await idbGet(idb) : null;
    // 2) fallback localStorage
    if (!v) v = lsGet();
    return v; // null = první spuštění / žádná minulost
  },
  saveSoon(value){
    // odlehčené časté zápisy
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { Memory.save(value); }, SAVE_DEBOUNCE_MS);
  },
  async save(value){
    if (!idb) idb = await openDB();
    if (idb) await idbSet(idb, value);
    lsSet(value); // sekundární kopie (i pro PWA izolaci)
  }
};

// příjem "storage" událostí (pokud běží víc oken)
window.addEventListener('storage', (e)=>{
  if (e.key === LS_KEY) {
    // necháváme na vyšší vrstvě – tady jen signalizace by šla přes CustomEvent
    window.dispatchEvent(new CustomEvent('vafi-storage-updated'));
  }
});