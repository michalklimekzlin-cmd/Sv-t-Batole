import { say } from './voice.io.js';
import { onUpdate as onFlow, getFlow, nudge as flowNudge } from './vivere.flow.js';
import { getSnapshot, snapshotMood, bump, recall, remember, resetMemory } from './vafi.memory.js';

const $ = s => document.querySelector(s);
const clamp = x => Math.max(0, Math.min(1, x));
const lerp = (a,b,t)=>a+(b-a)*t;

const snap = getSnapshot();
bump('seenCount',1);

let flow=getFlow();
onFlow(f=>flow=f);
let mood=clamp(snap.lastMood??0.6);
let energy=clamp(snap.lastEnergy??0.7);

function humanSince(ts){
  const sec=(Date.now()-ts)/1000;
  if(sec<60)return`${Math.floor(sec)}s`;
  const min=sec/60;
  if(min<60)return`${Math.floor(min)}min`;
  const h=min/60;
  if(h<24)return`${Math.floor(h)}h`;
  return`${Math.floor(h/24)}d`;
}

setTimeout(()=>{
  const since=humanSince(snap.lastSeenAt||Date.now());
  const seen=recall('seenCount',1);
  let msg='Jsem tady poprvé.';
  if(seen>1){
    if(mood>0.7) msg=`Pamatuju si radost (${since}).`;
    else if(mood<0.35) msg=`Minule mi bylo ouzko (${since}).`;
    else msg=`Bylo mi klidně (${since}).`;
  }
  say(msg);
},900);

let halo=0,lastLabel='calm',speakCD=0,saveT=0,t0=performance.now();
function isAsleep(){return($('#vafiStatus')?.textContent||'').toLowerCase().includes('spí');}
function labelOf(m,e,a){if(a)return'sleep';if(m>0.8)return'happy';if(m<0.35)return'low';return'calm';}
function pickLine(m,e,a){
  if(a)return'Ještě chvilku… zzz.';
  if(m>0.8&&e>0.5)return'Cítím jiskru.';
  if(e<0.3)return'Jsem unavený.';
  if(m<0.35)return'Je mi těžko.';
  return'Jsem v klidu.';
}

window.addEventListener('pointerdown',()=>flowNudge('touch',1),{passive:true});
let taps=[];
addEventListener('pointerup',()=>{
  const t=performance.now();
  taps=taps.filter(x=>t-x<1200);taps.push(t);
  if(taps.length>=3){resetMemory(true);say('Zapomněl jsem minulost.');}
},{passive:true});

function loop(ts){
  const dt=Math.min(0.05,(ts-t0)/1000);t0=ts;
  if(speakCD>0)speakCD-=dt;
  const mt=clamp(0.5+flow.wave*0.5);
  const et=clamp(flow.vitality);
  mood=lerp(mood,mt,0.4);
  energy=lerp(energy,et,0.5);
  const a=isAsleep();
  if(a){energy*=0.9;mood*=0.95;}
  halo+=(a?1.7:2.6)*dt;
  const dot=$('#vafiDot');
  if(dot)dot.style.filter=`drop-shadow(0 0 ${8+Math.sin(halo)*9}px rgba(160,230,255,.55))`;
  const lbl=labelOf(mood,energy,a);
  if(lbl!==lastLabel&&speakCD<=0){say(pickLine(mood,energy,a));lastLabel=lbl;speakCD=8;}
  saveT+=dt;
  if(saveT>=5){snapshotMood(mood,energy);saveT=0;}
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
export const vafiSoul={get mood(){return mood;},get energy(){return energy;}};