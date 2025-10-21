function fnv1a(str){ let h=0x811c9dc5|0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193);} return (h>>>0); }
function prng(seed){ let s=seed>>>0; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return (s>>>0)/0xffffffff; }; }
export class Aether{
  constructor(bus, secret='batole'){ this.bus=bus; this.secret=secret; this.rand=prng(fnv1a(secret)); }
  _mask(bytes){ const out=new Uint8Array(bytes.length); for(let i=0;i<bytes.length;i++){ const r=Math.floor(this.rand()*256)&0xff; out[i]=bytes[i]^r; } return out; }
  send(topic, obj){ const json=JSON.stringify(obj); const enc=this._mask(new TextEncoder().encode(json)); const b64=btoa(String.fromCharCode(...enc)); this.bus.emit('aether:'+topic,{b64}); }
  on(topic, fn){ return this.bus.on('aether:'+topic, ({b64})=>{ const bin=Uint8Array.from(atob(b64), c=>c.charCodeAt(0)); this.rand=prng(fnv1a(this.secret)); const dec=this._mask(bin); try{ const obj=JSON.parse(new TextDecoder().decode(dec)); fn(obj);}catch(e){console.warn('Aether decode fail',e);} }); }
}
