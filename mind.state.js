// mind.state.js  v1
// Jednotné jádro stavu + signály, vše v jednom místě
(() => {
  const KEY = 'STATE_CORE_V1';

  const defaultState = {
    tick: 0,
    // Energetika a nálady
    energy: 1.0, mood: 0.0, anxiety: 0.0, stress: 0.0, discipline: 0.5,
    // „Schizo“ osy – vstupy pro mechaniky hry
    voices: { level: 0.0, last: null },         // „slyším hlasy“
    hallucination: { level: 0.0, target: null },// „vidím cíl/obraz“
    realityBlend: 0.0,                          // míra míchání realit
    // Telemetrie herního běhu
    lastAdvice: null,
  };

  let state = Object.assign({}, defaultState, JSON.parse(localStorage.getItem(KEY) || '{}'));

  const listeners = new Set();
  function emit() {
    localStorage.setItem(KEY, JSON.stringify(state));
    document.dispatchEvent(new CustomEvent('state:changed', { detail: state }));
    listeners.forEach(fn => fn(state));
  }

  const StateCore = {
    get() { return state; },
    set(patch) { state = { ...state, ...patch }; emit(); },
    merge(path, patch) { state[path] = { ...state[path], ...patch }; emit(); },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    tick(dt=1/60) { state.tick += dt; emit(); },
    reset() { state = { ...defaultState }; emit(); },
  };

  // jemný heartbeat
  setInterval(() => StateCore.tick(1), 1000);

  window.StateCore = StateCore;
})();
