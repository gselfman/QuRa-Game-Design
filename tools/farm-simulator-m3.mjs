// QuRa M3 research simulator — no production money or account access.
import { LEVEL_RATES, SHOP_PRICES } from './ge-economy-simulator.mjs';
import { levelFromXP, makeRandom, COHORTS } from './behavior-simulator.mjs';

export const COOP_TIERS = Object.freeze([2,4,6,10,16,24]);
export const COOP_UPGRADES = Object.freeze({'2:4':0,'4:6':500,'6:10':1500,'10:16':4000,'16:24':9000});
export const GEAR = Object.freeze({common:75,rare:225,epic:600,legendary:1850});
const finite=(x,label)=>{if(!Number.isFinite(x)||x<0)throw new RangeError(label);return x};
const round=x=>Math.round((x+Number.EPSILON)*1e8)/1e8;
export function createFarm({startingXP=0,startingGE=0,capacity=2,founder='ryaba',profile='explorer'}={}){
 if(!COOP_TIERS.includes(capacity))throw new RangeError('capacity');
 finite(startingXP,'startingXP');finite(startingGE,'startingGE');
 return {day:0,profile,ge:startingGE,geRemainder:0,capacity,nextId:2,firstFounder:founder,inventory:[],chickens:[{id:1,archetype:founder,xp:startingXP,level:levelFromXP(startingXP),acquired:'starter'}],unclaimedEggs:[],xpSources:{},geSources:{},geSinks:{},log:[]};
}
export function hatchEgg(farm,{archetype='ryaba',source='purchase'}={}){
 if(farm.chickens.length>=farm.capacity)return null;
 const chicken={id:farm.nextId++,archetype,xp:0,level:1,acquired:source};
 farm.chickens.push(chicken);farm.log.push({day:farm.day,type:'egg_hatched',chickenId:chicken.id,source});return chicken;
}
export function awardXP(farm,amount,{chickenId=farm.chickens[0].id,source='quest'}={}){
 finite(amount,'xp');
 const chicken=farm.chickens.find(c=>c.id===chickenId);if(!chicken)throw new Error('missing chicken');
 const before=chicken.level;chicken.xp+=amount;chicken.level=levelFromXP(chicken.xp);
 farm.xpSources[source]=(farm.xpSources[source]||0)+amount;
 if(chicken.level>before)farm.log.push({day:farm.day,type:'level_up',chickenId,from:before,to:chicken.level});
 return chicken.level;
}
function credited(farm,amount,source){farm.ge=round(farm.ge+amount);farm.geSources[source]=round((farm.geSources[source]||0)+amount)}
function charged(farm,amount,source){finite(amount,'GE cost');if(farm.ge+1e-9<amount)return false;farm.ge=round(farm.ge-amount);farm.geSinks[source]=round((farm.geSinks[source]||0)+amount);return true}
export function buyItem(farm,sku,prices=GEAR){
 const price=prices[sku];if(price===undefined)throw new Error('unknown sku');
 if(!charged(farm,price,'gear'))return false;
 farm.inventory.push({sku,price,day:farm.day});farm.log.push({day:farm.day,type:'gear_purchased',sku,price});return true;
}
export function upgradeCoop(farm){
 const index=COOP_TIERS.indexOf(farm.capacity);if(index===COOP_TIERS.length-1)return false;
 const next=COOP_TIERS[index+1],price=COOP_UPGRADES[farm.capacity+':'+next];
 if(!charged(farm,price,'coop'))return false;
 farm.capacity=next;farm.log.push({day:farm.day,type:'coop_upgraded',capacity:next,price});return true;
}
export function purchaseEgg(farm,{price=SHOP_PRICES.founder_egg,archetype='ryaba'}={}){
 if(farm.chickens.length>=farm.capacity)return false;
 if(!charged(farm,price,'incubation_egg'))return false;
 hatchEgg(farm,{archetype,source:'purchase'});return true;
}
export function grantMilestoneEgg(farm,code){
 if(farm.unclaimedEggs.includes(code)||farm.log.some(e=>e.type==='milestone_egg'&&e.code===code))return false;
 farm.unclaimedEggs.push(code);farm.log.push({day:farm.day,type:'milestone_egg',code});return true;
}
export function claimMilestoneEgg(farm,{archetype='ryaba'}={}){
 if(!farm.unclaimedEggs.length||farm.chickens.length>=farm.capacity)return false;
 const code=farm.unclaimedEggs.shift();hatchEgg(farm,{archetype,source:code});return true;
}
function milestoneCheck(farm){
 if(farm.chickens[0]?.level>=6)grantMilestoneEgg(farm,'SECOND_L6');
 if(farm.chickens.length>=2&&farm.chickens[1].level>=4)grantMilestoneEgg(farm,'THIRD_PATH_PROTOTYPE');
}
export const FARM_COHORTS=Object.freeze({
 explorer:{login:.55,wallet:.12,minigame:.1,bot:.25,financialGE:25,minigameGE:15,questXP:12,spend:'save'},
 wallet:{login:.75,wallet:.55,minigame:.15,bot:.32,financialGE:35,minigameGE:15,questXP:12,spend:'eggs'},
 gamer:{login:.94,wallet:.2,minigame:.7,bot:.88,financialGE:35,minigameGE:24,questXP:12,spend:'gear'}
});
export function simulateFarm(config={}){
 const {days=30,cohort='explorer',seed=20261030,startingXP=0,startingGE=0,capacity=2,policyOverrides={},rateOverrides={},grantMilestones=true}=config;
 if(!Number.isInteger(days)||days<1||days>3650)throw new RangeError('days');
 const policy={...FARM_COHORTS[cohort],...policyOverrides};if(!FARM_COHORTS[cohort])throw new Error('unknown cohort');
 const rng=makeRandom(seed),farm=createFarm({startingXP,startingGE,capacity,profile:cohort}),timeline=[];
 const rates={...LEVEL_RATES,...rateOverrides};
 for(const [lvl,rate] of Object.entries(rates))if(Number(lvl)>=3&&rate<1)throw new RangeError('L3+ minimum GE violated');
 for(let day=1;day<=days;day++){
  farm.day=day;const online=rng()<policy.login;let walletActions=0,botBattles=0;
  if(online){
   awardXP(farm,8,{source:'daily_event'});awardXP(farm,policy.questXP,{source:'quest'});
   if(rng()<policy.wallet){walletActions=1;awardXP(farm,12,{source:'wallet_action'});credited(farm,policy.financialGE,'wallet')}
   if(rng()<policy.minigame){awardXP(farm,12,{source:'minigame_xp'});credited(farm,policy.minigameGE,'minigame')}
   if(farm.chickens[0].level>=4&&rng()<policy.bot){botBattles=4;awardXP(farm,40,{source:'bot_practice'})}
  }
  if(grantMilestones)milestoneCheck(farm);
  // Each chicken produces GE once it is a chick (L3), offline too.
  let geLaying=0;for(const c of farm.chickens)if(c.level>=3)geLaying+=rates[c.level];
  credited(farm,geLaying,'passive_laying');
  if(online){
   // Progress alternative eggs without spending; an unclaimed egg persists if coop is full.
   if(farm.unclaimedEggs.length&&farm.chickens.length>=farm.capacity)upgradeCoop(farm);
   if(farm.unclaimedEggs.length)claimMilestoneEgg(farm);
   if(policy.spend==='gear'&&!farm.inventory.length)buyItem(farm,'common');
   if(policy.spend==='eggs'&&!farm.unclaimedEggs.length&&farm.chickens.length<farm.capacity&&farm.chickens.length>=3)purchaseEgg(farm);
   // Distribute optional XP to second chicken; not automatic GE acceleration without activity.
   if(farm.chickens[1])awardXP(farm,Math.min(12,online?12:0),{chickenId:farm.chickens[1].id,source:'secondary_chicken_quest'});
  }
  timeline.push({day,online,level:farm.chickens[0].level,chickens:farm.chickens.map(c=>({id:c.id,level:c.level,stage:c.level<3?'egg':c.level===3?'chick':'adult'})),capacity:farm.capacity,ge:round(farm.ge),geLaying:round(geLaying),walletActions,botBattles,inventoryCount:farm.inventory.length});
 }
 return {cohort,seed,days,farm,timeline,summary:{level:farm.chickens[0].level,chickens:farm.chickens.length,capacity:farm.capacity,GE:round(farm.ge),GEearned:farm.geSources,GEspent:farm.geSinks,inventory:farm.inventory.length}};
}
export function compareFarmScenarios({days=30,seed=20261030,cohorts=['explorer','wallet','gamer'],overrides={}}={}){
 return cohorts.map(cohort=>simulateFarm({days,seed,cohort,...overrides}));
}
