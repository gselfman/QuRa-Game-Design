import {writeFileSync,mkdirSync} from 'node:fs';
import {HEROES,fight1v1,fight3v3} from './arena-engine.mjs';
const args=process.argv.slice(2),arg=(k,d)=>{const i=args.indexOf('--'+k);return i===-1?d:args[i+1]};
const perPair=Number(arg('per-pair',10000)),seed=Number(arg('seed',20261030)),dir=arg('out','arena-results');
const equalSpeed=arg('equal-speed','legacy'); if(!['legacy','simultaneous'].includes(equalSpeed))throw Error('invalid equal-speed rule');
if(!Number.isInteger(perPair)||perPair<1||perPair>100000)throw Error('per-pair must be 1..100000');
if(!Number.isFinite(seed))throw Error('seed must be finite');
const actionNames=['attack','defend','maneuver','special'],rows=[],rawHistogram={},overallCounts=Object.fromEntries(actionNames.map(x=>[x,0]));
for(let i=0;i<HEROES.length;i++)for(let j=0;j<HEROES.length;j++){
 const a=HEROES[i],b=HEROES[j];let wins=0,draws=0,specials=0;
 const histogram={},counts=Object.fromEntries(actionNames.map(x=>[x,0]));
 for(let k=0;k<perPair;k++){
  const battle=fight1v1(a.id,b.id,{seed:(seed+Math.imul(i*6+j+1,1000003)+k)>>>0,strategyA:'equilibrium',strategyB:'equilibrium',rules:equalSpeed==='simultaneous'?{equalSpeed:'simultaneous'}:{}});
  wins+=battle.winner===1?1:battle.winner===3?.5:0;draws+=battle.winner===3?1:0;
  histogram[battle.rounds]=(histogram[battle.rounds]||0)+1;
  for(const turn of battle.history)for(const action of [turn.ma,turn.mb]){counts[action]++;overallCounts[action]++;if(action==='special')specials++}
 }
 const total=Object.values(counts).reduce((x,y)=>x+y,0),sorted=Object.entries(histogram).flatMap(([round,count])=>Array(count).fill(+round)).sort((a,b)=>a-b);
 const median=(sorted[Math.floor((sorted.length-1)/2)]+sorted[Math.floor(sorted.length/2)])/2;
 rows.push({heroA:a.id,heroB:b.id,fights:perPair,winRate:Math.round(wins/perPair*1e4)/100,drawRate:Math.round(draws/perPair*1e4)/100,medianRounds:median,meanRounds:Math.round(sorted.reduce((x,y)=>x+y,0)/perPair*100)/100,specialsPerMatch:Math.round(specials/perPair*1e4)/1e4,actionShares:Object.fromEntries(actionNames.map(n=>[n,Math.round(counts[n]/total*1e4)/100])),histogram});
 rawHistogram[a.id+'-'+b.id]=histogram;
}
const totalActions=Object.values(overallCounts).reduce((x,y)=>x+y,0),actionShares=Object.fromEntries(actionNames.map(n=>[n,Math.round(overallCounts[n]/totalActions*1e4)/100]));
const threeVsThree=[],teamA=['r','b','f'],teamB=['p','m','g'];
for(let k=0;k<Math.max(100,Math.min(perPair,10000));k++){
 const battle=fight3v3(teamA,teamB,{seed:(seed+k)>>>0,strategyA:'equilibrium',strategyB:'equilibrium'});
 threeVsThree.push({rounds:battle.rounds,winner:battle.winner});
}
const teamRounds=threeVsThree.map(x=>x.rounds).sort((a,b)=>a-b),teamMedian=teamRounds[Math.floor(teamRounds.length/2)];
const results={engine:'T3 research prototype, not calibrated',equalSpeedRule:equalSpeed,seed,perPair,totalBattles:perPair*36,actionShares,rows,team3x3:{battles:threeVsThree.length,medianRounds:teamMedian,meanRounds:teamRounds.reduce((a,b)=>a+b,0)/teamRounds.length,draws:threeVsThree.filter(x=>x.winner===3||x.winner===0).length}};
mkdirSync(dir,{recursive:true});writeFileSync(dir+'/matrix.json',JSON.stringify(results,null,2)+'\n');
writeFileSync(dir+'/matrix.csv','heroA,heroB,fights,winRate,drawRate,medianRounds,meanRounds,specialsPerMatch,attackPct,defendPct,maneuverPct,specialPct\n'+rows.map(r=>[r.heroA,r.heroB,r.fights,r.winRate,r.drawRate,r.medianRounds,r.meanRounds,r.specialsPerMatch,...actionNames.map(n=>r.actionShares[n])].join(',')).join('\n')+'\n');
writeFileSync(dir+'/round-histograms.json',JSON.stringify(rawHistogram,null,2)+'\n');
console.log(JSON.stringify({totalBattles:results.totalBattles,actionShares,team3x3:results.team3x3,output:dir},null,2));
