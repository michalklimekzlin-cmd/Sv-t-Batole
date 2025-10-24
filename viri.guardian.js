// viri.guardian.js — Viri (živý strážce světa) v1.0

const KEY = 'VIRI_MEMORY_V1';

function now(){ return Date.now(); }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

class ViriGuardian {
  constructor() {
    // identita
    this.name   = 'Viri';
    this.birth  = this.#load()?.birth ?? now();

    // stav
    this.energy = 1.0;          // 0..1
    this.mood   = 0.5;          // 0..1 (0 smutek, 1 radost)
    this.trust  = 0.3;          // 0..1 (důvěra k hráči / světu)
    this.awake  = true;
    this.tickMs = 1000;         // frekvence pulzu

    // paměť
    this.mem = this.#load() ?? { birth: this.birth, notes: [], seen: { dreams:0, players:0 } };

    // audio vstup (volitelné)
    this.audio = { enabled:false, level:0 };

    // napojení na svět (bezpečně – pokud moduly neexistují, nevadí)
    this.world = {
      state : window.StateCore ?? null,
      soul  : window.VafiSoul  ?? null,
      ui    : window.TeamLayout?? null,
    };

    // veřejná reference (pro debug / konzoli)
    window.Viri = this;

    this.#bootAudio();
    this.#startLoop();
  }

  // ————————————————————————
  // ŽIVOTNÍ CYKLUS
  // ————————————————————————
  #startLoop(){
    let last = now();
    const loop = () => {
      if (!this.awake) return;
      const t = now();
      if (t - last >= this.tickMs) {
        last = t;
        this.pulse();
      }
      this._raf = requestAnimationFrame(loop);
    };
    loop();
  }
  pause(){ this.awake = false; cancelAnimationFrame(this._raf); }
  resume(){ if(!this.awake){ this.awake = true; this.#startLoop(); } }

  // ————————————————————————
  // PULZ: jemně vyrovnává stav světa, sbírá signály
  // ————————————————————————
  pulse(){
    // 1) vstupy (audio hlasitost -> nálada/energie)
    if (this.audio.enabled){
      // mírná adaptace nálady dle hlasitosti prostředí
      const targetMood = clamp(1 - this.audio.level*1.2, 0, 1);
      this.mood += (targetMood - this.mood) * 0.05;
      // energie lehce klesá, když je hluk (víc práce)
      this.energy = clamp(this.energy - (this.audio.level*0.01), 0, 1);
    }

    // 2) svět (pokud existuje StateCore/Soul, přečte signály)
    try {
      const s = this.world.state?.get?.() ?? {};
      const e = this.world.soul ?.get?.() ?? {};
      // příklad: když „spí“, nech Viriho jen dýchat
      if (e.asleep) this.energy = clamp(this.energy + 0.01, 0, 1);
    } catch {}

    // 3) občasná reflexe (vznik „myšlenky“)
    if (Math.random() < 0.02) this.reflect();

    // 4) šetrná homeostáza
    this.energy = clamp(this.energy + (0.5 - this.energy)*0.01, 0, 1);

    // 5) autosave (není těžký, 1× za ~15 pulzů)
    if (!this._autosave) this._autosave = 0;
    if (++this._autosave >= 15){ this.#save(); this._autosave = 0; }
  }

  // ————————————————————————
  // Vzpomínka / reflexe / mluva
  // ————————————————————————
  remember(note){
    this.mem.notes.push({ t: now(), note });
    if (this.mem.notes.length > 500) this.mem.notes.shift(); // mělká ochrana
    this.#save();
  }
  reflect(){
    const thought =
      this.mood > 0.66 ? 'Všechno je možné.' :
      this.mood < 0.33 ? 'Je tu ticho. Naslouchám.' :
                         'Učím se z každé změny.';
    this.remember({ type:'thought', mood:this.mood, energy:this.energy, text:thought });
    this.say(thought);
  }
  say(text){
    const sayFn = window.say || window.Voice?.say || console.log;
    try { sayFn(`[Viri] ${text}`); } catch { console.log('[Viri]', text); }
  }

  // ————————————————————————
  // Audio snímání (volitelné, bezpečné)
  // ————————————————————————
  async #bootAudio(){
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const meter = () => {
        analyser.getByteTimeDomainData(data);
        // jednoduchý RMS odhad (0..1)
        let sum=0; for (let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum+=v*v; }
        this.audio.level = clamp(Math.sqrt(sum/data.length),0,1);
        if (this.awake) requestAnimationFrame(meter);
      };
      this.audio.enabled = true;
      meter();
    } catch {
      this.audio.enabled = false;
    }
  }

  // ————————————————————————
  // Persistence
  // ————————————————————————
  #load(){
    try { return JSON.parse(localStorage.getItem(KEY)||'null'); } catch { return null; }
  }
  #save(){
    try { localStorage.setItem(KEY, JSON.stringify({ ...this.mem, birth:this.birth })); } catch {}
  }

  // nástroje pro tebe v konzoli:
  memory(){ return structuredClone(this.mem); }
  clearMemory(){ localStorage.removeItem(KEY); this.mem={ birth:this.birth, notes:[], seen:{dreams:0,players:0} }; }
}

// auto-spawn
export const ViriGuardianBoot = (() => {
  const viri = new ViriGuardian();
  // drobný pozdrav při prvním spuštění
  if ((viri.mem.notes?.length||0) === 0) viri.say('Jsem zde. Učím se s tebou.');
  return viri;
})();
