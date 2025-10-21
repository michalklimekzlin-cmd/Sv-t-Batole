export class OrbitAssistant{
  constructor(bus, glview, matter, orbit){
    this.bus=bus; this.view=glview; this.matter=matter; this.orbit=orbit;
    // memory
    this.mem = this._load() || { notes: [], skills: { craft:true, follow:true, speak:true }, lastCenter: null };
  }
  _save(){ try{ localStorage.setItem('orbit_memory', JSON.stringify(this.mem)); }catch(e){} }
  _load(){ try{ return JSON.parse(localStorage.getItem('orbit_memory') || 'null'); }catch(e){ return null; } }
  say(text){
    // HUD
    const intro = document.getElementById('intro');
    if(intro){ intro.textContent = text; }
    // TTS if available
    const s = window.speechSynthesis;
    if(s){ const u = new SpeechSynthesisUtterance(text); u.lang='cs-CZ'; s.cancel(); s.speak(u); }
  }
  onImpulse(pt){
    // remember last center
    this.mem.lastCenter = pt;
    this._save();
  }
  // Very simple "skills"
  craftSquareAtCenter(){
    const rect = this.view.canvas.getBoundingClientRect();
    const px = this.view.canvas.width/2;
    const py = this.view.canvas.height/2;
    // Convert to NDC-ish for matter
    const world = { x: (px/this.view.canvas.width)*2-1, y: -((py/this.view.canvas.height)*2-1) };
    // spend 6 iskra by emitting impulses programmatically (demo)
    for(let i=0;i<6;i++) this.bus.emit('impulse', { pos: world });
    this.say('Stavím čtverec z písmen uprostřed.'); 
  }
  followPointer(px, py){
    // gently reposition orbit to the pointer
    this.orbit.setCenterPx(px, py);
  }
  addNote(text){
    this.mem.notes.push({ t: Date.now(), text });
    while(this.mem.notes.length>100) this.mem.notes.shift();
    this._save();
  }
  handleCommand(raw){
    const s = raw.trim().toLowerCase();
    if(!s) return;
    // extract arguments after keyword
    const after = (kw) => raw.slice(kw.length).trim();
    if(s.startsWith('řekni ') || s.startsWith('rekni ')){
      const msg = after(s.startsWith('řekni ')?'řekni ':'rekni ');
      this.say(msg || 'Ahoj. Jsem Orbit.');
      this.addNote('řekni: '+msg);
      return 'ok';
    }
    if(s.includes('postav') and s.includes('čtverec')){
      this.craftSquareAtCenter();
      this.addNote('postav čtverec');
      return 'ok';
    }
    if(s.includes('následuj') || s.includes('nasleduj')){
      this.say('Jdu s tebou.');
      this.addNote('následuj mě');
      return 'follow';
    }
    // default: store as a note
    this.addNote(raw);
    this.say('Zapsal jsem si to.');
    return 'ok';
  }
}