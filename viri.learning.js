// viri.learning.js
// "Mozek" Viriho – učí se z hlasů, vizí a zpětné vazby

import { Bus } from './events.core.js?v=' + window.V;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export function initViriLearning(viriForm) {
  const state = {
    trust: { batole: 0.6, glyph: 0.5, ai: 0.5, pedro: 0.5 },
    mood: { anxiety: 0.2, calm: 0.5, focus: 0.5 },
    hallu: 0.3 // míra halucinací (0–1)
  };

  function pushMix() {
    const t = state.trust, m = state.mood;
    const norm = t.batole + t.glyph + t.ai + t.pedro || 1;
    viriForm.setMix({
      batolesvet: clamp(t.batole / norm * (0.8 + 0.4 * m.calm)),
      glyph: clamp(t.glyph / norm * (0.8 + 0.4 * m.focus)),
      ai: clamp(t.ai / norm * (0.8 + 0.3 * (1 - m.anxiety))),
      pedrovci: clamp(t.pedro / norm * (0.8 + 0.4 * (m.calm - m.anxiety)))
    });
  }

  // 🔊 Hlas – učí důvěru
  Bus.addEventListener('voice', e => {
    const { team, weight = 0 } = e.detail || {};
    if (!state.trust.hasOwnProperty(team)) return;
    state.trust[team] = clamp(state.trust[team] + 0.08 * weight);
    state.mood.anxiety = clamp(state.mood.anxiety - 0.04 * weight * -1);
    state.mood.calm = clamp(state.mood.calm + 0.04 * weight);
    pushMix();
  });

  // 👁️ Vize – posouvá halucinace
  Bus.addEventListener('vision', e => {
    const { truth = 0.5 } = e.detail || {};
    state.hallu = clamp(state.hallu + (truth < 0.5 ? +0.02 : -0.02));
    pushMix();
  });

  // 💬 Zpětná vazba – potvrzení/odmítnutí
  Bus.addEventListener('feedback', e => {
    const { trueVision } = e.detail || {};
    state.hallu = clamp(state.hallu + (trueVision ? -0.05 : +0.05));
    state.mood.calm = clamp(state.mood.calm + (trueVision ? +0.05 : -0.03));
    pushMix();
  });

  // 💭 Nálady – jemné vlnění
  Bus.addEventListener('mood', e => {
    const { anxiety = 0, calm = 0, focus = 0 } = e.detail || {};
    state.mood.anxiety = clamp(state.mood.anxiety + anxiety);
    state.mood.calm = clamp(state.mood.calm + calm);
    state.mood.focus = clamp(state.mood.focus + focus);
    pushMix();
  });

  // 🌱 Ground – zklidnění
  Bus.addEventListener('ground', () => {
    state.mood.calm = clamp(state.mood.calm + 0.15);
    state.mood.anxiety = clamp(state.mood.anxiety - 0.15);
    state.hallu = clamp(state.hallu - 0.08);
    pushMix();
  });

  // inicializace
  pushMix();

  // přístup přes konzoli
  window.VIRI_LEARN = { state, pushMix };
}