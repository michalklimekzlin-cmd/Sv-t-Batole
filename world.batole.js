// world.batole.js – spustí BatoleSvět
import { ViriDirector } from './viri.director.js';

const Ctx = {
  map: {
    toggleGate({ nearPlayer }) { document.dispatchEvent(new CustomEvent('map:gate',{detail:{nearPlayer}})); }
  },
  ui: {
    whisper(msg, { ttl=2000 }={}) {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.cssText = 'position:fixed;left:50%;bottom:12%;transform:translateX(-50%);' +
                         'background:rgba(0,0,0,.5);color:#bff;padding:.5rem 1rem;border-radius:.6rem;' +
                         'backdrop-filter:blur(6px);font:600 12px system-ui;z-index:20;';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), ttl);
    },
    toneOverlay({ hue=170, sat=8, dur=1000 }) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;inset:0;pointer-events:none;mix-blend-mode:screen;
        background:radial-gradient(60% 60% at 50% 60%, hsla(${hue} ${sat}% 60% /.15), transparent);
        transition:opacity ${dur}ms;opacity:1;z-index:10;`;
      document.body.appendChild(el);
      setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(), dur); }, 16);
    },
    flash(text,{dur=500}={}) {
      const el = document.createElement('div');
      el.textContent = text;
      el.style.cssText = 'position:fixed;left:50%;top:12%;transform:translateX(-50%);' +
        'color:#8f8;font:700 13px system-ui;text-shadow:0 0 12px #0f5;z-index:30;';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), dur);
    }
  },
  state: {
    get player(){ return (window.StateCore?.player) || { mood:.5, stress:.2, lost:false }; }
  }
};

(function main(){
  // jednoduché „ztracení“ – když hráč dlouho nic neudělá, označ lost=true
  let idle = 0; document.addEventListener('pointerdown', ()=>idle=0);
  setInterval(()=>{ idle+=1; const p=window.StateCore=window.StateCore||{}; p.player=p.player||{}; p.player.lost = idle>8; }, 1000);

  function tick(){
    ViriDirector.tick({ ...Ctx, state:{ player: (window.StateCore?.player)||{} } });
    requestAnimationFrame(tick);
  }
  tick();
})();
