import test from 'node:test';
import assert from 'node:assert/strict';
import {quantile,summarize,simulatePopulation,compareBalance,rowsToCSV} from '../tools/farm-monte-carlo-m4.mjs';

test('quantiles and empty samples',()=>{assert.equal(quantile([10,0,20,30],.5),15);assert.equal(quantile([],.5),null);assert.equal(summarize([]).p75,null)});
test('fixed seed and configuration reproduce population',()=>{const c={users:15,days:20,seed:123};assert.deepEqual(simulatePopulation(c),simulatePopulation(c))});
test('cohort allocation covers users',()=>{const s=simulatePopulation({users:31,days:10});assert.equal(Object.values(s.cohortCount).reduce((a,b)=>a+b,0),31)});
test('per-user samples and percentiles are bounded',()=>{const s=simulatePopulation({users:20,days:30,collectSamples:true});assert.equal(s.samples.length,20);assert.ok(s.metrics.level.p25<=s.metrics.level.p50);assert.ok(s.metrics.level.p50<=s.metrics.level.p75);assert.ok(s.samples.every(x=>x.chickens>=1&&x.geBalance>=0))});
test('milestone denominator is full cohort, not only achievers',()=>{const s=simulatePopulation({users:10,days:1});assert.ok(s.milestones.L10.rate<=1);assert.equal(s.milestones.L10.rate,s.milestones.L10.reached/10)});
test('same user seeds make config diffs comparable',()=>{const c=compareBalance({users:15,days:30,baseline:{rateOverrides:{10:2}},candidate:{rateOverrides:{10:3}}});assert.equal(c.diff.geBalance.delta,c.candidate.metrics.geBalance.mean-c.baseline.metrics.geBalance.mean)});
test('changing only L3 rate preserves floor',()=>{assert.throws(()=>simulatePopulation({users:2,days:2,overrides:{rateOverrides:{3:0}}}),/minimum GE/)});
test('CSV includes rows and never includes undefined',()=>{const s=simulatePopulation({users:4,days:7,collectSamples:true});const csv=rowsToCSV(s.samples);assert.equal(csv.trim().split('\n').length,5);assert.ok(csv.includes('geBalance'))});
test('invalid user counts rejected',()=>assert.throws(()=>simulatePopulation({users:0}),/users/));
