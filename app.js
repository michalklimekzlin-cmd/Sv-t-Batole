import { GLView } from './src/gl.js';
import { ECS } from './src/ecs.js';
import { SignalBus } from './src/signalbus.js';
import { GlyphField } from './src/glyphfield.js';
import { Aether } from './src/aether.js';
import { Watchdog } from './src/watchdog.js';
import { Matter } from './src/matter.js';
import { Map6x6 } from './src/map3d.js';
import { Orbit } from './src/orbit.js';
import { GlyphAtlas } from './src/glyph_atlas.js';
import { GlyphText } from './src/glyph_text.js';
import { OrbitAssistant } from './orbit_assistant.js';

async function boot(){
  const canvas=document.getElementById('canvas');
  const glview=new GLView(canvas);
  const ecs=new ECS();
  const bus=new SignalBus();
  const glyph=new GlyphField(glview);
  const aether=new Aether(bus,'batole-dech');
  const guard=new Watchdog(ecs,bus);
  const matter=new Matter(ecs,bus);
  const map=new Map6x6();

  const hud=document.getElementById('hud');
  const orbitBadge=document.createElement('div');
  orbitBadge.textContent='Orbit aktivní • jazykový kruh';
  hud.appendChild(orbitBadge);

  const resize=()=>glview.resize();
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // Orbit ring in center
  const orbit=new Orbit(glview);
  orbit.setCenterPx(glview.canvas.width/2, glview.canvas.height/2);

  // Assistant
  const OA = new OrbitAssistant(bus, glview, matter, orbit);
  OA.say('Vidím tě, Batole. Dýchej se mnou. Tvoříme.');

  // Glyph rectangles for bricks
  const atlas=new GlyphAtlas(glview.gl,{ size:512, cell:32, font:'20px monospace' });
  const gtext=new GlyphText(glview, atlas);
  const charset="ABEFHIKLMNORSTVWXZ0123456789.:;+*#@";

  const bricks=[];
  const _spawn=matter.spawnBrick.bind(matter);
  matter.spawnBrick=(pos)=>{
    _spawn(pos);
    const x=(pos.x*0.5+0.5)*glview.canvas.width;
    const y=(pos.y*-0.5+0.5)*glview.canvas.height;
    bricks.push(buildGlyphRect(x,y,50,50));
  };

  function buildGlyphRect(px, py, w, h, step=18){
    const inst=[];
    for(let y=py - h/2; y<=py + h/2; y+=step){
      for(let x=px - w/2; x<=px + w/2; x+=step){
        const ch=charset[(Math.random()*charset.length)|0];
        inst.push({ x, y, scale:18, uv: atlas.uvForChar(ch.charCodeAt(0)), alpha:0.9 });
      }
    }
    return inst;
  }

  // Input (impuls + assistant follow)
  const toWorld=(clientX, clientY)=>{
    const rect=canvas.getBoundingClientRect();
    const x=((clientX-rect.left)/rect.width)*2-1;
    const y=((clientY-rect.top)/rect.height)*-2+1;
    const px=((clientX-rect.left)/rect.width)*glview.canvas.width;
    const py=((clientY-rect.top)/rect.height)*glview.canvas.height;
    orbit.setCenterPx(px,py);
    return {x,y, px,py};
  };
  const emitImpulse=(e)=>{
    const pt=('touches' in e && e.touches?.length) ? toWorld(e.touches[0].clientX, e.touches[0].clientY) : toWorld(e.clientX, e.clientY);
    bus.emit('impulse',{pos:{x:pt.x,y:pt.y}});
    OA.onImpulse({x:pt.x,y:pt.y});
    if(window._followMode){ OA.followPointer(pt.px, pt.py); }
    e.preventDefault();
  };
  canvas.addEventListener('pointerdown', emitImpulse);
  canvas.addEventListener('touchstart', emitImpulse, {passive:false});

  // Command bar
  const input = document.getElementById('cmd');
  const sendBtn = document.getElementById('send');
  const submit = ()=>{
    const raw = input.value || '';
    input.value='';
    const res = OA.handleCommand(raw);
    if(res === 'follow'){ window._followMode = true; }
  };
  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ submit(); }});

  // Load memory (center position) if exists
  try{
    const mem = JSON.parse(localStorage.getItem('orbit_memory') || '{}');
    if(mem && mem.lastCenter){
      const px=((mem.lastCenter.x*0.5 + 0.5) * glview.canvas.width);
      const py=((mem.lastCenter.y*-0.5 + 0.5) * glview.canvas.height);
      orbit.setCenterPx(px, py);
    }
  }catch(e){}

  // Loop
  let last=performance.now();
  function loop(now){
    const dt=Math.min(0.05, (now-last)/1000);
    last=now;
    ecs.update(dt);
    guard.update(dt);
    orbit.update(dt);
    glview.begin();
    for(const batch of bricks){ gtext.setInstances(batch); gtext.draw(); }
    orbit.render();
    glview.end();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
boot();
