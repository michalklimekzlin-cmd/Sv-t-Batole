// voice.io.js — jednoduchý hlas Vafi (TTS) + pokus o poslech (STT)
export function say(text){
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'cs-CZ';
    u.rate = 1.0; u.pitch = 1.05;
    speechSynthesis.cancel(); // zruš případné předchozí
    speechSynthesis.speak(u);
  }catch(e){}
}

export function initVoice(){
  // tlačítko pro manuální prompt (když není STT)
  let btn = document.getElementById('vafiTalk');
  if (!btn){
    btn = document.createElement('button');
    btn.id = 'vafiTalk';
    btn.textContent = 'Řekni mi něco';
    btn.style.cssText = 'position:fixed;right:1rem;top:1rem;z-index:6;background:#111;color:#e8fff6;border:1px solid #333;border-radius:.6rem;padding:.4rem .6rem;opacity:.7';
    btn.onclick = ()=> {
      // kontextová věta podle stavu
      const mood = +(document.getElementById('moodPct')?.textContent||'60');
      const asleep = (document.getElementById('vafiStatus')?.textContent||'').includes('spí');
      const line = asleep ? 'Ještě chvilku spím…' :
        mood>75 ? 'Cítím jiskru! Co postavíme dál?' :
        mood<35 ? 'Je mi trochu smutno. Bude pohlazení?' :
        'Jsem v klidu. Co zkusíme společně vytvořit?';
      say(line);
    };
    document.body.appendChild(btn);
  }

  // STT, pokud je k dispozici (lépe funguje v Chrome)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return; // iOS Safari to často nemá → zůstane TTS

  const rec = new SR();
  rec.lang = 'cs-CZ';
  rec.continuous = false;
  rec.interimResults = false;

  btn.textContent = '🎤 Poslouchám… (ťukni)';
  btn.onclick = ()=>{
    try { rec.start(); } catch(e){}
  };
  rec.onresult = (e)=>{
    const text = (e.results[0][0].transcript||'').toLowerCase();
    handleCommand(text);
  };
  rec.onerror = ()=>{};
  rec.onend = ()=>{};
}

function handleCommand(text){
  // velmi jednoduché „příkazy“ – můžeme rozšířit
  if (text.includes('spát') || text.includes('spi')) {
    dispatchEvent(new CustomEvent('vafi:toggleSleep')); // viz patch níže
    say('Dobrou… zzz');
    return;
  }
  if (text.includes('radost') || text.includes('mám radost') || text.includes('pohlazení')){
    dispatchEvent(new CustomEvent('vafi:pet'));
    say('Děkuju! To hřeje.');
    return;
  }
  if (text.includes('co chceš') || text.includes('co bys chtěl')){
    say('Postav mi kamaráda. Třeba Mízu. Ať si můžeme povídat.');
    return;
  }
  // fallback
  say('Slyším tě. Zkus mi dát pohlazení nebo mě uspat dlouhým stiskem.');
}
