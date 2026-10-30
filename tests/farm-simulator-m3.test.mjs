import test from 'node:test';
import assert from 'node:assert/strict';
import {createFarm,hatchEgg,awardXP,buyItem,upgradeCoop,purchaseEgg,grantMilestoneEgg,claimMilestoneEgg,simulateFarm,compareFarmScenarios} from '../tools/farm-simulator-m3.mjs';

test('L1 and L2 produce no GE; L3 produces at least 1 daily',()=>{
 const s=simulateFarm({days:30,startingXP:55,policyOverrides:{login:0},grantMilestones:false});
 assert.equal(s.summary.GEearned.passive_laying,30);
 assert.equal(s.summary.GE,30);
});
test('one egg starts at L1; L3 after 55 XP, L4 after 110 XP',()=>{
 const f=createFarm();assert.equal(f.chickens[0].level,1);
 awardXP(f,55);assert.equal(f.chickens[0].level,3);
 awardXP(f,55);assert.equal(f.chickens[0].level,4);
});
test('capacity prevents hatching and preserves milestone egg',()=>{
 const f=createFarm({capacity:2});assert.ok(hatchEgg(f));assert.equal(hatchEgg(f),null);
 grantMilestoneEgg(f,'SECOND_L6');assert.equal(claimMilestoneEgg(f),false);
 assert.deepEqual(f.unclaimedEggs,['SECOND_L6']);
});
test('free coop 2 to 4 and gear prices',()=>{
 const f=createFarm({startingGE:100});assert.equal(upgradeCoop(f),true);assert.equal(f.capacity,4);
 assert.equal(buyItem(f,'common'),true);assert.equal(f.ge,25);assert.equal(f.inventory.length,1);
});
test('ordinary incubation egg costs GE and begins at L1',()=>{
 const f=createFarm({startingGE:1000});assert.equal(upgradeCoop(f),true);
 assert.equal(purchaseEgg(f),true);assert.equal(f.ge,0);assert.equal(f.chickens[1].level,1);
 assert.equal(purchaseEgg(f),false);
});
test('do not allow insufficient balance or negative rate',()=>{
 const f=createFarm();assert.equal(buyItem(f,'legendary'),false);
 assert.throws(()=>simulateFarm({rateOverrides:{3:0.5}}),/minimum GE/);
});
test('farm simulation is deterministic for same seed',()=>{
 const a=simulateFarm({days:30,seed:25}),b=simulateFarm({days:30,seed:25});assert.deepEqual(a,b);
});
test('three behavior cohorts produce a daily timeline',()=>{
 const s=compareFarmScenarios({days:30});assert.equal(s.length,3);
 for(const x of s){assert.equal(x.timeline.length,30);assert.ok(x.summary.chickens<=x.summary.capacity);assert.ok(x.summary.GE>=0);}
});
test('first L6 milestone can be claimed only once',()=>{
 const f=createFarm({startingXP:310});assert.equal(grantMilestoneEgg(f,'SECOND_L6'),true);
 assert.equal(grantMilestoneEgg(f,'SECOND_L6'),false);
 assert.equal(claimMilestoneEgg(f),true);
 assert.equal(grantMilestoneEgg(f,'SECOND_L6'),false);
});
