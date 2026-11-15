import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {maxScore} from '../src/rewards.mjs';
import assert from 'node:assert/strict';
fs.mkdirSync('qa',{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--ignore-gpu-blocklist']});
const errors=[],notFound=[];
const page=await browser.newPage({viewport:{width:1440,height:850},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)notFound.push({status:r.status(),url:r.url()});});
await page.goto('http://127.0.0.1:5178/?qa=1');
await page.waitForFunction(()=>!!window.__KS_QA__,undefined,{timeout:60000});
await page.screenshot({path:'qa/home-desktop.png'});
await page.click('#start');await page.evaluate(()=>window.__KS_QA__.freeze(true));await page.waitForTimeout(200);await page.screenshot({path:'qa/game-desktop.png'});
await page.click('#aim');await page.waitForTimeout(200);assert.equal(await page.locator('#scope-housing').isVisible(),false);
await page.evaluate(()=>{window.__KS_QA__.start(2);window.__KS_QA__.freeze(true);window.__KS_QA__.world.aimAt('C01');});await page.waitForTimeout(300);await page.screenshot({path:'qa/optics-before.png'});
await page.click('#aim');await page.waitForTimeout(300);await page.screenshot({path:'qa/optics-after.png'});
await page.evaluate(()=>window.__KS_QA__.start(5));await page.waitForTimeout(300);await page.click('#aim');await page.waitForTimeout(300);await page.screenshot({path:'qa/scope-desktop.png'});
await page.evaluate(()=>{const q=window.__KS_QA__;q.core.round=5;q.core.setupRound();q.world.aimAt('C02');});await page.waitForTimeout(250);await page.click('#aim');await page.evaluate(()=>{window.__KS_QA__.core.water=.85;});await page.waitForTimeout(150);await page.screenshot({path:'qa/roster-scope.png'});
await page.click('#wipe');await page.evaluate(()=>window.__KS_QA__.advance(1));assert.equal(await page.evaluate(()=>window.__KS_QA__.core.water),0);

const campaign=[];
for(let level=1;level<=9;level++){
 await page.evaluate(id=>{window.__KS_QA__.start(id);window.__KS_QA__.freeze(true);},level);
 for(let r=1;r<=5;r++){
  for(let h=0;h<r;h++){
   await page.evaluate(()=>{const q=window.__KS_QA__,t=q.core.targets.find(x=>!x.solved);q.world.aimAt(t.id);});await page.waitForTimeout(55);
   await page.locator('#fire').dispatchEvent('pointerdown',{pointerId:8,button:0});
   await page.evaluate(()=>{const q=window.__KS_QA__;q.advance(Math.max(q.core.level.flightTimeS,q.core.loadout.cooldownS)+.05);});
  }
  if(r<5)await page.evaluate(()=>window.__KS_QA__.advance(1.7));
 }
 const result=await page.evaluate(()=>window.__KS_QA__.state);
 assert.equal(result.state,'won',`level ${level}`);assert.equal(result.ammo,3);assert.equal(result.score,maxScore(15,level));campaign.push(result);console.log('PASS campaign level',level);
}
await page.evaluate(()=>{window.__KS_QA__.start(1);window.__KS_QA__.freeze(false);});
await page.click('#pause');const time=await page.evaluate(()=>window.__KS_QA__.core.time);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__KS_QA__.core.time),time);await page.click('#resume');await page.waitForTimeout(1250);assert.equal(await page.evaluate(()=>window.__KS_QA__.core.paused),false);
const breath=await page.locator('#breath').boundingBox();await page.mouse.move(breath.x+breath.width/2,breath.y+breath.height/2);await page.mouse.down();await page.waitForTimeout(450);assert(await page.evaluate(()=>window.__KS_QA__.core.holding));assert(await page.evaluate(()=>window.__KS_QA__.core.breath<100));await page.mouse.up();assert.equal(await page.evaluate(()=>window.__KS_QA__.core.holding),false);
await page.evaluate(()=>{const q=window.__KS_QA__;q.start(1);q.freeze(true);q.world.yaw=.18;q.world.pitch=.15;});await page.waitForTimeout(100);
for(let n=0;n<3;n++){await page.locator('#fire').dispatchEvent('pointerdown',{pointerId:9,button:0});await page.evaluate(()=>window.__KS_QA__.advance(1));}
assert.equal(await page.evaluate(()=>window.__KS_QA__.state.state),'lost');

const mobile=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:1,isMobile:true,hasTouch:true});const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(String(e)));
await mp.goto('http://127.0.0.1:5178/?qa=1');await mp.waitForFunction(()=>!!window.__KS_QA__,undefined,{timeout:60000});await mp.screenshot({path:'qa/home-mobile.png'});await mp.locator('#start').tap();await mp.waitForTimeout(250);await mp.screenshot({path:'qa/game-mobile.png'});
await mp.evaluate(()=>{const q=window.__KS_QA__;q.start(5);q.freeze(true);q.ads(true);q.core.round=5;q.core.setupRound();q.ads(true);q.world.aimAt('C02');});await mp.waitForTimeout(300);await mp.screenshot({path:'qa/scope-mobile.png'});
await mp.evaluate(()=>{window.__KS_QA__.start(1);window.__KS_QA__.freeze(false);});
const bounds=await mp.locator('#breath').boundingBox(),fb=await mp.locator('#fire').boundingBox();const cx=Math.round(bounds.x+bounds.width/2),cy=Math.round(bounds.y+bounds.height/2),fx=Math.round(fb.x+fb.width/2),fy=Math.round(fb.y+fb.height/2);
const cdp=await mobile.newCDPSession(mp);const p1={x:cx,y:cy,id:1},p2={x:350,y:230,id:2};
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p1]});await mp.waitForTimeout(100);assert(await mp.evaluate(()=>window.__KS_QA__.core.holding));
const yaw=await mp.evaluate(()=>window.__KS_QA__.world.yaw);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p1,p2]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p1,{...p2,x:380}]});assert.notEqual(await mp.evaluate(()=>window.__KS_QA__.world.yaw),yaw);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p1,{...p2,x:380},{x:fx,y:fy,id:3}]});assert.equal(await mp.evaluate(()=>window.__KS_QA__.core.ammo),17);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await mp.evaluate(()=>window.__KS_QA__.core.holding),false);
await mp.setViewportSize({width:390,height:844});await mp.waitForTimeout(100);assert(await mp.locator('#rotate').isVisible());assert(await mp.evaluate(()=>window.__KS_QA__.core.paused));
const report={campaign,mobileTouch:'PASS: hold breath + drag + fire with three simultaneous contacts',pause:'PASS',breath:'PASS',threeMisses:'PASS',orientation:'PASS',errors,notFound};fs.writeFileSync('qa/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();assert.equal(errors.length,0);
