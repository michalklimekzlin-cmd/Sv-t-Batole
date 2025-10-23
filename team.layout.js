// team.layout.js — jemné „badge“ rohové rozložení
(function(){
  const css = `
  .team-badge{
    position:fixed; z-index:6; padding:.6rem 1rem;
    border:1px solid rgba(255,255,255,.18);
    border-radius:.8rem; backdrop-filter:blur(6px) saturate(140%);
    background:rgba(18,16,30,.35); color:#e7deff; font:600 14px/1.1 system-ui;
    pointer-events:auto; box-shadow:0 8px 24px rgba(0,0,0,.25);
  }
  .team-tl{ left:12px; top:12px; }
  .team-tr{ right:12px; top:12px; }
  .team-bl{ left:12px; bottom:12px; }
  .team-br{ right:12px; bottom:12px; }
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  function badge(text, klass){
    const d = document.createElement('div');
    d.className = `team-badge ${klass}`;
    d.textContent = text;
    document.body.appendChild(d);
    return d;
  }

  badge('Batolesvět', 'team-tl');
  badge('Glyph', 'team-tr');
  badge('Piko', 'team-bl');
  badge('Orbit', 'team-br');
})();