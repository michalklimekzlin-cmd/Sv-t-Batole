// vafi.js — první Vafi (Duo Vafi)
import { VAF } from './vaf.js';

let imprint = 0; // počítadlo otisků (přiblížení)

const VafiA = { form:"ً&’",   name:"Michal-Vafi" };
const VafiB = { form:"`९נֶ", name:"Kovo-Vafi"   };

function drawVafi(ctx, text, x, y, scale, energy){
  ctx.save();
  ctx.translate(x,y);
  const s = scale*(1+0.05*energy);
  ctx.scale(s,s);
  ctx.rotate((energy-0.5)*0.1);
  ctx.font = "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(200,255,240,${0.75 + 0.25*energy})`;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export const VafiLayer = {
  canvas:null, ctx:null, w:0, h:0,
  init(){
    this.canvas = document.getElementById('canvasVafi');
    this.ctx = this.canvas.getContext('2d');

    const resize = ()=>{
      this.canvas.width  = Math.floor(window.innerWidth  * devicePixelRatio);
      this.canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
      this.w=this.canvas.width; this.h=this.canvas.height;
    };
    resize(); window.addEventListener('resize', resize);

    window.addEventListener('pointerdown', ()=>{ imprint=Math.min(imprint+1,20); VAF.emit('touch'); });

    VAF.onFrame(({t,energy})=>{
      this.ctx.clearRect(0,0,this.w,this.h);
      this.draw(t,energy);
    });
  },
  draw(t, energy){
    const c=this.ctx;
    const w=this.canvas.width/devicePixelRatio;
    const h=this.canvas.height/devicePixelRatio;
    c.save(); c.scale(devicePixelRatio, devicePixelRatio);

    // vzdálenost mezi nimi podle otisků
    const gap = 0.10 * (1 - imprint/25); // 10% → 0

    // (debug značka na první 2s – klidně smaž)
    if (t < 2) { c.fillStyle='rgba(0,255,170,.8)'; c.fillRect(w/2-10, h-40, 20, 20); }

    drawVafi(c, VafiA.form, w*(0.5-gap), h*0.82, 1.6, energy);
    drawVafi(c, VafiB.form, w*(0.5+gap), h*0.82, 1.6, energy);

    c.restore();
  }
};