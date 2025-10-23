// vivere.flow.js (lite)
// Jednoduchý „životní tok“ – globální tik s delta časem.
export const Flow = (() => {
  let last = performance.now();
  const subs = new Set();
  function tick(now) {
    const dt = (now - last) / 1000; // v sekundách
    last = now;
    subs.forEach(fn => { try { fn(dt, now); } catch(e){} });
    requestAnimationFrame(tick);
  }
  return {
    start(){ requestAnimationFrame(tick); },
    onTick(fn){ subs.add(fn); return () => subs.delete(fn); }
  };
})();