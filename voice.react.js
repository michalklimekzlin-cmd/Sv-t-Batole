// voice.react.js – zpřístupní mood/stress do StateCore (pokud ho máš)
import { readAffect, enableMic } from './vafi.audio.js';

(async () => {
  try { await enableMic(); } catch(e) {
    console.warn('Mic denied – běžíme bez hlasu.');
  }
  setInterval(() => {
    const a = readAffect();
    window.StateCore = window.StateCore || {};
    window.StateCore.player = window.StateCore.player || {};
    Object.assign(window.StateCore.player, a);
  }, 250);
})();
