// team.ai.js — Tým 2: AI (Orbit — vnitřní pomocník)
export async function spawnAIHelper() {
  let say = (t) => console.log('[Orbit]', t);

  // volitelný hlas
  try {
    ({ say } = await import(`./voice.io.js?v=${window.V||89}`));
  } catch {}

  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    padding: '.45rem .6rem',
    border: '1px solid rgba(160,140,240,.6)',
    borderRadius: '.6rem',
    background: 'rgba(18,16,30,.6)',
    backdropFilter: 'blur(6px) saturate(120%)',
    color: '#e7deff',
    font: '600 12px/1 system-ui',
    pointerEvents: 'auto',
    zIndex: 10
  });

  box.textContent = 'Orbit (AI): připraven';
  box.title = 'Klepni — Orbit poradí';
  document.body.appendChild(box);

  // běžná interakce — kliknutí = pulz
  box.addEventListener('click', () => {
    window.MK?.pulse('ai', 0.1);
    say('Jsem Orbit. Když řekneš „Ahoj“, Vafi odpoví podle nálady.');
  }, { passive: true });

  // 🟢 TEST: dvojklepnutí → lokální notifikace z pozadí
  box.addEventListener('dblclick', async () => {
    try {
      if (!('Notification' in window)) {
        alert('Tento prohlížeč neumí notifikace');
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        alert('Povol prosím notifikace pro Vafi');
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        alert('Service Worker není registrovaný');
        return;
      }

      await reg.showNotification('Vafi • test', {
        body: 'Ahoj z pozadí. Funguje to ✅',
        tag: 'vafi-test',
        vibrate: [60, 80, 60],
        badge: './icon-192.png',
        icon: './icon-512.png',
        data: { url: location.href }
      });
    } catch (e) {
      console.warn('Notifikace selhala:', e);
    }
  }, { passive: true });
}