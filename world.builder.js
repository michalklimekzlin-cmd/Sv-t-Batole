// world.builder.js — inkrementální generátor světa
import { Memory } from './memory.core.js';
import { Rules }  from './rules.guardrails.js';

let TICK_MS = 2500;
let timer   = null;

function rnd(a,b){ return Math.random()*(b-a)+a; }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

function genPlace(){
  const names = ['Ševelící Háj','Tichá Niva','Zlomený Most','Stříbrná Studna'];
  return { kind:'place', name: pick(names), mood: pick(['calm','odd','bright']) };
}
function genNPC(){
  const names = ['Lumi','Karo','Mira','Tess','Ivo'];
  return { kind:'npc', name: pick(names), trait: pick(['curious','careful','brave']) };
}
function genQuest(){
  const verbs = ['najdi','přines','poslechni','následuj'];
  return { kind:'quest', text: `${pick(verbs)} znamení v mlze` };
}
function maybeSchizo(entity){
  if (!Rules.schizo.enabled || Math.random()>Rules.schizo.intensity) return entity;
  const twist = pick(Rules.schizo.palette);
  return { ...entity, twist };
}

function buildOnce(){
  const budget = Rules.rate.maxPerTick;
  const plans = [genPlace, genNPC, genQuest];
  let created = 0;

  for (let i=0; i<plans.length && created < budget; i++){
    const make = plans[i];
    let ent = make();
    ent = maybeSchizo(ent);
    if (Rules.validate(ent)){
      Memory.write(ent.kind, ent);
      created++;
    }
  }

  // jemná reflexe
  if (Math.random() < 0.2) {
    const mood = pick(['calm','hope','odd','focus']);
    Memory.write('thought', { mood, note:'svět se rodí' });
  }
}

export const Builder = {
  start(){
    if (timer) return;
    Memory.write('builder', { status:'start' });
    timer = setInterval(buildOnce, TICK_MS);
  },
  stop(){
    if (!timer) return;
    clearInterval(timer); timer=null;
    Memory.write('builder', { status:'stop' });
  },
  tick(){ buildOnce(); } // manuální krok
};

window.WorldBuilder = Builder;
