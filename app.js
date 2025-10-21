// app.js — bootstrap pro skripty v kořeni
import { GLView } from './gl.js';
import { ECS } from './ecs.js';
import { SignalBus } from './signalbus.js';
import { GlyphField } from './glyphfield.js'; // zůstává skrytý
import { Aether } from './aether.js';
import { Watchdog } from './watchdog.js';
import { Matter } from './matter.js';
import { Map6x6 } from './map3d.js'; // pokud máš jiný název, přejmenuj import

async function boot(){
  const canvas = document.getElementById('canvas');
  const glview  = new GLView(canvas);
  const ecs     = new ECS();
  const bus     = new SignalBus();
  const glyph   = new GlyphField(glview); // hidden by default
  const aether  = new Aether(bus, 'batole-dech');
  const guard   = new Watchdog(ecs, bus);
  const matter  = new Matter(ecs, bus);
  const map     = new Map6x6();

  // velikost plátna
  const resize = () => glview.resize();
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // načtení světa (máš start.sig v kořeni? potom:)
  try {
    const txt = await fetch('./start.sig?v=3').then(r=>r.text());
    // volitelně: můžeš ignorovat parser a jen logovat
    console.log('World file loaded:', txt.slice(0,80)+'…');
  } catch(e){ console.warn('start.sig nenalezen - nevadí'); }

  // klik/touch → impuls
  const toWorld = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((clientY - rect.top) / rect.height) * -2 + 1;
    return {x, y};
  };
  const emitImpulse = (e) => {
    const pt = ('touches' in e && e.touches?.length)
      ? toWorld(e.touches[0].clientX, e.touches[0].clientY)
      : toWorld(e.clientX, e.clientY);
    bus.emit('impulse', { pos: pt });
    e.preventDefault();
  };
  canvas.addEventListener('pointerdown', emitImpulse);
  canvas.addEventListener('touchstart', emitImpulse, {passive:false});

  // aether heartbeat (neviditelné AI „zadní vrátka“)
  let tHeartbeat = 0;
  aether.on('sys', msg => {
    if(msg.cmd === 'panic'){ bus.emit('panic', {}); }
  });

  // smyčka
  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    tHeartbeat += dt;
    if(tHeartbeat > 2.5){ tHeartbeat = 0; aether.send('sys', { hb: now|0 }); }

    ecs.update(dt);
    guard.update(dt);

    glview.begin();
    // glyph.renderParticles(); // zůstává skryté
    matter.render(glview);     // viditelné „cihly“ z Iskry
    glview.end();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
boot();