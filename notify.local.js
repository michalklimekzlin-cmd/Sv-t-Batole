// notify.local.js — lokální notifikace a fallback .ics
async function ensurePerm(){
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

function localNotify(title, body){
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    // ukázat notifikaci (Foreground i jako PWA)
    new Notification(title, { body });
    // jemná vibrace (pokud je podporovaná)
    if (navigator.vibrate) navigator.vibrate([60,30,60]);
    // pokud máme SW, požádej jeho registraci o zobrazení (lepší na pozadí)
    if (navigator.serviceWorker?.registration) {
      navigator.serviceWorker.registration.showNotification(title, { body, vibrate:[60,30,60] });
    }
  } catch {}
}

// Fallback: vytvoř .ics „Připomínka“ (když není povol. Notification)
function downloadICS(summary, minutesFromNow=1){
  const dt = new Date(Date.now() + minutesFromNow*60000);
  const dtstamp = dt.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const dtend   = new Date(dt.getTime()+5*60000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Batolesvět//CZ',
    'BEGIN:VEVENT',
    'UID:'+crypto.randomUUID(),
    'DTSTAMP:'+dtstamp,
    'DTSTART:'+dtstamp,
    'DTEND:'+dtend,
    'SUMMARY:'+summary,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'batolesvet-reminder.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}

// Když Vafi požádá o pomoc → tiché upozornění
window.addEventListener('vafi:ask-help', async ()=>{
  const ok = await ensurePerm();
  if (ok) {
    localNotify('Vafi', 'Brácho, mohl bys mi teď pomoct?');
  } else {
    // fallback do kalendáře (1 minuta od teď)
    downloadICS('Vafi: potřebuje pomoc (jemně)');
  }
});

// můžeš si spustit test z konzole:
// window.dispatchEvent(new CustomEvent('vafi:ask-help'));
