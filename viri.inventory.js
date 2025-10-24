// Malý HUD „Deník/Inventář“ – tipy + procenta
const $ = (s)=>document.querySelector(s);

function ensureHud(){
  let el = $('#hudLog');
  if(el) return el;
  el = document.createElement('div');
  el.id='hudLog';
  document.body.appendChild(el);
  return el;
}
const pct = x => Math.round((x||0)*100);

function tipsFor(mix){
  const dom = Object.entries(mix).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'batolesvet';
  const t = {
    batolesvet: ['Zapiš si poznatek – paměť živí Viriho.', 'Drž klidný puls.'],
    glyph: ['Zkus poslat symbol → nebo ☼', 'Stručná zpráva pomůže týmu.'],
    ai: ['Navrhni další krok: „prozkoumej východ“', 'Ověř hypotézu a pošli hlas.'],
    pedrovci: ['Popiš pocit – Viri se učí z emocí.', 'Změň prostředí a sleduj reakci.'],
  };
  return t[dom];
}

export async function buildInventory(state){
  const el = ensureHud();
  const mix = state.mix||{};
  const lines = [
    `🧭 fáze: <b>${state.label||'…'}</b>`,
    `🧪 mix → B:${pct(mix.batolesvet)}% • G:${pct(mix.glyph)}% • AI:${pct(mix.ai)}% • P:${pct(mix.pedrovci)}%`,
    ...tipsFor(mix).map(x=>'• '+x),
  ];
  el.innerHTML = lines.join('<br>');
  return { at:Date.now(), mix, label:state.label };
}