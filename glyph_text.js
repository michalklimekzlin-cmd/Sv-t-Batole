const VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 iTranslate;
layout(location=2) in float iScale;
layout(location=3) in vec4 iUV;
layout(location=4) in float iAlpha;
uniform vec2 uRes;
out vec2 vUV;
out float vAlpha;
void main(){
  vec2 pixel = aPos * iScale;
  vec2 ndc = vec2(
    ( (iTranslate.x + pixel.x) / uRes.x ) * 2.0 - 1.0,
    ( (iTranslate.y + pixel.y) / uRes.y ) * -2.0 + 1.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
  vec2 uv = mix(iUV.xy, iUV.zw, aPos*0.5+0.5);
  vUV = uv;
  vAlpha = iAlpha;
}`;

const FS = `#version 300 es
precision highp float;
in vec2 vUV;
in float vAlpha;
uniform sampler2D uTex;
out vec4 outColor;
void main(){
  vec4 s = texture(uTex, vUV);
  float a = s.r * vAlpha;
  if(a < 0.05) discard;
  vec3 col = mix(vec3(0.85,0.95,1.0), vec3(0.6,0.9,1.0), 0.2);
  outColor = vec4(col, a);
}`;

export class GlyphText{
  constructor(glview, atlas){
    this.view=glview; this.gl=glview.gl; this.atlas=atlas; this._init();
  }
  _init(){
    const gl=this.gl;
    this.prog=this.view.createProgram(VS, FS);
    this.uRes=gl.getUniformLocation(this.prog,'uRes');
    this.uTex=gl.getUniformLocation(this.prog,'uTex');
    const quad=new Float32Array([ -0.5,-0.5,  0.5,-0.5,  -0.5,0.5,  0.5,0.5 ]);
    this._quad=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,this._quad); gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    this.bTranslate=gl.createBuffer(); this.bScale=gl.createBuffer(); this.bUV=gl.createBuffer(); this.bAlpha=gl.createBuffer();
    this.count=0;
  }
  setInstances(inst){
    const gl=this.gl; this.count=inst.length;
    const translate=new Float32Array(this.count*2);
    const scale=new Float32Array(this.count);
    const uv=new Float32Array(this.count*4);
    const alpha=new Float32Array(this.count);
    for(let i=0;i<this.count;i++){
      const it=inst[i];
      translate[i*2]=it.x; translate[i*2+1]=it.y;
      scale[i]=it.scale;
      uv[i*4]=it.uv[0]; uv[i*4+1]=it.uv[1]; uv[i*4+2]=it.uv[2]; uv[i*4+3]=it.uv[3];
      alpha[i]=it.alpha ?? 1.0;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bTranslate); gl.bufferData(gl.ARRAY_BUFFER, translate, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bScale); gl.bufferData(gl.ARRAY_BUFFER, scale, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bUV); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bAlpha); gl.bufferData(gl.ARRAY_BUFFER, alpha, gl.DYNAMIC_DRAW);
  }
  draw(){
    const gl=this.gl; if(this.count===0) return;
    gl.useProgram(this.prog);
    gl.uniform2f(this.uRes, this.view.canvas.width, this.view.canvas.height);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.atlas.tex); gl.uniform1i(this.uTex, 0);
    const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,this._quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,8,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bTranslate); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,8,0); gl.vertexAttribDivisor(1,1);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bScale); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,1,gl.FLOAT,false,4,0); gl.vertexAttribDivisor(2,1);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bUV); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3,4,gl.FLOAT,false,16,0); gl.vertexAttribDivisor(3,1);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bAlpha); gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4,1,gl.FLOAT,false,4,0); gl.vertexAttribDivisor(4,1);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);
    gl.bindVertexArray(null); gl.deleteVertexArray(vao);
  }
}
