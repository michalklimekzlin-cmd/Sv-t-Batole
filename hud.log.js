// hud.log.js — plovoucí panel pro Log, Tick a Start/Stop
(function () {
  const S = document.createElement('style');
  S.textContent = `
  .viri-hud{position:fixed;right:12px;bottom:12px;display:flex;gap:8px;z-index:9999}
  .viri-hud button{padding:6px 10px;border-radius:.6rem;border:1px solid #334;
    background:rgba(40,40,60,.8);backdrop-filter:blur(8px) saturate(120%);
    color:#cfe;font:600 12px system-ui, -apple-system, Segoe UI, Roboto; }
  .viri-hud button:active{transform:translateY(1px);opacity:.9}
  .viri-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);
    display:none;align-items:center;justify-content:center;z-index:10000}
  .viri-card{width:min(92vw,720px);max-height:80vh;overflow:auto;
    background:#0f1218;border:1px solid #334;border-radius:.8rem;
    box-shadow:0 10px 30px rgba(0,0,0,.5); padding:12px}
  .viri-card h3{margin:0 0 6px;color:#bff}
  .viri-log{white-space:pre-wrap;font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;color:#cfe}
  .viri-row{display:flex;gap:6px;align-items:center;justify-content:space-between;margin:6px 0}
  `;
  document.head.appendChild(S);

  const hud = document.createElement('div');
  hud.className = 'viri-hud';
  hud.innerHTML = `
    <button id="vhLog">📜 Log</button>
    <button id="vhTick">🧪 Tick</button>
    <button id="vhToggle">⏯ Start</button>
  `;
  document.body.appendChild(hud);

  const modal = document.createElement('div');
  modal.className = 'viri-modal';
  modal.innerHTML = `
    <div class="viri-card">
      <div class="viri-row">
        <h3>📜 Viri Log (posledních ~200)</h3>
        <button id="vhClose">✕ Zavřít</button>
      </div>
      <div class="viri-row">
        <div>Filtr typu:</div>
        <select id="vhFilter">
          <option value="">(vše)</option>
          <option>thought</option><option>place</option><option>npc</option>
          <option>quest</option><option>ping</option><option>builder</option><option>snapshot</option>
        </select>
        <button id="vhSnap">📌 Snapshot</button>
      </div>
      <div id="vhOut" class="viri-log">Načítám…</div>
    </div>`;
  document.body.appendChild(modal);

  function showLog() {
    const out = modal.querySelector('#vhOut');
    try {
      const filt = modal.querySelector('#vhFilter').value;
      const rows = (window.ViriMemory?.readLog({limit:200}) ?? [])
        .filter(e => !filt || e.type === filt)
        .map(e => {
          const t = (e.t || e.time || '').toString().slice(0, 19);
          const p = JSON.stringify(e.payload ?? e.data ?? {}, null, 0);
          return `${t}  ${e.type}  ${p}`;
        })
        .reverse()
        .join('\n');
      out.textContent = rows || '(prázdné)';
    } catch(err) {
      out.textContent = '❗ Log nedostupný: ' + err;
    }
  }

  // Btn akce
  hud.querySelector('#vhLog').onclick = () => { modal.style.display='flex'; showLog(); };
  hud.querySelector('#vhTick').onclick = () => {
    try { window.WorldBuilder?.tick(); } catch {}
    try { window.Viri?.pulse(); } catch {}
  };
  const toggleBtn = hud.querySelector('#vhToggle');
  let running = true; // builder startuje ve viri.guardian.js -> start()
  toggleBtn.textContent = running ? '⏸ Stop' : '▶ Start';
  toggleBtn.onclick = () => {
    running = !running;
    toggleBtn.textContent = running ? '⏸ Stop' : '▶ Start';
    try { running ? window.WorldBuilder?.start() : window.WorldBuilder?.stop(); } catch {}
  };

  modal.querySelector('#vhClose').onclick = () => modal.style.display='none';
  modal.querySelector('#vhFilter').onchange = showLog;
  modal.querySelector('#vhSnap').onclick = () => {
    try { window.ViriMemory?.snapshot('ruční'); showLog(); } catch {}
  };

  // klávesy (pokud máš HW klávesnici / desktop)
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'l') { modal.style.display='flex'; showLog(); }
    if (e.key.toLowerCase() === 't') { try { window.WorldBuilder?.tick(); window.Viri?.pulse(); } catch {} }
  });
})();
