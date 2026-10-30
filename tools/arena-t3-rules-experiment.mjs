import {writeFileSync,mkdirSync} from 'node:fs';
import {fight1v1,fight3v3,createTeam,resolveTarget,seeded} from './arena-engine.mjs';
const argv=process.argv.slice(2),opt=(key,def)=>{const i=argv.indexOf('--'+key);return i<0?def:argv[i+1]};
const N=Number(opt('per-variant',1500)),seed=Number(opt('seed',20261030)),out=opt('out','arena-t3-rule-results');
if(!Number.isInteger(N)||N<100||N>20000)throw Error('per-variant must be 100..20000');
const variants=[
 {id:'baseline',rules:{equalSpeed:'simultaneous'}},
 {id:'speed_sequential',rules:{equalSpeed:'simultaneous',speedOrder:'sequential'}},
 {id:'charge_fast',rules:{equalSpeed:'simultaneous',chargeTable:{win:40,lose:20,tie:25}}},
 {id:'tie_draw',rules:{equalSpeed:'simultaneous'},tiePolicy:'draw'},
 {id:'double_ko_tiebreak',rules:{equalSpeed:'simultaneous'},doubleKOPolicy:'pre_round_hp'},
 {id:'multi_once',rules:{equalSpeed:'simultaneous',multiCollision:'once'}}
];
const pairs=[['r','b'],['f','p'],['m','g'],['r','r'],['m','m']];
const result=[];
for(const v of variants){
 let wins=0,draws=0,doubleKO=0,timeout=0,special=0,rounds=[],actions={attack:0,defend:0,maneuver:0,special:0};
 for(let i=0;i<N;i++){
  const [a,b]=pairs[i%pairs.length];const fight=fight1v1(a,b,{
   seed:(seed+Math.imul(i+1,1664525))>>>0,strategyA:'equilibrium',strategyB:'equilibrium',
   rules:v.rules,tiePolicy:v.tiePolicy||'hp',doubleKOPolicy:v.doubleKOPolicy||'draw'});
  wins+=fight.winner===1?1:fight.winner===3?.5:0;
  draws+=fight.winner===3?1:0;
  doubleKO+=fight.termination==='double_ko'?1:0;
  timeout+=fight.termination==='timeout'?1:0;
  rounds.push(fight.rounds);
  for(const turn of fight.history)for(const a of [turn.ma,turn.mb]){actions[a]++;if(a==='special')special++}
 }
 rounds.sort((a,b)=>a-b);
 const total=Object.values(actions).reduce((a,b)=>a+b,0);
 let wins3=0,draws3=0,rounds3=[];
 for(let i=0;i<Math.min(N,500);i++){
  const fight=fight3v3(['r','b','f'],['p','m','g'],{seed:(seed+i)>>>0,maxRounds:30,strategyA:'equilibrium',strategyB:'equilibrium',rules:v.rules});
  wins3+=fight.winner===1?1:fight.winner===3?.5:0;
  draws3+=fight.winner===3||fight.winner===0?1:0;
  rounds3.push(fight.rounds);
 }
 rounds3.sort((a,b)=>a-b);
 result.push({variant:v.id,oneVsOne:{battles:N,winRateA:+(100*wins/N).toFixed(2),drawPct:+(100*draws/N).toFixed(2),doubleKOPct:+(100*doubleKO/N).toFixed(2),timeoutPct:+(100*timeout/N).toFixed(2),medianRounds:rounds[Math.floor(rounds.length/2)],specialUsesPerBattle:+(special/N).toFixed(3),actionPct:Object.fromEntries(Object.entries(actions).map(([k,n])=>[k,+(n/total*100).toFixed(2)]))},threeVsThree:{battles:rounds3.length,medianRounds:rounds3[Math.floor(rounds3.length/2)],drawOrTimeoutPct:+(draws3/rounds3.length*100).toFixed(2),winRateA:+(100*wins3/rounds3.length).toFixed(2)}});
}
const jrpg=[];
for(const policy of ['auto','lost']){
 let lost=0,retargeted=0,damage=0;
 for(let i=0;i<1000;i++){
  const A=createTeam(['r']),B=createTeam(['f','m']);B[0].hp=0;B[0].dead=true;
  const r=resolveTarget(A,B,[{move:'attack',target:0}],[null,{move:'attack',target:0}],seeded(seed+i),{retarget:policy});
  lost+=r.filter(x=>x.lost).length;
  retargeted+=r.filter(x=>x.targetPos===1).length;
  damage+=Math.max(0,110-B[1].hp);
 }
 jrpg.push({policy,cases:1000,lost,retargeted,damage});
}
const summary={status:'PROTOTYPE EXPERIMENT — NOT LOCKED',seed,perVariant:N,variants:result,jrpg,notes:[
 'Speed comparison tests sequential vs simultaneous attack collisions in 1x1, not full simultaneous JRPG turn resolution.',
 'Multi-collision once currently applies to repeated Maneuver/Special and charge, not all possible effects.',
 'JRPG lost vs auto diagnostic is a forced previously-dead-target edge case, not empirical gameplay frequency.',
 'Charge and tie variants require separate coverage across all ordered 6x6 pairs before locking.'
]};
mkdirSync(out,{recursive:true});
writeFileSync(out+'/t3-rule-variants.json',JSON.stringify(summary,null,2)+'\n');
writeFileSync(out+'/t3-rule-variants.csv','variant,battles,winRateA,drawPct,doubleKOPct,timeoutPct,medianRounds,specialUsesPerBattle,attackPct,defendPct,maneuverPct,specialPct,teamMedianRounds,teamDrawOrTimeoutPct\n'+result.map(r=>[r.variant,r.oneVsOne.battles,r.oneVsOne.winRateA,r.oneVsOne.drawPct,r.oneVsOne.doubleKOPct,r.oneVsOne.timeoutPct,r.oneVsOne.medianRounds,r.oneVsOne.specialUsesPerBattle,...Object.values(r.oneVsOne.actionPct),r.threeVsThree.medianRounds,r.threeVsThree.drawOrTimeoutPct].join(',')).join('\n')+'\n');
console.log(JSON.stringify({seed,perVariant:N,result,jrpg}));
