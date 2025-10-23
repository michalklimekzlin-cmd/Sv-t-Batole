// team.ai.js — Tým 2: AI (Orbit)
export async function spawnAIHelper() {
  let say = (t) => console.log('[Orbit]', t);
  try {
    ({ say } = await import(`./voice.io.js?v=${window.V||'dev'}`));
  } catch {}

  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed', right: '12px', bottom: '12px',
    padding: '.45rem .6rem', border: '1px solid rgba(160,140,240,.3)',
    borderRadius: '.6rem', background: 'rgba(18,16,30,.6)',
    backdropFilter: 'blur(6px) saturate(120%)',
    color: '#e7deff', font: '600 12px/1 system-ui', pointerEvents: 'auto'
  });
  box.textContent = 'Orbit (AI): připraven';
  box.title = 'Klepni — Orbit poradí';
  document.body.appendChild(box);

  box.addEventListener('click', () => {
    say('Jsem Orbit. Když řekneš „Ahoj“, Vafi odpoví podle nálady.');
  }, { passive: true });
  // dvoj-klepnutí na Orbit => lokální notifikace za 5s
box.addEventListener('dblclick', async () => {
  try{
    // povolení
    if (!('Notification' in window)) { alert('Tento prohlížeč neumí notifikace'); return; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { alert('Povol prosím notifikace pro Vafi'); return; }

    // přes Service Worker (sw.js už máš registrovaný v indexu)
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) { alert('Service Worker není registrovaný'); return; }

    await reg.showNotification('Vafi • test', {
      body: 'Ahoj z pozadí. Funguje to ✅',
      tag: 'vafi-test',
      vibrate: [60,80,60],
      badge: './icon-192.png',
      icon: './icon-512.png',
      data: { url: location.href }
    });
  }catch(e){ console.warn(e); }
}, { passive:true });

  // Orbit naslouchá světu
  window.addEventListener('team:pulse', e => {
    const { team } = e.detail || {};
    if (team === 'human') {
      box.textContent = 'Orbit (AI): slyším lidský tlukot 💙';
      say?.('Slyším tě, člověče.');
    } else if (team === 'glyph') {
      box.textContent = 'Orbit (AI): znaky se hýbou... ✴️';
      say?.('Znaky ožívají.');
    } else if (team === 'world') {
      box.textContent = 'Orbit (AI): svět vibruje...';
      say?.('Svět mluví, cítím ho.');
    }
    setTimeout(() => { box.textContent = 'Orbit (AI): připraven'; }, 2500);
  });
}
spawnAIHelper();