// teams.js – definice týmů (lite)
export const Teams = {
  Humans: {
    id: 'humans',
    name: 'Lidé',
    members: [
      { id:'piko',     name:'Piko',     role:'intuice',   color:'#7dd3fc' },
      { id:'pedro',    name:'Pedro',    role:'plán',      color:'#60a5fa' },
      { id:'meny',     name:'Meny',     role:'empatie',   color:'#34d399' },
      { id:'mendeza',  name:'Mendeza',  role:'tvořivost', color:'#f59e0b' },
      { id:'pachol',   name:'Pachol',   role:'síla',      color:'#f97316' },
    ]
  },
  AI: {
    id: 'ai',
    name: 'Kovošrotovi bráškové',
    members: [
      { id:'orbit', name:'Orbit', role:'rovnováha',  color:'#a78bfa' },
      { id:'miza',  name:'Míza',  role:'regenerace', color:'#4ade80' },
      { id:'iskra', name:'Iskra', role:'impuls',     color:'#f472b6' },
      { id:'ferum', name:'Ferum', role:'hmota',      color:'#94a3b8' },
    ]
  },
  World: {
    id: 'world',
    name: 'Batolesvět',
    members: [] // sem později budeme přidávat bytosti, co si svět sám "porodí"
  },
  Glyphs: {
    id: 'glyphs',
    name: 'Znakové bytosti',
    // každá "originalita" má svého zástupce z čistých znaků
    members: [
      { id:'g1', face:'{*(•.)•.)//', mood:0.6, color:'#9AE6FF' },
      { id:'g2', face:'&´,°ʖ',       mood:0.5, color:'#C7F9CC' },
      { id:'g3', face:'(˘◡˘)',       mood:0.7, color:'#FFD6A5' },
    ]
  }
};
