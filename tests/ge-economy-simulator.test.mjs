import test from 'node:test';
import assert from 'node:assert/strict';
import {runScenario,daysToGoal,SCENARIOS} from '../tools/ge-economy-simulator.mjs';

test('L1/L2 no GE, L3 minimum', () => {
  assert.equal(runScenario({roster:[{level:1,count:1},{level:2,count:1},{level:3,count:1}],days:30}).closingBalance,30);
});
test('three L3 produce 90 GE monthly',()=>assert.equal(runScenario({...SCENARIOS.threeChicks,days:30}).closingBalance,90));
test('six L10 produce 360 GE monthly',()=>assert.equal(runScenario({...SCENARIOS.sixAtL10,days:30}).closingBalance,360));
test('24 L20 produce 4320 GE monthly',()=>assert.equal(runScenario({...SCENARIOS.collector,days:30}).closingBalance,4320));
test('historical active scenario reaches 1000 in 11 days',()=>assert.equal(daysToGoal(1000,runScenario({...SCENARIOS.activeHistorical,days:1}).passiveDaily+92.8),11));
test('shop and partner spends affect balance, not total credited',()=>{
  const s=runScenario({days:2,roster:[{level:3,count:1}],startGE:100,shopPurchases:[{day:1,id:'item1',priceGE:20}],dailyPartnerSpendGE:5});
  assert.equal(s.totalCredited,2);assert.equal(s.totalShopSpent,20);assert.equal(s.totalPartnerRedeemed,10);assert.equal(s.closingBalance,72);
});
test('config rejects L3+ rate below guaranteed floor',()=>assert.throws(()=>runScenario({days:1,levelRates:{3:0.5}}),/L3\+/));
test('cannot spend nonexistent GE',()=>assert.throws(()=>runScenario({days:1,shopPurchases:[{day:1,id:'x',priceGE:10}]}),/insufficient/));
test('reproducible results',()=>assert.deepEqual(runScenario({...SCENARIOS.activeHistorical,days:30}),runScenario({...SCENARIOS.activeHistorical,days:30})));
test('zero earning returns null time to goal',()=>assert.equal(daysToGoal(100,0),null));
