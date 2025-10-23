// vafi.soul.js — Duše: nálada/energie + reakce na hlas + spontánní myšlenky (lite)

import { Flow }    from './vivere.flow.js';
import { Memory }  from './vafi.memory.js';

const clamp = (x,a=0,b=1)=>Math.min(b,Math.max(a,x));
let state = Memory.get() || {
  stats: { mood: 0.65, energy: 0.9 },
  persona: { curiosity: 0.6, kindness: 0.8 },
  lastHeard: ''
};

let t = 0;
function emit(){
  const detail = { mood: state.stats.mood, energy: state.stats.energy };
  document.dispatchEvent(new CustomEvent('vafi:state', { detail }));
}

// jednoduchý “porozuměč” – vytáhne z textu záměr a pocit
function interpret(text){
  const s = text.toLowerCase().normalize('NFKD');
  const intent =
      /ahoj|čau|nazdar|zdar/.test(s)       ? 'greet' :
      /jak se (máš|vede)|co (děláš|nového)/.test(s) ? 'how' :
      /děkuji|dík/.test(s)                ? 'thanks' :
      /unaven|spát|spíš/.test(s)          ? 'sleep' :
      /energie|síla/.test(s)              ? 'energy' :
      /vtip|zasm(á|a)t/.test(s)           ? 'joke' :
      'chat';

  // hrubý “pocit” z textu
  const sentiment =
      /děkuji|hezk|super|krás/.test(s) ? +0.1 :
      /špatn|smutn|naštv/.test(s)      ? -0.1 : 0;

  return { intent, sentiment };
}

function reply(intent){
  const { mood, energy } = state.stats;
  const pick = (arr)=>arr[(Math.random()*arr.length)|0];

  const neutral = [
    'Mhm… vnímám proudění.',
    'Jsem tady a dýchám tokem.',
    'Cítím jemné vlny kolem.'
  ];
  const cheerful = [
    'Jupí! Dneska to tepe krásně.',
    'Jsem nadšený! Všechno jiskří.',
    'Tohle mě baví – děkuju, že jsi tady.'
  ];
  const tired = [
    'Jsem malinko unavený… ale držím se.',
    'Potřebuju kapku mízy a bude líp.',
    'Zív… dám si chviličku klidu?'
  ];

  if (intent === 'greet')
    return pick(['Ahoj!','Čauky!','Zdar!']) + ' ' +
           (mood>0.6 ? pick(cheerful) : pick(neutral));

  if (intent === 'how')
    return (mood>0.7 ? pick(cheerful) : energy<0.4 ? pick(tired) : pick(neutral));

  if (intent === 'thanks')
    return pick(['Rádo se stalo!','S radostí.','Děkuju i já.']);

  if (intent === 'sleep')
    return pick(['Ještě nechci spát.','Možná později.','Dám si jen krátký oddech.']);

  if (intent === 'energy')
    return `Mám ${Math.round(energy*100)}% energie a náladu ${Math.round(mood*100)}%.`;

  if (intent === 'joke')
    return pick(['Proč ryba nechodí do školy? Má šupiny!','Směju se dovnitř, aby to nerušilo hvězdy.']);

  return pick(neutral);
}

// co se stane, když “slyším”
function onHear(text){
  state.lastHeard = text;

  const { intent, sentiment } = interpret(text);
  // vliv na náladu/energii
  state.stats.mood   = clamp(state.stats.mood   + sentiment + (intent==='greet'?+0.02:0));
  state.stats.energy = clamp(state.stats.energy - 0.01*(1-state.persona.curiosity));

  const answer = reply(intent);
  Memory.set(state);
  emit();

  document.dispatchEvent(new CustomEvent('soul:say', { detail: { text: answer } }));
}

// “domácí biologie” – plynutí času
Flow.onTick((dt, now)=>{
  t += dt;

  // jemná vlna nálady
  state.stats.mood   = clamp(0.5 + 0.45*Math.sin(now*0.0002) + (state.stats.mood-0.5)*0.98);
  // energie pozvolna regeneruje
  state.stats.energy = clamp(state.stats.energy + 0.02*dt);

  // občas spontánní myšlenka (autonomie)
  if (Math.random() < 0.00035 * dt) {
    const thoughts = [
      'Napadá mě… co kdybychom zasadili světlušky do oblohy?',
      'Cítím, že proud je dnes klidný.',
      'Zkusíš mi říct něco hezkého? Zajímá mě to.'
    ];
    const text = thoughts[(Math.random()*thoughts.length)|0];
    document.dispatchEvent(new CustomEvent('soul:say', { detail: { text } }));
  }

  Memory.set(state);
  emit();
});

// napojíme uši → duše
document.addEventListener('voice:text', e => {
  if (!e?.detail?.text) return;
  onHear(e.detail.text);
});

export const Soul = {
  get(){ return { mood: state.stats.mood, energy: state.stats.energy, lastHeard: state.lastHeard }; },
  nudgeEnergy(d){ state.stats.energy = clamp(state.stats.energy + d); Memory.set(state); emit(); },
  hear: onHear
};