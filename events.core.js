// events.core.js – mini event-bus + napojení na ViriXP
export const EVENTS = {
  subs: [],
  emit(type, payload){ this.subs.forEach(fn=>fn(type,payload)); },
  on(fn){ this.subs.push(fn); },

  // sémantické pomocníky
  voice({team='glyph', text='', weight=0.5}){ this.emit('voice',{team,text,weight}); },
  mood ({calm=0, anxiety=0, team='pedrovci'}){ this.emit('mood',{calm,anxiety,team}); },
  ground(){ this.emit('ground',{}); },
  vision({kind='symbol', truth=1, ttl=2000}){ this.emit('vision',{kind,truth,ttl}); },
};

// připojí EVENTS k XP enginu
export function initViriLearning(xp){
  EVENTS.on((type,p)=>{
    if(type==='voice'){
      xp.add({team:p.team, value: Math.max(0.1, p.weight||0.1)});
    }
    if(type==='mood'){
      xp.mood.calm     = clamp(xp.mood.calm     + p.calm    , 0, 1);
      xp.mood.anxiety  = clamp(xp.mood.anxiety  + p.anxiety , 0, 1);
      xp.add({team:p.team, value: Math.abs(p.calm - p.anxiety)*0.8});
    }
    if(type==='ground'){
      // „uzemnění“ lehce přesune váhu k batolesvět
      xp.add({team:'batolesvet', value:0.8});
    }
    if(type==='vision'){
      xp.add({team:(p.kind==='path'?'ai':'glyph'), value:0.6*(p.truth?1:0.2)});
    }
  });
}
function clamp(x,a,b){ return Math.max(a, Math.min(b,x)); }