// team.world.js — Tým 3: Batolesvět (vlastní zástupce – „Klíček“)
export async function spawnWorldSpirit(){
  // čte Mízu a Flow (když jsou)
  let getMiza = ()=>1, onMizaUpdate = (fn)=>fn({value:1});
  try {
    const m = await import(`./miza.core.js?v=${window.V||'dev'}`);
    getMiza = m.getMiza; onMizaUpdate = m.onMizaUpdate;
  } catch {}

  const spirit = document.createElement('div');
  Object.assign(spirit.style,{
    position:'fixed', left:'50%', top:'18%', transform:'translateX(-50%)',
    width:'10px', height:'10px', borderRadius:'50%',
    background:'radial-gradient(circle, #b7ffcc 0%, rgba(0,0,0,0) 70%)',
    filter:'drop-shadow(0 0 14px #b7ffcc)'
  });
  spirit.setAttribute('aria-label','Klíček (duch světa)');
  document.body.appendChild(spirit);

  function render(v){
    const s = 6 + v*24;
    spirit.style.width  = s+'px';
    spirit.style.height = s+'px';
    spirit.style.opacity = String(0.6 + v*0.35);
  }
  render(getMiza());
  onMizaUpdate(({value})=>render(value));
}
