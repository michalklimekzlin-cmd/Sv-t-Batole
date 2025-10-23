// loader.js — jeden přepínač verze pro všechny moduly
const V = '2025-10-23-22h'; // <<< až příště něco změníš, přepiš JEN tento řetězec

// pořadí musí zůstat: engine -> voice -> soul -> avatar -> app
async function boot() {
  await import(`./vafi.engine.js?v=${V}`);

  const voice = await import(`./voice.io.js?v=${V}`);
  voice.initVoice();
  setTimeout(()=>voice.say('Jsem vzhůru. Zkus mě ťuknout, nebo promluv.'), 800);

  await import(`./vafi.soul.js?v=${V}`);
  await import(`./avatar.vafi.js?v=${V}`);
  await import(`./app.js?v=${V}`);
}
boot().catch(err => console.error('Boot error:', err));
