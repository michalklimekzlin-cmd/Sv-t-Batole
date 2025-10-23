// vafi.memory.js — jednoduchá dlouhodobá paměť (localStorage)
// Namespacing + bezpečné čtení/zápis + pár helperů.

const KEY = 'vafMem_v1'; // změň při nekompatibilní změně struktury
let mem = null;

function load() {
  if (mem) return mem;
  try {
    mem = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch { mem = {}; }
  mem.createdAt ??= Date.now();
  mem.updatedAt ??= Date.now();
  mem.seenCount ??= 0;
  mem.lastMood ??= 0.6;
  mem.lastEnergy ??= 0.7;
  mem.lastSeenAt ??= Date.now();
  return mem;
}

function save() {
  if (!mem) return;
  mem.updatedAt = Date.now();
  localStorage.setItem(KEY, JSON.stringify(mem));
}

export function remember(key, value) {
  const m = load();
  m[key] = value;
  save();
}
export function recall(key, fallback=null) {
  const m = load();
  return (m[key] ?? fallback);
}
export function bump(key, delta = 1) {
  const m = load();
  const v = Number(m[key] ?? 0) + delta;
  m[key] = v;
  save();
  return v;
}

export function snapshotMood(mood, energy) {
  const m = load();
  m.lastMood = mood;
  m.lastEnergy = energy;
  m.lastSeenAt = Date.now();
  save();
}

export function getSnapshot() {
  const m = load();
  return {
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    lastSeenAt: m.lastSeenAt,
    lastMood: m.lastMood,
    lastEnergy: m.lastEnergy,
    seenCount: m.seenCount
  };
}

export function resetMemory(hard=false) {
  if (hard) localStorage.removeItem(KEY);
  mem = null;
  load(); save();
}

// inicializace při importu
load();
