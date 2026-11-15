import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GameCore,resolveImpact,scopeFov,maxScore} from '../src/game.mjs';
const balance=JSON.parse(fs.readFileSync(new URL('../src/balance.json',import.meta.url)));
function advance(g,seconds){for(let t=0;t<seconds;t+=1/120)g.update(1/120);}
function game(level=1,training=false){const g=new GameCore(balance);g.start(level,training);g.quiet=true;return g;}
function shoot(g,id){const t=g.target(id),origin={x:0,y:1.5,z:0},d={x:t.x,y:t.y-1.5,z:g.level.distanceM};const n=Math.hypot(d.x,d.y,d.z);assert(g.fire(origin,{x:d.x/n,y:d.y/n,z:d.z/n}));advance(g,Math.max(g.level.flightTimeS,g.loadout.cooldownS)+.03);}

test('all nine levels are completable through actual projectile integration, with 15 hits and correct score',()=>{
 for(let level=1;level<=9;level++){const g=game(level);for(let r=1;r<=5;r++){assert.equal(g.round,r);assert.equal(g.targets.length,r);for(const t of [...g.targets])shoot(g,t.id);if(r<5)advance(g,1.7);}assert.equal(g.state,'won');assert.equal(g.hits,15);assert.equal(g.ammo,3);assert.equal(g.score,3050);}
});
test('third error fails exactly once; a bird costs one error and 100 points',()=>{
 const g=game();g.score=220;g.resolve({kind:'hen',targetId:'C01'});assert.equal(g.score,120);assert.equal(g.mistakes,1);assert.equal(g.targets[0].solved,false);assert(g.targets[0].penaltyUntil>0);g.resolve({kind:'miss'});g.resolve({kind:'miss'});assert.equal(g.state,'lost');g.resolve({kind:'miss'});assert.equal(g.mistakes,3);
});
test('a solved target is idempotent and cannot grant another score or mistake',()=>{
 const g=game();g.round=2;g.setupRound();g.resolve({kind:'target',targetId:'C01',center:true});const s=g.score;g.resolve({kind:'target',targetId:'C01',center:true});assert.equal(g.score,s);assert.equal(g.mistakes,0);
});
test('pause freezes projectiles, abilities, breathing and time; resume completes same shot',()=>{
 const g=game();g.hold(true);g.fire({x:0,y:.88,z:0},{x:0,y:0,z:1});g.setPaused(true);const snapshot=JSON.stringify([g.time,g.breath,g.shot,g.cooldown]);advance(g,2);assert.equal(JSON.stringify([g.time,g.breath,g.shot,g.cooldown]),snapshot);g.setPaused(false);advance(g,.8);assert.equal(g.hits,1);
});
test('breath hold is limited and resource recovers; a low resource cannot restart immediately',()=>{
 const g=game();g.hold(true);advance(g,3.05);assert.equal(g.holding,false);assert(g.lockout>0);g.hold(true);assert.equal(g.holding,false);advance(g,5);assert.equal(g.breath,100);g.hold(true);assert.equal(g.holding,true);
});
test('one projectile in flight and a cooldown prevent repeated trigger spam',()=>{
 const g=game();const o={x:0,y:.88,z:0},d={x:0,y:0,z:1};assert(g.fire(o,d));assert.equal(g.fire(o,d),false);assert.equal(g.ammo,17);advance(g,.1);assert.equal(g.fire(o,d),false);
});
test('training permits mistakes without ending the session',()=>{const g=game(1,true);for(let i=0;i<12;i++)g.resolve({kind:'miss'});assert.equal(g.state,'playing');assert.equal(g.mistakes,12);});
test('target disk and hen have separate collision regions',()=>{const t=[{id:'C01',x:0,y:.88,solved:false,penaltyUntil:0}];assert.equal(resolveImpact({x:0,y:.88},t,.5).kind,'target');assert.equal(resolveImpact({x:0,y:2},t,.5).kind,'hen');assert.equal(resolveImpact({x:.8,y:.88},t,.5).kind,'miss');});
test('lens-only FOV has correct apparent magnification, independent of lens size',()=>{for(const m of [1,2,4,24,96])for(const ratio of [.5,.66,.76]){const f=scopeFov(.87,600,600*ratio,m);const apparent=ratio*Math.tan(.87/2)/Math.tan(f/2);assert(Math.abs(apparent-m)<1e-8);}assert.equal(maxScore(),3050);});
test('wind and Professor field affect trajectory deterministically and remain frozen for each shot',()=>{
 const g=game(9);g.quiet=false;g.round=3;g.setupRound();g.time=2;advance(g,.01);assert(g.professorActive);const t=g.target('C04');const d={x:t.x,y:t.y-1.5,z:1000},n=Math.hypot(d.x,d.y,d.z);g.fire({x:0,y:1.5,z:0},{x:d.x/n,y:d.y/n,z:d.z/n});const wind=g.shot.wind,field=g.shot.field;assert(field>0);advance(g,.3);assert.equal(g.shot.wind,wind);assert.equal(g.shot.field,field);
});

test('water substantially obstructs the lens for seconds and can be wiped with a deliberate action',()=>{
 const g=game(5);g.water=.92;advance(g,10);assert(g.water>.50);assert(g.wipe());assert.equal(g.holding,false);advance(g,1.21);assert.equal(g.water,0);assert.equal(g.wiping,0);
 g.water=.92;advance(g,24);assert.equal(g.water,0);
});
test('finale is one round with five moving balloons, eight capsules and safe hens below',()=>{
 const g=game(10);assert.equal(g.level.mode,'balloons');assert.equal(g.targets.length,5);assert.equal(g.ammo,8);
 const t=g.targets[0];assert.equal(resolveImpact({x:t.x,y:t.y},g.targets,.8).kind,'target');assert.equal(resolveImpact({x:t.x,y:.9},g.targets,.8).kind,'hen');
 const x=t.x;g.quiet=false;advance(g,.25);assert(Math.abs(t.x-x)>.5);g.quiet=true;advance(g,.01);
 for(const target of [...g.targets])shoot(g,target.id);
 assert.equal(g.state,'won');assert.equal(g.hits,5);assert.equal(g.ammo,3);assert.equal(g.score,maxScore(5));
});
test('moving finale rewards leading the balloon through full projectile flight',()=>{
 const g=game(10);g.quiet=false;
 for(const t of g.targets){
  const phase=g.targets.findIndex(x=>x.id===t.id)*1.7,arrival=g.time+g.level.flightTimeS;
  const x=t.baseX+Math.sin(arrival*.92+phase)*4.5-g.wind*g.level.targetDiameterM*.38;
  const y=2.8+Math.sin(arrival*2.1+phase)*.22;
  const d={x,y:y-1.5,z:1000},n=Math.hypot(d.x,d.y,d.z);
  assert(g.fire({x:0,y:1.5,z:0},{x:d.x/n,y:d.y/n,z:d.z/n}));advance(g,1.36);
 }
 assert.equal(g.hits,5);assert.equal(g.state,'won');assert.equal(g.mistakes,0);
});
test('a hen remains protected after its balloon has burst',()=>{const g=game(10);const t=g.targets[0];g.resolve({kind:'target',targetId:t.id,center:true});const result=resolveImpact({x:t.x,y:.9},g.targets,.8);assert.equal(result.kind,'hen');g.resolve(result);assert.equal(g.mistakes,1);assert(t.solved);});
