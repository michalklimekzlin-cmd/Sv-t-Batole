// viri.inventory.js — „inventář“ pro mapu / inspekci (zatím jednoduchý)
export async function buildInventory(state){
  // může se později načítat z IndexedDB / GitHubu – teď jen syntéza
  const top = Object.entries(state.mix).sort((a,b)=>b[1]-a[1])[0];
  return {
    label: state.label,
    topTeam: { name: top[0], value: top[1] },
    mood: state.mood,
    // seed pro případné generátory
    seed: Math.floor(Date.now()/1000) % 100000,
  };
}