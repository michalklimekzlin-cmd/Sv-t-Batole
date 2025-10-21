// GlyphField kept for AI sampling / potential debug, but not rendered to player
const VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in float aSeed;
uniform vec2 uRes;
uniform float uTime;
out float vSeed;
void main(){
  vSeed = aSeed;
  float j = sin(uTime*0.7 + aSeed*17.0)*0.008;
  vec2 p = aPos + vec2(j, -j*0.8);
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = 2.0 + fract(aSeed*97.0)*2.0;
}`;

const FS = `#version 300 es
precision highp float;
in float vSeed;
out vec4 outColor;
void main(){
  float a = smoothstep(1.0, 0.0, length(gl_PointCoord - vec2(0.5)));
  vec3 col = vec3(0.0); // invisible if not drawn
  outColor = vec4(col, 0.0);
}`;

export class GlyphField{
  constructor(glview){
    this.view = glview;
    this.gl = glview.gl;
    this.time = 0;
    this._init();
    this.enabled = false; // hidden by default
  }
  _init(){
    const gl = this.gl;
    this.prog = this.view.createProgram(VS, FS);
    this.uRes = gl.getUniformLocation(this.prog, 'uRes');
    this.uTime = gl.getUniformLocation(this.prog, 'uTime');
    const N = 2000;
    const pos = new Float32Array(N*2);
    const seed = new Float32Array(N);
    for(let i=0;i<N;i++){
      pos[i*2+0] = Math.random()*2-1;
      pos[i*2+1] = Math.random()*2-1;
      seed[i] = Math.random();
    }
    this.count = N;
    this.pos = pos;
    this.seed = seed;
  }
  // AI can sample field as noise source (not rendered)
  sampleNoise(i){
    const s = this.seed[i % this.seed.length];
    const t = this.time;
    return Math.sin(t*0.7 + s*17.0);
  }
  renderParticles(){
    if(!this.enabled) return; // hidden
    const gl = this.gl;
    this.time += 0.016;
    // Lazy create VAO if needed
    if(!this.vao){
      const pos = this.pos, seed = this.seed;
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const seedBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
      gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
    }
    this.time += 0.016;
    gl.useProgram(this.prog);
    gl.uniform2f(this.uRes, this.view.canvas.width, this.view.canvas.height);
    gl.uniform1f(this.uTime, this.time);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }
}
