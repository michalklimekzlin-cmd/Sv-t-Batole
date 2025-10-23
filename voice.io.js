// voice.io.js — mluvení česky + jednoduché rozpoznání (kde je k dispozici)
let synth = window.speechSynthesis; let voice = null;

function pickCzech(){
  const list = synth?.getVoices?.() || [];
  return list.find(v => (v.lang||'').toLowerCase().startsWith('cs')) ||
         list.find(v => /czech|čeština/i.test(v.name||'')) || null;
}
export function initVoice(){
  if (!synth) return;
  const set = ()=>{ voice = pickCzech(); };
  set(); if (!voice && synth?.onvoiceschanged === null) synth.onvoiceschanged = set;
}
export function say(text){
  if (!synth){ console.log('[say]', text); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang='cs-CZ'; u.rate=1.0; u.pitch=1.0; if (voice) u.voice=voice; synth.cancel(); synth.speak(u);
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let rec=null;
export function startListening(onText){
  if (!SR) return false;
  if (!rec){ rec=new SR(); rec.lang='cs-CZ'; rec.interimResults=false; rec.continuous=false;
    rec.onresult=e=>{ const t=e.results?.[0]?.[0]?.transcript||''; if (t&&onText) onText(t); };
  } rec.start(); return true;
}