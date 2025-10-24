// events.core.js — centrální sběrnice událostí
export const Bus = new EventTarget();

export const EVENTS = {
  voice(payload) {  // {team:'glyph|ai|batole|pedro', text, weight:-1..+1}
    Bus.dispatchEvent(new CustomEvent('voice', { detail: payload }));
  },
  vision(payload) { // {kind:'path|symbol|npc', truth:0..1, ttl:ms}
    Bus.dispatchEvent(new CustomEvent('vision', { detail: payload }));
  },
  mood(payload) {   // {anxiety, calm, focus}
    Bus.dispatchEvent(new CustomEvent('mood', { detail: payload }));
  },
  ground() {        // stabilizace
    Bus.dispatchEvent(new CustomEvent('ground'));
  },
  feedback(payload) { // {trueVision:boolean}
    Bus.dispatchEvent(new CustomEvent('feedback', { detail: payload }));
  }
};

// přístup i z konzole
window.EVENTS = EVENTS;
window.Bus = Bus;