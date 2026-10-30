import { LEVEL_RATES } from './ge-economy-simulator.mjs';
// Self-contained research-only M2 behavior model. No production transactions.
export const COHORTS=Object.freeze({
 explorer:{login:.55,wallet:.12,minigame:.10,bot:.25,financeGE:25,minigameGE:15},
 wallet:{login:.75,wallet:.55,minigame:.15,bot:.32,financeGE:35,minigameGE:15},
 gamer:{login:.94,wallet:.20,minigame:.70,bot:.88,financeGE:35,minigameGE:24}
});
export const thresholds=Object.freeze(Array.from({length:21},(_,l)=>{
 if(l<=1)return 0;let sum=0;for(let p=1;p<l;p++)sum+=Math.round((20+12*(p-1)+3*(p-1)**2)/5)*5;return sum;
}));
export function levelFromXP(xp){if(!Number.isFinite(xp)||xp<0)throw Error('invalid xp');let l=1;while(l<20&&xp>=thresholds[l+1])l++;return l}
export function stage(l){return l<3?'egg':l===3?'chick':'adult'}
export function makeRandom(seed=20261030){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296}}
export function runBehavior({days=30,cohort='explorer',seed=20261030,initialXP=0,profileOverrides={},financialGEOverride=null}={}){
 if(!Number.isInteger(days)||days<1||days>365)throw Error('invalid days');
 if(!COHORTS[cohort])throw Error('unknown cohort');
 const p={...COHORTS[cohort],...profileOverrides},rand=makeRandom(seed);let xp=initialXP,ge=0,passive=0,loginCount=0,walletCount=0,botCount=0,minigameCount=0;
 const timeline=[];let firstRun=true;
 for(let day=1;day<=days;day++){
  const login=rand()<p.login; let xpEarned=0,finance=0,minigame=0,battles=0;
  if(login){loginCount++;if(firstRun){xpEarned+=10;firstRun=false}
   xpEarned+=8; // Daily event choice
   if(rand()<p.wallet){walletCount++;finance=financialGEOverride??p.financeGE;xpEarned+=12}
   if(rand()<p.minigame){minigameCount++;minigame=p.minigameGE;xpEarned+=12}
   if(levelFromXP(xp+xpEarned)>=4&&rand()<p.bot){battles=4;botCount+=battles;xpEarned+=battles*10}
  }
  xp+=xpEarned;const level=levelFromXP(xp);
  // Daily passive GE accrues even when offline. Rates are prototype, not production.
  const laying=LEVEL_RATES[level]??0;ge+=laying+finance+minigame;passive+=laying;
  timeline.push({day,login,xp,level,stage:stage(level),ge:Number(ge.toFixed(4)),laying,finance,minigame,battles});
 }
 return {cohort,seed,days,level:levelFromXP(xp),xp,ge:Number(ge.toFixed(4)),passiveGE:Number(passive.toFixed(4)),logins:loginCount,walletActions:walletCount,minigames:minigameCount,botBattles:botCount,timeline};
}
export function compareCohorts(days=30,seed=20261030){return Object.keys(COHORTS).map(cohort=>runBehavior({cohort,days,seed}))}
