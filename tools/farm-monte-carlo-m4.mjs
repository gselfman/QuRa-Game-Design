// QuRa M4 Monte Carlo batch simulator. Research-only; no production ledger.
import {simulateFarm,FARM_COHORTS} from './farm-simulator-m3.mjs';
import {SHOP_PRICES} from './ge-economy-simulator.mjs';
export const CONFIG_VERSION='m4-prototype-0.1';
const round=n=>Math.round(n*1000)/1000;
export function quantile(values,p){
 if(!values.length)return null;
 if(!Number.isFinite(p)||p<0||p>1)throw new RangeError('percentile');
 const a=[...values].sort((x,y)=>x-y),pos=(a.length-1)*p,lo=Math.floor(pos),hi=Math.ceil(pos);
 return round(a[lo]+(a[hi]-a[lo])*(pos-lo));
}
export function summarize(values){
 const a=values.filter(Number.isFinite);return {count:a.length,mean:a.length?round(a.reduce((x,y)=>x+y,0)/a.length):null,p25:quantile(a,.25),p50:quantile(a,.5),p75:quantile(a,.75),p90:quantile(a,.9)};
}
const hash=(seed,index,cohort)=>{let h=(seed^Math.imul(index+1,0x9e3779b1))>>>0;for(let i=0;i<cohort.length;i++)h=Math.imul(h^cohort.charCodeAt(i),16777619)>>>0;return h};
const firstDay=(timeline,fn)=>timeline.find(x=>fn(x))?.day??null;
export function simulatePopulation(options={}){
 const {users=300,days=90,seed=20261030,cohortWeights={explorer:1,wallet:1,gamer:1},overrides={},collectSamples=false}=options;
 if(!Number.isInteger(users)||users<1||users>100000)throw new RangeError('users 1..100000');
 if(!Number.isInteger(days)||days<1||days>3650)throw new RangeError('days');
 const cohortEntries=Object.entries(cohortWeights).filter(([,v])=>v>0);
 if(!cohortEntries.length||cohortEntries.some(([k,v])=>!FARM_COHORTS[k]||!Number.isFinite(v)))throw new Error('invalid cohort weights');
 const total=cohortEntries.reduce((sum,[,w])=>sum+w,0),cohortCount=Object.fromEntries(cohortEntries.map(([k])=>[k,0]));
 const samples=[],aggregates={level:[],geBalance:[],geEarned:[],geSpent:[],chickens:[],gear:[],logins:[],walletActions:[],botBattles:[]};
 const goals={L3:[],L4:[],L6:[],L10:[],secondChicken:[],thirdChicken:[],firstGear:[]};
 const sourceTotals={},sinkTotals={};
 for(let i=0;i<users;i++){
  const selector=(i+.5)/users*total;
  let cumulative=0,cohort=cohortEntries.at(-1)[0];
  for(const [name,weight] of cohortEntries){cumulative+=weight;if(selector<cumulative){cohort=name;break}}
  cohortCount[cohort]++;
  const result=simulateFarm({days,seed:hash(seed,i,cohort),cohort,...overrides});
  const {farm,timeline,summary}=result;
  const earned=Object.values(farm.geSources).reduce((x,y)=>x+y,0),spent=Object.values(farm.geSinks).reduce((x,y)=>x+y,0);
  const m={id:i,cohort,level:summary.level,geBalance:summary.GE,geEarned:round(earned),geSpent:round(spent),chickens:summary.chickens,gear:summary.inventory,logins:timeline.filter(x=>x.online).length,walletActions:timeline.reduce((x,y)=>x+y.walletActions,0),botBattles:timeline.reduce((x,y)=>x+y.botBattles,0)};
  for(const k of Object.keys(aggregates))aggregates[k].push(m[k]);
  for(const [k,v] of Object.entries(farm.geSources))sourceTotals[k]=round((sourceTotals[k]||0)+v);
  for(const [k,v] of Object.entries(farm.geSinks))sinkTotals[k]=round((sinkTotals[k]||0)+v);
  const reached={L3:firstDay(timeline,x=>x.level>=3),L4:firstDay(timeline,x=>x.level>=4),L6:firstDay(timeline,x=>x.level>=6),L10:firstDay(timeline,x=>x.level>=10),secondChicken:firstDay(timeline,x=>x.chickens.length>=2),thirdChicken:firstDay(timeline,x=>x.chickens.length>=3),firstGear:firstDay(timeline,x=>x.inventoryCount>0)};
  for(const [key,day] of Object.entries(reached))if(day!==null)goals[key].push(day);
  if(collectSamples)samples.push({...m,...Object.fromEntries(Object.entries(reached).map(([k,v])=>['day_'+k,v]))});
 }
 return {version:CONFIG_VERSION,config:{users,days,seed,cohortWeights,overrides},cohortCount,metrics:Object.fromEntries(Object.entries(aggregates).map(([k,a])=>[k,summarize(a)])),milestones:Object.fromEntries(Object.entries(goals).map(([k,a])=>[k,{reached:a.length,rate:round(a.length/users),days:summarize(a)}])),geSources:sourceTotals,geSinks:sinkTotals,...(collectSamples?{samples}:{})};
}
export function compareBalance({baseline={},candidate={},users=300,days=90,seed=20261030,cohortWeights}={}){
 const common={users,days,seed,...(cohortWeights?{cohortWeights}:{})};
 const a=simulatePopulation({...common,overrides:baseline}),b=simulatePopulation({...common,overrides:candidate});
 const diff={};
 for(const k of Object.keys(a.metrics)){
  const previous=a.metrics[k].mean,next=b.metrics[k].mean;
  diff[k]={before:previous,after:next,delta:previous===null||next===null?null:round(next-previous)};
 }
 return {baseline:a,candidate:b,diff,warning:'Monte Carlo estimates depend on hypothetical behavioral probabilities. Not observed retention or causal conversion.'};
}
export function rowsToCSV(samples){
 const keys=['id','cohort','level','geBalance','geEarned','geSpent','chickens','gear','logins','walletActions','botBattles','day_L3','day_L4','day_L6','day_L10','day_secondChicken','day_thirdChicken','day_firstGear'];
 const escape=v=>v===undefined||v===null?'':typeof v==='string'&&/[",\n]/.test(v)?'"'+v.replaceAll('"','""')+'"':String(v);
 return keys.join(',')+'\n'+samples.map(s=>keys.map(k=>escape(s[k])).join(',')).join('\n')+'\n';
}
