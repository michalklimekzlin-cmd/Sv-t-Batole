// Entry point
import { GLView } from './gl.js';
import { ECS } from './ecs.js';
import { SignalBus } from './signalbus.js';
import { GlyphField } from './glyphfield.js';
import { parseWorld, Runtime } from './dsl/runtime.js';
import { Dog } from './ai/dog.js';
import { Map6x6 } from './sim/map3d.js';
import { Aether } from './aether.js';
import { Watchdog } from './watchdog.js';
import { Matter } from './matter.js';

export async function boot(){
  const canvas = document.getElementById('canvas');
  const glview = new GLView(canvas);
  const ecs = new ECS();
  const bus = new SignalBus();
  const glyph = new GlyphField(glview); // hidden by default
  const map = new Map6x6();
  const aether = new Aether(bus, 'batole-dech');
  const guard = new Watchdog(ecs, bus);
  const matter = new Matter(ecs, bus);

  // Resize handling
  const resize = () => glview.resize();
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // Load starting world
  const txt = await fetch('./worlds/start.sig').then(r => r.text());
  const world = parseWorld(txt);
  const rt = new Runtime(ecs, bus, glyph, map);
  rt.build(world);

  // Dog demo entity
  const dog = new Dog(ecs, bus, glyph);
  dog.spawn({x:0, y:0});

  // Player impulses (visible)
  const toWorld = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const x = ( (clientX - rect.left) / rect.width ) * 2 - 1;
    const y = ( (clientY - rect.top) / rect.height ) * -2 + 1;
    return {x, y};
  };
  const emitImpulse = (e) => {
    const pt = ('touches' in e && e.touches.length) ? 
      toWorld(e.touches[0].clientX, e.touches[0].clientY) :
      toWorld(e.clientX, e.clientY);
    bus.emit('impulse', { pos: pt });
    e.preventDefault();
  };
  canvas.addEventListener('pointerdown', emitImpulse);
  canvas.addEventListener('touchstart', emitImpulse, {passive:false});

  // AI-only backchannel: dog occasionally broadcasts a heartbeat invisible to player
  let tHeartbeat = 0;
  aether.on('sys', msg => {
    if(msg.cmd === 'move'){ dog.target = msg.pos; }
    if(msg.cmd === 'panic'){ bus.emit('panic', {}); }
  });

  // Main loop
  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // AI backchannel heartbeat
    tHeartbeat += dt;
    if(tHeartbeat > 2.5){
      tHeartbeat = 0;
      aether.send('sys', { hb: now|0 });
    }

    ecs.update(dt);
    dog.update(dt);
    guard.update(dt);

    glview.begin();
    // glyph.renderParticles(); // hidden
    matter.render(glview);
    dog.render();
    glview.end();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
