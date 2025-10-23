// voice.io.js — uši & ústa Vafiho
// Jednoduchý rozpoznávač řeči + syntéza (čeština) + eventy

const hasASR = typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

let recognizer;
let listening = false;

export function initVoice(){
  // posloucháme, co chce Duše říct
  document.addEventListener('soul:say', e => {
    if (e?.detail?.text) say(e.detail.text);
  });

  if (!hasASR) {
    console.warn('ASR není k dispozici – použij klikání/psaní.');
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognizer = new SR();
  recognizer.lang = 'cs-CZ';
  recognizer.interimResults = false;
  recognizer.continuous = false;

  recognizer.onresult = (ev) => {
    const text = Array.from(ev.results)
      .map(r => r[0]?.transcript || '')
      .join(' ')
      .trim();
    if (text) {
      // pošleme do světa – Duše si to vezme
      document.dispatchEvent(new CustomEvent('voice:text', { detail: { text } }));
    }
  };
  recognizer.onend = () => {
    listening = false;
  };
}

export function startListening(){
  if (!recognizer || listening) return;
  try { recognizer.start(); listening = true; } catch(_){}
}

export function say(text){
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'cs-CZ';
    u.pitch = 1; u.rate = 1; u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch(_){}
}

// malé UX: klepnutí do stránky spustí poslech (když je k dispozici)
window.addEventListener('click', () => startListening(), { passive:true });