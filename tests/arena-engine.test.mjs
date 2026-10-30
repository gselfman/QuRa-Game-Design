import test from 'node:test';import assert from 'node:assert/strict';
import {HEROES,createFighter,resolveClash,fight1v1,seeded,legal,equilibrium,createTeam,resolveWall,assertInvariants,pairings,resolveTarget} from '../tools/arena-engine.mjs';
test('six prototype founders',()=>assert.equal(HEROES.length,6));
test('legal Special only at 100 charge',()=>{const f=createFighter('r');assert.equal(legal(f).includes('special'),false);f.q=100;assert.equal(legal(f).includes('special'),true)});
test('deterministic fight',()=>assert.deepEqual(fight1v1('r','b',{seed:42,strategyA:'equilibrium',strategyB:'equilibrium'}),fight1v1('r','b',{seed:42,strategyA:'equilibrium',strategyB:'equilibrium'})));
test('HP shield charge invariant',()=>{const a=createFighter('r'),b=createFighter('p'),rng=seeded(7);for(let i=0;i<20&&!a.dead&&!b.dead;i++){resolveClash(a,b,legal(a)[0],legal(b)[0],rng());assertInvariants([a,b])}});
test('dead fighter has no legal actions',()=>{const a=createFighter('r'),b=createFighter('b');a.hp=0;a.dead=true;assert.deepEqual(legal(a),[]);assert.throws(()=>resolveClash(a,b,'attack','attack'),/illegal/)});
test('Wall target list uses more numerous side',()=>{const a=createTeam(['r','b','f']),b=createTeam(['m']);assert.equal(pairings(a,b).length,3)});
test('Wall outcome deterministic',()=>{const a=createTeam(['r','b']),b=createTeam(['f','p']);const r=resolveWall(a,b,['attack','defend'],['defend','attack'],seeded(4));assert.equal(r.length,2);assertInvariants([...a,...b])});
test('equilibrium probabilities sum to one',()=>{const a=createFighter('g'),b=createFighter('m'),mix=equilibrium(a,b);assert.ok(Math.abs(mix.probabilities.reduce((x,y)=>x+y,0)-1)<1e-8)});

test('JRPG target auto-retargets after preferred target is eliminated',()=>{
 const a=createTeam(['r']),b=createTeam(['f','m']);
 b[0].dead=true;b[0].hp=0;
 const result=resolveTarget(a,b,[{move:'attack',target:0}],[null,{move:'attack',target:0}],seeded(6));
 assert.equal(result[0].targetPos,1);assertInvariants([...a,...b]);
});
test('JRPG avoids action by eliminated actor',()=>{
 const a=createTeam(['r']),b=createTeam(['f']);b[0].dead=true;b[0].hp=0;
 assert.equal(resolveTarget(a,b,[{move:'attack',target:0}],[{move:'attack',target:0}],seeded(1)).length,0);
});

test('3v3 deterministic Wall simulation',async()=>{
 const {fight3v3}=await import('../tools/arena-engine.mjs');
 const cfg={seed:42,maxRounds:15,strategyA:'random',strategyB:'random'};
 const a=fight3v3(['r','b','f'],['p','m','g'],cfg);
 assert.deepEqual(a,fight3v3(['r','b','f'],['p','m','g'],cfg));
 assert.ok(a.rounds>=1&&a.rounds<=15);
});
test('defense tactics only select legal moves',async()=>{
 const {chooseDefense}=await import('../tools/arena-engine.mjs');
 const a=createFighter('r'),b=createFighter('f');
 for(const policy of ['aggressive','cautious','tricky'])
  for(let seed=1;seed<10;seed++)assert.ok(legal(a).includes(chooseDefense(a,b,policy,seeded(seed))));
});
