import test from 'node:test';
import assert from 'node:assert/strict';
import {createFighter,resolveClash,fight1v1,seeded} from '../tools/arena-engine.mjs';
test('legacy remains default when no T3 variant is selected',()=>{
 const a=createFighter('r'),b=createFighter('r'),c=createFighter('r'),d=createFighter('r');
 assert.deepEqual(resolveClash(a,b,'maneuver','maneuver',.31),resolveClash(c,d,'maneuver','maneuver',.31,{}));
});
test('equal-speed Maneuver simultaneous variant is mirror symmetric',()=>{
 const a=createFighter('r'),b=createFighter('r');
 const outcome=resolveClash(a,b,'maneuver','maneuver',.31,{equalSpeed:'simultaneous'});
 assert.equal(outcome.damageToA,outcome.damageToB);
 assert.equal(a.hp,b.hp);assert.equal(a.shield,b.shield);assert.equal(a.q,b.q);
});
test('equal-speed variant changes only eligible clash and preserves seeded determinism',()=>{
 const cfg={seed:9,strategyA:'equilibrium',strategyB:'equilibrium',rules:{equalSpeed:'simultaneous'}};
 assert.deepEqual(fight1v1('r','r',cfg),fight1v1('r','r',cfg));
 const a=createFighter('r'),b=createFighter('b'),c=createFighter('r'),d=createFighter('b');
 assert.deepEqual(resolveClash(a,b,'attack','defend',.5),resolveClash(c,d,'attack','defend',.5,{equalSpeed:'simultaneous'}));
});
