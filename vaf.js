// vaf.js — Vivere atque frui (nevyčerpatelný zdroj bytí)
// Jediný plynulý proud času/bytí, bez spotřeby. Reaguje na komunikaci, ale na ní nezávisí.

export const VAF = {
  started: false,
  t0: 0,
  t: 0,          // čas v sekundách od startu (přítomnost)
  bpm: 60,       // „tepo-mluva“ (jemně modulovatelná komunikací)
  _beatT: 0,     // akumulátor pro beaty
  _frameSubs: [],
  _beatSubs: [],
  _raf: null,

  start() {
    if (this.started) return;
    this.started = true;
    this.t0 = performance.now();

    const loop = (now) => {
      this.t = (now - this.t0) / 1000;

      // Výpočet „energie“ a fáze – čistý, samoudržující se zdroj
      const secPerBeat = 60 / this.bpm;
      this._beatT += (1 / 60); // referenční čas pro beaty (60fps pocitově, ale zdroj běží nezávisle)
      const energy = 0.5 + 0.5 * Math.sin((2 * Math.PI * this._beatT) / secPerBeat);

      // CSS proměnné pro celý svět (může číst kdokoliv v UI)
      const root = document.documentElement;
      root.style.setProperty('--vaf-time', this.t.toFixed(3));
      root.style.setProperty('--vaf-energy', energy.toFixed(3));   // 0..1
      root.style.setProperty('--vaf-bpm', this.bpm.toFixed(2));

      // Beat event (kdykoliv překročíme další práh)
      if (this._beatT >= secPerBeat) {
        this._beatT -= secPerBeat;
        document.dispatchEvent(new CustomEvent('vaf:beat', { detail: { t: this.t, bpm: this.bpm } }));
        for (const fn of this._beatSubs) try { fn({ t: this.t, bpm: this.bpm }); } catch {}
      }

      // Frame event (plynulé dýchání)
      document.dispatchEvent(new CustomEvent('vaf:frame', { detail: { t: this.t, energy } }));
      for (const fn of this._frameSubs) try { fn({ t: this.t, energy }); } catch {}

      this._raf = requestAnimationFrame(loop);
    };

    this._raf = requestAnimationFrame(loop);
  },

  stop() {
    if (!this.started) return;
    cancelAnimationFrame(this._raf);
    this._raf = null;
    this.started = false;
  },

  onFrame(fn) { this._frameSubs.push(fn); },
  onBeat(fn) { this._beatSubs.push(fn); },

  // Komunikace jemně modulují BPM (nikdy nezastaví zdroj, nikdy ho „nevyčerpají“)
  emit(kind, payload) {
    document.dispatchEvent(new CustomEvent('vaf:emit', { detail: { kind, payload } }));
    // Hebká modulace – krátký „nádech“
    if (kind === 'word' || kind === 'touch' || kind === 'sound' || kind === 'creation') {
      const delta = 2; // drobné zvýšení
      this._bumpBPM(delta, 900); // za ~0.9 s se vrátí
    }
  },

  _bumpBPM(delta, ms) {
    const before = this.bpm;
    this.bpm = Math.max(30, Math.min(180, before + delta));
    // návrat k původní hodnotě
    setTimeout(() => {
      // plynulý návrat
      const step = () => {
        const d = this.bpm - before;
        if (Math.abs(d) < 0.1) { this.bpm = before; return; }
        this.bpm -= d * 0.25;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, ms);
  },

  // Uživatelské „senzory“ – přesměruj interakce do zdroje
  attachSensors() {
    const emitTouch = () => this.emit('touch');
    window.addEventListener('pointerdown', emitTouch, { passive: true });
    window.addEventListener('keydown', () => this.emit('word'), { passive: true });
    // Můžeš přidat i mikrofon → pak volat this.emit('sound')
  }
};