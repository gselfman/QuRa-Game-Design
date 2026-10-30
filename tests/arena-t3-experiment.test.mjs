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

test('Speed: sequential initiative prevents an eliminated fighter from attacking',async()=>{
 const a=createFighter('f'),b=createFighter('b');a.hp=10;b.hp=10;
 const simultaneous=resolveClash({...a},{...b},'attack','attack',.25);
 const sequential=resolveClash(a,b,'attack','attack',.25,{speedOrder:'sequential'});
 assert.equal(simultaneous.after[0],0);
 assert.equal(simultaneous.after[1],0);
 assert.equal(sequential.after[0],10);
 assert.equal(sequential.after[1],0);
});
test('charge variant changes meter, never exceeds 100',()=>{
 const a=createFighter('r'),b=createFighter('g');
 resolveClash(a,b,'attack','maneuver',.25,{chargeTable:{win:40,lose:10,tie:25}});
 assert.equal(a.q,40);assert.equal(b.q,10);
});
test('time-limit tie policy is explicit, not double KO',()=>{
 const config={seed:1,maxRounds:1,strategyA:'random',strategyB:'random'};
 const draw=fight1v1('r','m',{...config,tiePolicy:'draw'});
 assert.equal(draw.winner,3);assert.equal(draw.termination,'timeout');
});
test('1-vs-3 once-per-action prevents duplicated shield and charge',async()=>{
 const {createTeam,resolveWall,seeded}=await import('../tools/arena-engine.mjs');
 const A=createTeam(['r']),B=createTeam(['b','f','g']);
 const originalA=createTeam(['r']),originalB=createTeam(['b','f','g']);
 resolveWall(A,B,['maneuver'],['defend','defend','defend'],seeded(1),{multiCollision:'once'});
 resolveWall(originalA,originalB,['maneuver'],['defend','defend','defend'],seeded(1));
 assert.ok(A[0].shield<originalA[0].shield);assert.ok(A[0].q<=100);
});
test('JRPG lost-action variant differs from automatic retarget',async()=>{
 const {createTeam,resolveTarget,seeded}=await import('../tools/arena-engine.mjs');
 const A=createTeam(['r']),B=createTeam(['f','m']);B[0].dead=true;B[0].hp=0;
 const lost=resolveTarget(A,B,[{move:'attack',target:0}],[null,{move:'attack',target:0}],seeded(1),{retarget:'lost'});
 const C=createTeam(['r']),D=createTeam(['f','m']);D[0].dead=true;D[0].hp=0;
 const auto=resolveTarget(C,D,[{move:'attack',target:0}],[null,{move:'attack',target:0}],seeded(1),{retarget:'auto'});
 assert.equal(lost[0].lost,true);assert.equal(auto[0].targetPos,1);
});

test('two simultaneous Specials preserve symmetry for mirror founder states',()=>{
 for(const id of ['r','m','g','b','p']){
  const a=createFighter(id),b=createFighter(id);a.q=b.q=100;
  resolveClash(a,b,'special','special',.5,{specialOrder:'simultaneous'});
  assert.equal(a.hp,b.hp,id+' mirrored HP');
  assert.equal(a.shield,b.shield,id+' mirrored shield');
  assert.equal(a.q,b.q,id+' mirrored charge');
 }
});

test('simultaneous Special keeps full result stable on side swap for all founders',()=>{
 for(const id of ['r','b','f','p','m','g']){
  const left=createFighter(id),right=createFighter(id);
  left.q=right.q=100;
  const one=resolveClash(left,right,'special','special',.5,{specialOrder:'simultaneous'});
  const againA=createFighter(id),againB=createFighter(id);
  againA.q=againB.q=100;
  const two=resolveClash(againB,againA,'special','special',.5,{specialOrder:'simultaneous'});
  assert.equal(one.damageToA,two.damageToB,id);
  assert.equal(one.damageToB,two.damageToA,id);
  assert.equal(left.hp,right.hp,id);
 }
});
test('double KO tie-break is deterministic and does not erase physical KO event',()=>{
 const a=fight1v1('r','r',{seed:72,maxRounds:30,strategyA:'equilibrium',strategyB:'equilibrium',rules:{equalSpeed:'simultaneous'},doubleKOPolicy:'pre_round_hp'});
 const b=fight1v1('r','r',{seed:72,maxRounds:30,strategyA:'equilibrium',strategyB:'equilibrium',rules:{equalSpeed:'simultaneous'},doubleKOPolicy:'pre_round_hp'});
 assert.deepEqual(a,b);
 if(a.termination==='double_ko')assert.ok(a.winner===1||a.winner===2);
});
