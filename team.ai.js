// team.ai.js — Tým 2: AI (Orbit – vnitřní pomocník)
export async function spawnAIHelper(){
  let say = (t)=>console.log('[Orbit]',t);
  // volitelně hlas
  try { ({ say } = await import(`./voice.io.js?v=${window.V||'dev'}`)); } catch {}

  const box = document.createElement('div');
  Object.assign(box.style,{
    position:'fixed', right:'12px', bottom:'12px',
    padding:'.45rem .6rem', border:'1px solid rgba(160,140,255,.35)',
    borderRadius:'.6rem', background:'rgba(18,16,30,.6)',
    backdropFilter:'blur(6px) saturate(120%)',
    color:'#e7deff', font:'600 12px/1 system-ui', pointerEvents:'auto'
  });
  box.textContent = 'Orbit (AI): připraven';
  box.title = 'Klepni – Orbit poradí';
  document.body.appendChild(box);

  box.addEventListener('click', ()=>{
    say('Jsem Orbit. Když řekneš „Ahoj“, Vafi odpoví podle nálady.');
  }, {passive:true});
}
