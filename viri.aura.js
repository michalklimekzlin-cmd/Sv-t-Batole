// viri.aura.js — digitální „kouř“ z písmen a znaků (aura nad Virim)
export function startViriAura(canvas){
  const ctx = canvas.getContext('2d');
  let w=0,h=0,t=0, energy=0;

  const letters = ('VIRI 01 <> {} [] () / \\ ✶ ✦ ✧ → ← ↑ ↓ ∴ ∵ α β γ '+
                   'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z '+
                   '0 1 2 3 4 5 6 7 8 9').split(/\s+/);

  const P = [];
  function spawn(n=80){
    for(let i=0;i<n;i++){
      P.push(makeParticle());
    }
  }
  function makeParticle(){
    const angle = Math.random()*Math.PI*2;
    const radius = Math.random()*Math.min(w,h)*0.12 + Math.min(w,h)*0.05;
    return {
      x: w/2 + Math.cos(angle)*radius,
      y: h/2 + Math.sin(angle)*radius,
      r: radius,
      a: angle,
      s: 0.4 + Math.random()*1.2,       // rychlost
      l: letters[(Math.random()*letters.length)|0],
      o: 0.25 + Math.random()*0.5,       // neprůhlednost
      z: Math.random()*0.6 + 0.4,        // „hloubka“
    };
  }

  function resize(){
    w = canvas.width  = canvas.clientWidth  || innerWidth;
    h = canvas.height = canvas.clientHeight || innerHeight;
    if(P.length===0) spawn(100);
  }
  addEventListener('resize', resize); resize();

  // reaguj na události
  addEventListener('evt:voice', ()=>{ energy = Math.min(1,energy+0.35); burst(10); });
  addEventListener('evt:vision',()=>{ energy = Math.min(1,energy+0.25); burst(6);  });
  addEventListener('evt:mood',  e=>{
    const calm = e.detail?.calm||0; const anx = e.detail?.anxiety||0;
    energy = Math.min(1, energy + Math.max(calm*0.2, anx*0.3));
  });
  function burst(n){ for(let i=0;i<n;i++) P[(Math.random()*P.length)|0] = makeParticle(); }

  function draw(){
    t += 0.016;
    ctx.clearRect(0,0,w,h);

    // kouřové překrytí
    ctx.globalCompositeOperation = 'lighter';
    for(const p of P){
      // spirálové ploužení kolem středu
      p.a += (0.002 + p.s*0.0008 + energy*0.0015);
      p.r += Math.sin(t*0.7 + p.z)*0.08;
      p.x  = w/2 + Math.cos(p.a)*p.r;
      p.y  = h/2 + Math.sin(p.a)*p.r - (0.12 + energy*0.35);

      ctx.globalAlpha = p.o * (0.6 + 0.4*Math.sin(t*2+p.z*8));
      ctx.fillStyle   = `rgba(${80+energy*120},${230},${220},1)`;
      ctx.font        = `${12 + p.z*10 + energy*8}px ui-monospace, Menlo, monospace`;
      ctx.fillText(p.l, p.x, p.y);

      // recyklace mimo scénu
      if(p.x<-20 || p.x>w+20 || p.y<-40){
        Object.assign(p, makeParticle());
        p.y = h + 20;
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // postupné vyprchání energie
    energy *= 0.94;

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
