// T3 fairness audit: same hero pairs, side-swapped seeds and independent special order.
import {writeFileSync,mkdirSync} from 'node:fs';
import {HEROES,fight1v1} from './arena-engine.mjs';
const argv=process.argv.slice(2);
const get=(key,def)=>{const p=argv.indexOf('--'+key);return p<0?def:argv[p+1]};
const N=Number(get('per-hero',2000)),seed=Number(get('seed',20261030)),dir=get('out','arena-t3-fairness');
if(!Number.isInteger(N)||N<100||N>20000)throw Error('per-hero must be 100..20000');
const policies=[
 {name:'baseline_legacy_special',rules:{equalSpeed:'simultaneous'}},
 {name:'both_simultaneous',rules:{equalSpeed:'simultaneous',specialOrder:'simultaneous'}}
],rows=[];
for(const {name,rules} of policies){
 for(const hero of HEROES){
  let scoreA=0,draws=0,doubleKO=0,rounds=0;
  for(let i=0;i<N;i++){
   // Two independent orientation trials per seed; confidence comes from replication.
   const match=fight1v1(hero.id,hero.id,{seed:(seed+Math.imul(i+1,2654435761)+hero.id.charCodeAt(0))>>>0,strategyA:'equilibrium',strategyB:'equilibrium',rules});
   scoreA+=match.winner===1?1:match.winner===3?.5:0;
   draws+=match.winner===3?1:0;
   doubleKO+=match.termination==='double_ko'?1:0;rounds+=match.rounds;
  }
  const pct=100*scoreA/N,halfWidth=100*1.96*Math.sqrt(Math.max(.0001,pct/100*(1-pct/100))/N);
  rows.push({policy:name,hero:hero.id,n:N,sideAWinPct:+pct.toFixed(2),deviationPp:+(pct-50).toFixed(2),approx95HalfWidthPp:+halfWidth.toFixed(2),drawPct:+(draws/N*100).toFixed(2),doubleKOPct:+(doubleKO/N*100).toFixed(2),meanRounds:+(rounds/N).toFixed(2)});
 }
}
mkdirSync(dir,{recursive:true});
writeFileSync(dir+'/fairness.json',JSON.stringify({seed,N,rows,disclaimer:'Approximate binomial CI treats half-draw scores as binary; use score bootstrap for final inference.'},null,2)+'\n');
writeFileSync(dir+'/fairness.csv','policy,hero,n,sideAWinPct,deviationPp,approx95HalfWidthPp,drawPct,doubleKOPct,meanRounds\n'+rows.map(x=>Object.values(x).join(',')).join('\n')+'\n');
console.log(JSON.stringify(rows));
