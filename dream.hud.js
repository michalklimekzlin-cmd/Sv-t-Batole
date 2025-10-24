// dream.hud.js — Viri Deník & Dreamscape (log, sny, blueprint vizualizace)

(function () {
  // --- CSS ---
  const CSS = `
  .v-hud-btn{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:9999;
    padding:8px 12px;border-radius:10px;border:1px solid #334;background:rgba(20,20,32,.85);
    color:#cfe;font:600 13px system-ui,-apple-system,Segoe UI,Roboto;backdrop-filter:blur(8px) saturate(140%)}
  .v-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;z-index:10000;
    align-items:center;justify-content:center}
  .v-card{width:min(94vw,900px);max-height:86vh;overflow:hidden;background:#0e121a;
    border:1px solid #334;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.6);display:flex;flex-direction:column}
  .v-head{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #243}
  .v-tabs{display:flex;gap:6px}
  .v-tab{padding:6px 10px;border-radius:8px;border:1px solid #2b3b4b;background:#131a24;color:#cfe;font-weight:700}
  .v-tab[aria-selected="true"]{background:#1a2331;border-color:#3b4b6b}
  .v-close{padding:6px 10px;border-radius:8px;border:1px solid #2b3b4b;background:#131a24;color:#cfe}
  .v-body{display:flex;flex:1;min-height:300px}
  .v-pane{flex:1;display:none;padding:10px 12px;overflow:auto}
  .v-pane[aria-hidden="false"]{display:block}
  .v-pre{white-space:pre-wrap;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#cfe}
  .v-row{display:flex;gap:8px;align-items:center;margin:6px 0}
  .v-mini{opacity:.8;font-size:12px}
  .v-btn{padding:6px 10px;border-radius:8px;border:1px solid #2b3b4b;background:#131a24;color:#cfe}
  canvas.v-dream{width:100%;height:360px;border:1px solid #223;border-radius:10px;background:#090d14}
  `;
  const S = document.createElement('style'); S.textContent = CSS; document.head.appendChild(S);

  // --- HUD Button ---
  const hudBtn = document.createElement('button');
  hudBtn.className = 'v-hud-btn';
  hudBtn.textContent = '📜 Deník Viriho';
  document.body.appendChild(hudBtn);

  // --- Modal ---
  const modal = document.createElement('div');
  modal.className = 'v-modal';
  modal.innerHTML = `
    <div class="v-card">
      <div class="v-head">
        <div class="v-tabs">
          <button class="v-tab" data-pane="log" aria-selected="true">Log</button>
          <button class="v-tab" data-pane="dreams">Sny</button>
          <button class="v-tab" data-pane="blueprint">Blueprint</button>
        </div>
        <div class="v-row">
          <button class="v-btn" id="v-export">📦 Export JSON</button>
          <button class="v-close">✕ Zavřít</button>
        </div>
      </div>
      <div class="v-body">
        <section class="v-pane" id="pane-log" aria-hidden="false">
          <div class="v-row">
            <label class="v-mini">Filtr typu:</label>
            <select id="v-filter">
              <option value="">(vše)</option>
              <option>learn</option><option>thought</option><option>dream</option>
              <option>boot</option><option>ready</option>
            </select>
            <button class="v-btn" id="v-refresh">↻ Obnovit</button>
          </div>
          <div class="v-pre" id="v-log">Načítám…</div>
        </section>
        <section class="v-pane" id="pane-dreams" aria-hidden="true">
          <div class="v-row v-mini">Poslední sny → „dreamscape“ náhled dole</div>
          <div class="v-pre" id="v-dreams">Načítám…</div>
          <canvas class="v-dream" id="v-canvas"></canvas>
        </section>
        <section class="v-pane" id="pane-blueprint" aria-hidden="true">
          <div class="v-row">
            <button class="v-btn" id="v-blue-refresh">↻ Přepočítat</button>
          </div>
          <div class="v-pre" id="v-blue">Načítám…</div>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Helpers
  const $ = sel => modal.querySelector(sel);
  const VAFI = globalThis.VAFI || {};
  const mem  = VAFI.memory;

  function open(){ modal.style.display='flex'; setTab('log'); refreshAll(); }
  function close(){ modal.style.display='none'; }
  hudBtn.onclick = open;
  $('.v-close').onclick = close;

  // Tabs
  [...modal.querySelectorAll('.v-tab')].forEach(btn=>{
    btn.onclick = () => setTab(btn.dataset.pane);
  });
  function setTab(key){
    [...modal.querySelectorAll('.v-tab')].forEach(b=>b.setAttribute('aria-selected', b.dataset.pane===key));
    $('#pane-log'     ).setAttribute('aria-hidden', key!=='log');
    $('#pane-dreams'  ).setAttribute('aria-hidden', key!=='dreams');
    $('#pane-blueprint').setAttribute('aria-hidden', key!=='blueprint');
    if (key==='dreams') drawDreamscape(); // aktualizuj canvas
  }

  // Log
  $('#v-refresh').onclick = refreshLog;
  $('#v-filter').onchange = refreshLog;

  function refreshLog(){
    const out = $('#v-log');
    try{
      const filt = $('#v-filter').value;
      const rows = (mem?.read()? mem.read() : [])
        .filter(e => !filt || e.kind===filt)
        .slice(-200)
        .map(e => `${(e.t||'').slice(0,19)}  ${e.kind}  ${e.channel||''} ${e.emotion||e.signal||''} ${e.note||''}`)
        .reverse()
        .join('\n');
      out.textContent = rows || '(prázdné)';
    }catch(err){ out.textContent = '❗ Log nelze načíst: '+err; }
  }

  // Dreams
  function refreshDreams(){
    const out = $('#v-dreams');
    try{
      const dreams = (VAFI.memory?.data?.dreams)||[];
      const rows = dreams.slice(-20).map(d => {
        const g = (d.gleaned||[]).map(x=>x.channel+':' + (x.emotion||x.signal||'') ).join(', ');
        return `${d.seed}  mood=${d.mood} energy=${(d.energy??0).toFixed?.(2) || d.energy}  gleaned=[${g}]`;
      }).reverse().join('\n');
      out.textContent = rows || '(zatím žádné sny)';
    }catch(err){ out.textContent = '❗ Sny nelze načíst: '+err; }
  }

  // Blueprint
  $('#v-blue-refresh').onclick = refreshBlueprint;
  function refreshBlueprint(){
    const out = $('#v-blue');
    try{
      const bp = VAFI.blueprint?.getBlueprint?.();
      out.textContent = bp ? JSON.stringify(bp,null,2) : '(není blueprint)';
    }catch(err){ out.textContent = '❗ Blueprint chyba: '+err; }
  }

  // Export
  $('#v-export').onclick = () => {
    try { VAFI.exporter?.exportJSON?.(); } catch {}
  };

  function refreshAll(){
    refreshLog();
    refreshDreams();
    refreshBlueprint();
  }

  // --- Dreamscape vizualizace (canvas v modalu) ---
  const cvs = $('#v-canvas'); const c = cvs.getContext('2d');
  let W=0,H=0, nodez=[]; let animId=null;

  function fit(){
    const dpr = devicePixelRatio||1;
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.floor(W*dpr); cvs.height = Math.floor(H*dpr);
    c.setTransform(dpr,0,0,dpr,0,0);
  }
  function moodColor(m){
    switch((m||'').toLowerCase()){
      case 'joy': case 'happy': return '#9fffd0';
      case 'sad': return '#7aa0ff';
      case 'calm': return '#aee';
      case 'odd': return '#f7caff';
      case 'focus': return '#ffe58a';
      default: return '#bfe';
    }
  }
  function drawDreamscape(){
    fit();
    // vytvoř uzly z posledních snů
    const dreams = (VAFI.memory?.data?.dreams)||[];
    const last = dreams.slice(-24);
    nodez = last.map((d,i)=>{
      const ang = (i/Math.max(1,last.length))*Math.PI*2;
      const R = Math.min(W,H)*0.34;
      const cx = W/2 + Math.cos(ang)*R*(0.8+0.2*Math.random());
      const cy = H/2 + Math.sin(ang)*R*(0.8+0.2*Math.random());
      return {
        x:cx, y:cy,
        r: 8 + 10*((d.energy??0.5)),
        col: moodColor(d.mood),
        seed: d.seed,
        mood: d.mood,
        energy: d.energy??0.5
      };
    });
    // start animace
    if(animId) cancelAnimationFrame(animId);
    loop();
  }
  function link(a,b){ c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
  function loop(){
    c.clearRect(0,0,W,H);
    // pozadí mříž
    c.globalAlpha = 0.15; c.strokeStyle='#1f2a3a'; c.lineWidth=1;
    for(let i=0;i<6;i++){
      const f = (i+1)/7; c.beginPath(); c.arc(W/2,H/2, Math.min(W,H)*f*0.5, 0, Math.PI*2); c.stroke();
    }
    c.globalAlpha = 1;

    // linky
    c.strokeStyle='rgba(190,240,255,.25)'; c.lineWidth=1.5;
    for(let i=0;i<nodez.length;i++){
      const a = nodez[i], b = nodez[(i+1)%nodez.length];
      link(a,b);
    }

    // uzly
    nodez.forEach(n=>{
      // aura
      const t = Date.now()/1000;
      const rr = n.r*(1+0.08*Math.sin(t*2.1));
      const g = c.createRadialGradient(n.x,n.y, rr*0.2, n.x,n.y, rr);
      g.addColorStop(0, n.col + 'cc');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(n.x,n.y, rr, 0, Math.PI*2); c.fill();

      // střed
      c.fillStyle = n.col; c.beginPath(); c.arc(n.x,n.y, Math.max(2, n.r*0.35), 0, Math.PI*2); c.fill();
    });

    animId = requestAnimationFrame(loop);
  }

  // kdyby se okno otočilo / změnilo
  addEventListener('resize', ()=>{ if(modal.style.display==='flex') drawDreamscape(); });

})();
