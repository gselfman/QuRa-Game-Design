import {writeFileSync,mkdirSync} from 'node:fs';
import {HEROES,fight1v1} from './arena-engine.mjs';
const args=process.argv.slice(2),arg=(k,d)=>{const i=args.indexOf('--'+k);return i===-1?d:args[i+1]};
const perPair=Number(arg('per-pair',10000)),seed=Number(arg('seed',20261030)),dir=arg('out','arena-results');
if(!Number.isInteger(perPair)||perPair<1||perPair>100000)throw Error('per-pair must be 1..100000');
const rows=[],hist=[];
for(let i=0;i<HEROES.length;i++)for(let j=0;j<HEROES.length;j++){
 const a=HEROES[i],b=HEROES[j];let w=0,draw=0,rounds=0,counts={attack:0,defend:0,maneuver:0,special:0};
 for(let k=0;k<perPair;k++){
  const match=fight1v1(a.id,b.id,{seed:(seed+Math.imul(i*6+j+1,1000003)+k)>>>0,strategyA:'equilibrium',strategyB:'equilibrium'});
  w+=match.winner===1?1:match.winner===3?.5:0;draw+=match.winner===3?1:0;rounds+=match.rounds;
  for(const turn of match.history){counts[turn.ma]++;counts[turn.mb]++}
 }
 const r={heroA:a.id,heroB:b.id,fights:perPair,winRate:Math.round(w/perPair*10000)/100,drawRate:Math.round(draw/perPair*10000)/100,meanRounds:Math.round(rounds/perPair*100)/100,actions:counts};
 rows.push(r);hist.push({pair:a.id+'-'+b.id,rounds:rounds/perPair});
}
mkdirSync(dir,{recursive:true});writeFileSync(dir+'/matrix.json',JSON.stringify({seed,perPair,rows},null,2));
writeFileSync(dir+'/matrix.csv','heroA,heroB,fights,winRate,drawRate,meanRounds,attack,defend,maneuver,special\n'+rows.map(r=>[r.heroA,r.heroB,r.fights,r.winRate,r.drawRate,r.meanRounds,...Object.values(r.actions)].join(',')).join('\n')+'\n');
console.log('Saved '+rows.length+' matrix cells to '+dir);
