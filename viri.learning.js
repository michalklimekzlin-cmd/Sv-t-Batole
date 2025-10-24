export function initViriLearning(xp){
  console.log('🧩 ViriLearning napojen');
  window.VIRI_LEARNING={
    pulse:()=>xp.add({team:'batolesvet',value:Math.random()*0.2}),
    idea:()=>xp.add({team:'glyph',value:Math.random()*0.3}),
    logic:()=>xp.add({team:'ai',value:Math.random()*0.25}),
    feeling:()=>xp.add({team:'pedrovci',value:Math.random()*0.15})
  };
}