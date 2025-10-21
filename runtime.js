import { tokenize } from './parser.js';

export function parseWorld(txt){
  // very tiny parser: only reads 'world "<name>" { ... }' and a few keys
  const t = tokenize(txt);
  let i=0;
  function expect(type, val){
    const tk = t[i++];
    if(!tk || tk.type!==type || (val!==undefined && tk.value!==val))
      throw new Error('DSL parse error near '+JSON.stringify(tk));
    return tk;
  }
  function maybe(type, val){
    const tk = t[i];
    if(tk && tk.type===type && (val===undefined || tk.value===val)){ i++; return tk; }
    return null;
  }
  const world = { name:'', medium:{density:0.1, glyphs:".,:'`^~"}, rules:{tick:60} };
  expect('id','world');
  expect('string'); world.name = t[i-1].value;
  expect('{');
  while(!maybe('}')){
    const id = expect('id').value;
    if(id==='medium'){
      expect('id','glyph_field');
      if(maybe('id','density')){ expect('='); world.medium.density = parseFloat(expect('number').value); }
      if(maybe('id','glyphs')){ expect('='); world.medium.glyphs = expect('string').value; }
    }else if(id==='rules'){
      if(maybe('id','tick')){ expect('='); world.rules.tick = parseInt(expect('id').value); }
    }else{
      // skip block/unknown
      // try brace
      if(maybe('{')){ let depth=1; while(depth>0){ if(maybe('{')) depth++; else if(maybe('}')) depth--; else i++; } }
      else { // skip to eol/semicolon-like
        while(i<t.length && t[i].type!=='id' && t[i].type!=='}') i++;
      }
    }
  }
  return world;
}

export class Runtime{
  constructor(ecs, bus, glyph, map){
    this.ecs = ecs; this.bus = bus; this.glyph = glyph; this.map = map;
  }
  build(world){
    // for demo we don't change much yet;
    // hook: could seed glyph density or visual parameters
    // left as placeholder for next iterations
    console.log('World built:', world);
  }
}
