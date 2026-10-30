import {writeFileSync,mkdirSync} from 'node:fs';
import {HEROES,fight1v1,createFighter,resolveClash,resolveTarget,createTeam,seeded} from './arena-engine.mjs';
// T3 controlled rule variants. Do not label anything LOCKED until results exist.
const argv=process.argv.slice(2);
const opt=(name,fallback)=>{const i=argv.indexOf('--'+name);return i<0?fallback:argv[i+1]};
const N=Number(opt('per-hero',2000)),seed=Number(opt('seed',20261030)),out=opt('out','arena-t3-results');
if(!Number.isInteger(N)||N<100||N>100000)throw Error('per-hero must be 100..100000');
const rows=[];
for(const variant of ['legacy','simultaneous']){
 for(let h=0;h<HEROES.length;h++){
  const hero=HEROES[h];let wins=0,draws=0,rounds=[],specials=0;
  const actions={attack:0,defend:0,maneuver:0,special:0};
  for(let k=0;k<N;k++){
   const battle=fight1v1(hero.id,hero.id,{seed:(seed+Math.imul(h+1,92821)+k)>>>0,strategyA:'equilibrium',strategyB:'equilibrium',rules:variant==='simultaneous'?{equalSpeed:'simultaneous'}:{}});
   wins+=battle.winner===1?1:battle.winner===3?.5:0;
   draws+=battle.winner===3?1:0;rounds.push(battle.rounds);
   for(const turn of battle.history)for(const action of [turn.ma,turn.mb]){actions[action]++;if(action==='special')specials++}
  }
  rounds.sort((a,b)=>a-b);const median=rounds[Math.floor(N/2)],total=Object.values(actions).reduce((a,b)=>a+b,0);
  rows.push({variant,hero:hero.id,battles:N,sideAWinPct:Math.round(10000*wins/N)/100,sideBiasPct:Math.round(10000*(wins/N-.5))/100,drawPct:Math.round(10000*draws/N)/100,medianRounds:median,specialPerBattle:Math.round(10000*specials/N)/10000,actionPct:Object.fromEntries(Object.entries(actions).map(([k,v])=>[k,Math.round(10000*v/total)/100]))});
 }
}
const diagnostics={};
{
 const a=createFighter('r'),b=createFighter('r');a.q=b.q=100;
 const result=resolveClash(a,b,'special','special',.25);diagnostics.specialVsSpecial={result,after:[a.hp,b.hp]};
}
{
 const a=createTeam(['r']),b=createTeam(['f','m']);b[0].hp=0;b[0].dead=true;
 const x=resolveTarget(a,b,[{move:'attack',target:0}],[null,{move:'attack',target:0}],seeded(99));
 diagnostics.jrpgRetarget=x[0]?.targetPos??null;
}
const summary={version:'T3 rule experiment 0.1',seed,perHero:N,rows,diagnostics,disclaimer:'Only mirror equal-speed Maneuver variant is compared here. Speed sequential vs simultaneous, collision count, JRPG policy, charge table and tie-break alternatives still require complete factorial testing.'};
mkdirSync(out,{recursive:true});
writeFileSync(out+'/mirror-variants.json',JSON.stringify(summary,null,2)+'\n');
writeFileSync(out+'/mirror-variants.csv','variant,hero,battles,sideAWinPct,sideBiasPct,drawPct,medianRounds,specialPerBattle,attackPct,defendPct,maneuverPct,specialPct\n'+rows.map(r=>[r.variant,r.hero,r.battles,r.sideAWinPct,r.sideBiasPct,r.drawPct,r.medianRounds,r.specialPerBattle,...Object.values(r.actionPct)].join(',')).join('\n')+'\n');
console.log(JSON.stringify(summary,null,2));
