// voice.io.js — CZ mluvení + (kde to jde) i poslech
let synth = window.speechSynthesis;
let voice = null;

function pickCzechVoice() {
  const list = synth?.getVoices?.() || [];
  // hledáme češtinu
  const cz = list.find(v =>
    (v.lang || '').toLowerCase().startsWith('cs') ||
    /czech|čeština|zuzana|eliška|iveta/i.test(v.name || '')
  );
  return cz || list.find(v => (v.lang || '').toLowerCase().startsWith('sk')) || null;
}

export function initVoice(){
  if (!synth) return;
  const tryPick = () => { voice = pickCzechVoice(); };
  tryPick();
  if (!voice && synth?.onvoiceschanged === null) synth.onvoiceschanged = tryPick;
  // malý test do konzole
  console.log('[voice] CZ voice:', voice?.name || '(fallback)');
}

export function say(text){
  // fallback bez TTS: tichý „ping“, ať appka nepadá
  if (!synth) { console.log('[say]', text); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'cs-CZ';
  u.rate = 1.0;  // rychlost
  u.pitch = 1.0; // výška
  if (voice) u.voice = voice;
  synth.cancel(); // zruš rozjeté věty
  synth.speak(u);
}

/* Volitelné rozpoznávání řeči (ne všude funguje – iOS Safari ne):
   Připravíme API, když není dostupné, nic se nerozbije. */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;

export function startListening(onText){
  if (!SR) return false;           // není podpora
  if (!rec){
    rec = new SR();
    rec.lang = 'cs-CZ';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = e => {
      const t = e.results?.[0]?.[0]?.transcript || '';
      if (t && onText) onText(t);
    };
  }
  rec.start();
  return true;
}