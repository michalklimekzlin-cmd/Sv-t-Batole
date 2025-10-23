// miza.core.js — „Míza“: zásobárna života světa (0..1), roste z Flow, pamatuje se v localStorage
import { onUpdate as onFlow, getFlow } from './vivere.flow.js';

const KEY = 'miza_v1';
let S = { v: 0.42, last: Date.now() }; // v = stav 0..1
try { const raw = localStorage.getItem(KEY); if (raw) S = { ...S, ...JSON.parse(raw) }; } catch {}

function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch{} }
const clamp01 = x => Math.max(0, Math.min(1, x));

let flow = getFlow();
onFlow(f => flow = f);

// růst/úbytek za čas (dt v sekundách)
function step(dt){
  // přírůstky z toku světa (vitalita + zvědavost + tvá přítomnost)
  const gain = (flow.vitality*0.60 + flow.curiosity*0.30 + flow.active*0.10) * 0.12; // 0..~
  // odpar (aby to nebyl nekonečný růst)
  const bleed = 0.02;

  // bonus za „klid“ – když je harmonie, Míza se lépe zadržuje
  const harmonyBoost = (flow.harmony ?? 0.6) * 0.04;

  S.v += (gain + harmonyBoost - bleed) * dt;
  S.v = clamp01(S.v);
}

let t0 = performance.now()/1000;
function loop(){
  const t = performance.now()/1000;
  const dt = Math.min(0.05, t - t0); t0 = t;
  step(dt);
  if (listeners.size) {
    const payload = { value: S.v, percent: Math.round(S.v*100) };
    listeners.forEach(fn => { try{ fn(payload); }catch{} });
  }
  if (t*1000 - S.last > 2500) { S.last = Date.now(); save(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// veřejné API
export function getMiza(){ return S.v; }
export function setMiza(v){ S.v = clamp01(v); save(); }
export function addMiza(x){ S.v = clamp01(S.v + x); save(); }
export function consumeMiza(x){ S.v = clamp01(S.v - x); save(); return S.v; }

const listeners = new Set();
export function onMizaUpdate(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }

// drobné „žďuchance“ z uživatele – každý dotyk trošku přidá
addEventListener('pointerdown', ()=>addMiza(0.01), {passive:true});
