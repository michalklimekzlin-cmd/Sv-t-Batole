// team.glyph.js — Tým 4: Glyph (znaková bytost)
export function spawnGlyph(){
  const span = document.createElement('span');
  span.textContent = '{*(•.)•.)//';
  Object.assign(span.style,{
    position:'fixed', left:'50%', bottom:'22%',
    transform:'translateX(-50%)',
    font:'700 22px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace',
    color:'#9AE6FF', textShadow:'0 0 10px rgba(154,230,255,.45)',
    pointerEvents:'none', opacity:.9
  });
  document.body.appendChild(span);

  let t=0;
  (function breathe(){
    t+=1/60;
    span.style.transform = `translateX(-50%) translateY(${Math.sin(t*1.6)*4}px)`;
    requestAnimationFrame(breathe);
  })();
}
