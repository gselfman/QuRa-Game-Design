import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--ignore-gpu-blocklist']});const errors=[];const results=[];
try{
for(const device of [{name:'mobile',width:844,height:390,dpr:1},{name:'retina',width:1440,height:850,dpr:2}]){
 const p=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:device.dpr});p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.goto('http://127.0.0.1:5178/?qa=1');await p.waitForFunction(()=>!!window.__KS_QA__,undefined,{timeout:90000});
 for(const level of [9,10]){
  await p.evaluate(level=>{const q=window.__KS_QA__;q.start(level);q.freeze(true);q.ads(true);q.world.aimAt('C01')},level);await p.waitForTimeout(800);
  const optics=await p.evaluate(()=>{const q=window.__KS_QA__,w=q.world,t=q.core.targets[0];return {level:q.core.level.id,entry:w.magnification,width:w.scope.getSize().width,near:w.scopeCamera.minZ,waterHidden:document.querySelector('#water-drops').classList.contains('hidden'),diameter:w.diameter,renderHeight:w.engine.getRenderHeight(),cssHeight:w.canvas.clientHeight,targetDiameterPixels:w.engine.getRenderHeight()*q.core.level.targetDiameterM/(2*q.core.level.distanceM*Math.tan(w.camera.fov/2))*w.magnification,centered:w.scopeGuide()===''}});
  assert(optics.renderHeight>=optics.cssHeight);assert(optics.waterHidden);assert(optics.centered);assert(optics.near>=40);assert(optics.targetDiameterPixels>=20);assert.equal(optics.entry,level===9?144:64);
  await p.screenshot({path:`qa/v021-level-${level}-${device.name}.png`});
  await p.evaluate(()=>{window.__KS_QA__.world.pitch=.08});await p.waitForTimeout(200);assert(await p.locator('#scope-guide').isVisible());
  await p.evaluate(()=>{const q=window.__KS_QA__;q.world.aimAt('C01');q.core.water=.92;});await p.waitForTimeout(180);assert(await p.locator('#water-drops').isVisible());
  await p.evaluate(()=>{const q=window.__KS_QA__;q.core.water=0;q.world.magnification=192;});await p.waitForTimeout(250);await p.screenshot({path:`qa/v021-level-${level}-max-${device.name}.png`});
  const diskBounds=await p.evaluate(()=>{const q=window.__KS_QA__,w=q.world,t=q.core.targets[0],side=q.core.level.mode==='balloons'?4:0;return {x:w.canvas.clientWidth/2,y:w.canvas.clientHeight/2,point:{x:t.x,y:t.y},mag:w.magnification}});assert.equal(diskBounds.mag,192);
  results.push({...optics,device:device.name});
 }
 // Actual controls, not forced aim: start the moving finale and use search zoom.
 await p.evaluate(()=>{const q=window.__KS_QA__;q.start(10);q.freeze(false);q.ads(true)});await p.waitForTimeout(1600);assert.equal(await p.evaluate(()=>window.__KS_QA__.world.magnification),64);await p.locator('#zoom-in').click();assert(await p.evaluate(()=>window.__KS_QA__.world.magnification>64));await p.locator('#zoom-out').click();await p.locator('#aim').click();assert(await p.locator('#scope-housing').isHidden());await p.close();
}
assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync('qa/v021-long-range-report.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));
}finally{await browser.close()}
