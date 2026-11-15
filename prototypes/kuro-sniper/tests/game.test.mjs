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
