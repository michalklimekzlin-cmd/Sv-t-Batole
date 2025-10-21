export class GlyphAtlas{
  constructor(gl, opts={}){
    this.gl=gl;
    this.size=opts.size||512;
    this.cell=opts.cell||32;
    this.font=opts.font||'20px monospace';
    this.range=opts.range||[32,126];
    this.cols=Math.floor(this.size/this.cell);
    this.rows=Math.floor(this.size/this.cell);
    const cvs=document.createElement('canvas'); cvs.width=this.size; cvs.height=this.size; this.canvas=cvs; const ctx=cvs.getContext('2d'); this.ctx=ctx;
    ctx.fillStyle='black'; ctx.fillRect(0,0,this.size,this.size);
    ctx.fillStyle='white'; ctx.font=this.font; ctx.textAlign='center'; ctx.textBaseline='middle';
    const [a,b]=this.range;
    for(let code=a; code<=b; code++){ const i=code-a; const cx=(i%this.cols)*this.cell+this.cell/2; const cy=Math.floor(i/this.cols)*this.cell+this.cell/2; ctx.fillText(String.fromCharCode(code), cx, cy); }
    const gl=this.gl;
    const tex=gl.createTexture(); this.tex=tex;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cvs);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  uvForChar(code){
    const [a,b]=this.range;
    const i = Math.max(0, Math.min(code-a, b-a));
    const c = i % this.cols;
    const r = Math.floor(i / this.cols);
    const u0=(c*this.cell)/this.size, v0=(r*this.cell)/this.size;
    const du=this.cell/this.size, dv=this.cell/this.size;
    return [u0,v0,u0+du,v0+dv];
  }
}
