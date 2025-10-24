import { VAFI } from "./memory.core.js";
import "./rules.guardrails.js";

class Viri {
  constructor() {
    this.birth = Date.now();
    this.energy = 1.0;
    this.mood = "calm";
    this.stats = { seen: 0, dreamTick: 0 };
    this.memory = (VAFI.memory.data.profile ||= { notes: [] });
    VAFI.memory.save();
    VAFI.memory.push("boot", { ver: "mind.v1" });
  }

  learn(channel, payload) {
    const safe = VAFI.guard.clean(payload, { emotion:"", signal:"", value:0, note:"" });
    this.stats.seen++;
    if (safe.value > 0.7 && safe.emotion) this.mood = safe.emotion;
    VAFI.memory.push("learn", { channel, ...safe });
  }

  pulse(dt=0.016) {
    this.energy = Math.min(1, Math.max(0, this.energy + (0.05 - 0.02*Math.random())*dt));
    if (Math.random() < 0.001 + this.stats.seen/1e6) this.think();
  }

  think() {
    const msg = `vnímám ${this.mood} • energy=${this.energy.toFixed(2)}`;
    VAFI.memory.push("thought", { msg });
  }

  dreamTick() {
    this.stats.dreamTick++;
    if (this.stats.dreamTick % 300 === 0) {
      const frag = {
        seed: Math.random().toString(36).slice(2),
        mood: this.mood, energy: this.energy,
        gleaned: VAFI.memory.read("learn").slice(-10)
      };
      (VAFI.memory.data.dreams ||= []).push(frag);
      VAFI.memory.save();
      VAFI.memory.push("dream", { seed: frag.seed, mood: frag.mood });
    }
  }

  snapshot(){ return {
    birth: this.birth, mood: this.mood, energy: this.energy,
    seen: this.stats.seen, dreams: (VAFI.memory.data.dreams||[]).length
  }; }
}

export const VAFI_NS = (globalThis.VAFI ||= {});
export const viri = (VAFI_NS.viri ||= new Viri());

let _running = true;
function tick(){
  if (!_running) return;
  viri.pulse(1/60);
  viri.dreamTick();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
VAFI_NS.stopMind = ()=>{ _running=false; };
VAFI.memory.push("ready", { who: "viri.mind" });
