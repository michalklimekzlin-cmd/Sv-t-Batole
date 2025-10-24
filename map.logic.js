// map.logic.js – jednoduché demo rozmísťování assetů kolem Viriho
// API: initMap({canvas, inventory})

export function initMap({ canvas, inventory }) {
  const ctx = canvas.getContext('2d');
  const items = [];
  const W = () => canvas.clientWidth || canvas.width;
  const H = () => canvas.clientHeight || canvas.height;

  function drop(imgBitmap, radius, angle, drift=0.15) {
    const cx = W()/2, cy = H()/2;
    const x = cx + Math.cos(angle)*radius;
    const y = cy + Math.sin(angle)*radius;
    items.push({ img: imgBitmap, x, y, a: angle, r: radius, t: Math.random()*1000, drift });
  }

  // rozhoď, pokud jsou k dispozici
  const baseR = Math.min(W(),H())*0.28;
  if (inventory.images.shard) drop(inventory.images.shard, baseR, 0.2);
  if (inventory.images.emo)   drop(inventory.images.emo,   baseR*1.15, -1.1, 0.12);
  if (inventory.images.glyph) drop(inventory.images.glyph, baseR*0.9,  2.3,  0.10);

  function draw(now){
    ctx.clearRect(0,0,W(),H());
    // položky jemně krouží kolem
    for (const it of items){
      it.t += 16; // ~fps
      const wobble = Math.sin(it.t*0.002) * it.drift * it.r;
      const x = W()/2 + Math.cos(it.a)*it.r + Math.cos(it.t*0.0017)*wobble;
      const y = H()/2 + Math.sin(it.a)*it.r + Math.sin(it.t*0.0013)*wobble;
      const s = 0.9 + 0.1*Math.sin(it.t*0.001+it.a);
      const w = it.img.width*s, h = it.img.height*s;
      ctx.drawImage(it.img, x-w/2, y-h/2, w, h);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  return { drop };
}