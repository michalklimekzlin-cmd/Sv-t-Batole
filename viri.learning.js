// viri.learning.js
import { Bus } from './events.core.js?v='+window.V;

const clamp = (x, a=0, b=1)=> Math.max(a, Math.min(b, x));

export function initViriLearning(viriForm){
  const state = {
    trust:   {batole:0.6, glyph:0.5, ai:0.5, pedro:0.5},
    mood:    {anxiety:0.2, calm:0.5, focus:0.5},
    hallu:   0.30,    // bias k halucinacím (vyšší = víc falešných vizí)
  };

  // pomocná: přemapuje stav → mix do viri.form
  function pushMix(){
    // důvěra funguje jako váhy; nálady mírně modulují
    const t = state.trust, m = state.mood;
    const norm = t.batole + t.glyph + t.ai + t.pedro || 1;
    viriForm.setMix({
      batolesvet: clamp(t.batole / norm * (0.8 + 0.4*m.calm)),
      glyph:      clamp(t.glyph  / norm * (0.8 + 0.4*m.focus)),
      ai:         clamp(t.ai     / norm * (0.8 + 0.3*(1-m.anxiety))),
      pedrovci:   clamp(t.pedro  / norm * (0.8 + 0.4*(m.calm - m.anxiety)))
    });
  }

  // HLASY (rady z rohů) učí důvěru
  Bus.addEventListener('voice', e=>{
    const {team, weight=0} = e.detail||{};
    if(!state.trust.hasOwnProperty(team)) return;
    state.trust[team] = clamp(state.trust[team] + 0.08*weight);
    // hlas taky ovlivní náladu
    state.mood.anxiety = clamp(state.mood.anxiety - 0.04*weight*-1);
    state.mood.calm    = clamp(state.mood.calm    + 0.04*weight);
    pushMix();
  });

  // VIZE: generujeme (nebo někdo pošle) – tady jen upravíme bias dle “pravdivosti”
  Bus.addEventListener('vision', e=>{
    const {truth=0.5} = e.detail||{};
    state.hallu = clamp(state.hallu + (truth<0.5 ? +0.02 : -0.02));
    pushMix();
  });

  // ZPĚTNÁ VAZBA hráče/týmu – potvrzení/odmítnutí vize
  Bus.addEventListener('feedback', e=>{
    const {trueVision} = e.detail||{};
    state.hallu = clamp(state.hallu + (trueVision ? -0.05 : +0.05));
    // “grounding” za pravdu zvedá klid
    state.mood.calm = clamp(state.mood.calm + (trueVision? +0.05 : -0.03));
    pushMix();
  });

  // Nálady přímo
  Bus.addEventListener('mood', e=>{
    const {anxiety=0, calm=0, focus=0} = e.detail||{};
    state.mood.anxiety = clamp(state.mood.anxiety + anxiety);
    state.mood.calm    = clamp(state.mood.calm    + calm);
    state.mood.focus   = clamp(state.mood.focus   + focus);
    pushMix();
  });

  Bus.addEventListener('ground', ()=>{
    state.mood.calm = clamp(state.mood.calm + 0.15);
    state.mood.anxiety = clamp(state.mood.anxiety - 0.15);
    state.hallu = clamp(state.hallu - 0.08);
    pushMix();
  });

  // počáteční “push”
  pushMix();

  // pro debug
  window.VIRI_LEARN = {state, pushMix};
}
