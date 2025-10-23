// team.glyphs.js – velmi jednoduché zobrazení "znakových bytostí"
import { Teams } from './teams.js';

const GLYPH_LAYER_ID = 'glyphLayer';

function ensureLayer() {
  let el = document.getElementById(GLYPH_LAYER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = GLYPH_LAYER_ID;
    Object.assign(el.style, {
      position:'fixed', inset:'0', pointerEvents:'none', fontFamily:'monospace',
      color:'#cde', fontSize:'24px'
    });
    document.body.appendChild(el);
  }
  return el;
}

export function spawnGlyphs() {
  const layer = ensureLayer();
  layer.innerHTML = '';
  const gl = Teams.Glyphs.members;

  const W = window.innerWidth;
  const H = window.innerHeight;

  gl.forEach((g, i) => {
    const span = document.createElement('span');
    span.textContent = g.face;
    span.setAttribute('aria-hidden','true');
    Object.assign(span.style, {
      position:'absolute',
      left:  (W*0.15 + (i%3)*W*0.25) + 'px',
      top:   (H*0.15 + Math.floor(i/3)*H*0.25) + 'px',
      filter:`drop-shadow(0 0 6px ${g.color})`,
      opacity:'0.85',
    });
    layer.appendChild(span);
  });
}

// volitelné: jednoduché dýchaní glyphů podle „nálady“
let t=0;
export function animateGlyphs(dt=0.016){
  t += dt;
  const layer = document.getElementById(GLYPH_LAYER_ID);
  if (!layer) return;
  [...layer.children].forEach((el, i)=>{
    const m = (Teams.Glyphs.members[i]?.mood ?? 0.5);
    const y = Math.sin(t*0.8 + i)*4*m;
    el.style.transform = `translateY(${y}px)`;
  });
  requestAnimationFrame(()=>animateGlyphs(0.016));
}
