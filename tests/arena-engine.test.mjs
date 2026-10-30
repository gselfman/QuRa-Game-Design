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

test('legacy online Wall clash parity for 6x6, legal 4-action pairs and deterministic rolls',async()=>{
 const {readFileSync}=await import('node:fs');
 const vm=await import('node:vm');
 const original=readFileSync(new URL('../arena-live-3x3/team-core.js',import.meta.url),'utf8');
 const start=original.indexOf('var R=['),end=original.indexOf('var sharedArenaEngine=',start);
 assert.ok(start>=0&&end>start,'prototype code anchors present');
 const ctx=vm.createContext({Math,JSON,URLSearchParams});
 vm.runInContext(original.slice(start,end),ctx);
 for(const heroA of HEROES)for(const heroB of HEROES){
  for(const ma of ['attack','defend','maneuver','special'])
   for(const mb of ['attack','defend','maneuver','special']){
    const a=createFighter(heroA.id),b=createFighter(heroB.id),la=ctx.clone(ctx.C(heroA.id),0),lb=ctx.clone(ctx.C(heroB.id),0);
    if(ma==='special'){a.q=100;la.q=100}
    if(mb==='special'){b.q=100;lb.q=100}
    const old=ctx.clash(la,lb,ma,mb,.28),current=resolveClash(a,b,ma,mb,.28);
    assert.equal(current.w,old.w,heroA.id+'-'+heroB.id+' '+ma+mb);
    for(const key of ['hp','q','shield','boost','weaken','dead']){
     assert.ok(Math.abs(Number(a[key])-Number(la[key]))<1e-7,heroA.id+' '+key+' '+ma+mb);
     assert.ok(Math.abs(Number(b[key])-Number(lb[key]))<1e-7,heroB.id+' '+key+' '+ma+mb);
    }
   }
 }
});

test('both browser prototypes use the shared Arena Engine',async()=>{
 const {readFileSync}=await import('node:fs');
 const single=readFileSync(new URL('../arena/index.html',import.meta.url),'utf8');
 const multiplayer=readFileSync(new URL('../arena-live-3x3/team-core.js',import.meta.url),'utf8');
 assert.ok(single.includes("import {resolveClash as sharedClash} from '../tools/arena-engine.mjs'"));
 assert.ok(single.includes('sharedClash(ax,by,ca,cb,Math.random())'));
 assert.ok(multiplayer.includes("import('../tools/arena-engine.mjs')"));
 assert.ok(multiplayer.includes('eng.resolveClash('));
 assert.ok(multiplayer.includes('eng.resolveTarget('));
});
test('Arena CLI exports complete matrix with round histograms',async()=>{
 const {mkdtempSync,readFileSync,rmSync}=await import('node:fs');
 const {tmpdir}=await import('node:os'),{join}=await import('node:path'),{execFileSync}=await import('node:child_process');
 const dir=mkdtempSync(join(tmpdir(),'qura-arena-'));
 try{
 execFileSync(process.execPath,['tools/arena-sim-cli.mjs','--per-pair','2','--seed','7','--out',dir],{cwd:new URL('..',import.meta.url),timeout:90000});
 const result=JSON.parse(readFileSync(join(dir,'matrix.json'),'utf8'));
 assert.equal(result.rows.length,36);assert.equal(result.totalBattles,72);
 assert.ok(result.rows.every(r=>r.fights===2&&r.medianRounds>=1));
 assert.ok(result.team3x3.battles>=100);
 assert.ok(readFileSync(join(dir,'matrix.csv'),'utf8').startsWith('heroA,heroB'));
 }finally{rmSync(dir,{recursive:true,force:true})}
});

test('JRPG single-target action parity with legacy targetOutcome (12 cases)',async()=>{
 const {readFileSync}=await import('node:fs'),vm=await import('node:vm');
 const original=readFileSync(new URL('../arena-live-3x3/team-core.js',import.meta.url),'utf8');
 const ctx=vm.createContext({Math,JSON,URLSearchParams});
 vm.runInContext(original.slice(original.indexOf('var R=['),original.indexOf('var sharedArenaEngine=')),ctx);
 for(const move of ['attack','maneuver','special'])
 for(const enemyMove of ['attack','defend','maneuver','special']){
  const oldA=ctx.clone(ctx.C('f'),0),oldB=ctx.clone(ctx.C('b'),0);
  const newA=createTeam(['f']),newB=createTeam(['b']);
  if(move==='special'){oldA.q=100;newA[0].q=100}
  if(enemyMove==='special'){oldB.q=100;newB[0].q=100}
  if(enemyMove==='defend')ctx.charge(oldB,18);
  const expected=ctx.targetOutcome(oldA,oldB,move,enemyMove,.28);
  const output=resolveTarget(newA,newB,[{move,target:0}],[{move:enemyMove,target:0}],()=>.28);
  assert.ok(output.length>=1);assert.equal(output[0].side,1);
  assert.deepEqual(output[0].after,Array.from(expected.after),move+' vs '+enemyMove);
 }
});
