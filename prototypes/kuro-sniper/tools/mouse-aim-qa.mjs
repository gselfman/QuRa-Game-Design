import {chromium} from '@playwright/test';import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--ignore-gpu-blocklist']});const results=[],errors=[];
try{
 for(const device of [{name:'user-retina',width:1063,height:614,dpr:2},{name:'mobile-size',width:844,height:390,dpr:1}]){
  const p=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:device.dpr});p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.goto((process.env.KS_QA_URL||'http://127.0.0.1:5178/')+'?qa=1');await p.waitForFunction(()=>!!window.__KS_QA__,undefined,{timeout:90000});
  for(const level of [9,10]){
   if(level===10){await p.locator('#pause').click();await p.locator('#quit').click();}
   await p.locator('#choose').click();await p.locator(`[data-level="${level}"]`).click();
   // Regression: real 20-pixel unscoped drag, no test aim or frozen motion.
   await p.mouse.move(470,240);await p.mouse.down();await p.mouse.move(470,260,{steps:10});await p.mouse.up();await p.keyboard.press('q');
   for(let i=0;i<12&&await p.locator('#zoom-out').isEnabled();i++)await p.locator('#zoom-out').click();
   await p.waitForTimeout(300);
   const ordinary=await p.evaluate(()=>{const q=window.__KS_QA__;return {pitch:q.world.pitch,focusY:1.5+Math.tan(q.world.pitch)*1000,guide:q.world.scopeGuide(),mag:q.world.magnification,ammo:q.core.ammo}});
   assert.equal(ordinary.mag,48);assert(Math.abs(ordinary.pitch)<.004);assert.equal(ordinary.guide,'','ordinary mouse movement must keep targets visible');
   await p.screenshot({path:`qa/v022-L${level}-${device.name}-mouse.png`});
   // A large gesture can put goals outside a high-power lens. Recovery is explicit.
   await p.keyboard.press('q');for(let sweep=0;sweep<2;sweep++){await p.mouse.move(120,Math.min(device.height-40,360));await p.mouse.down();await p.mouse.move(device.width-30,30,{steps:12});await p.mouse.up();}
   await p.mouse.click(470,240,{button:'right'}); // genuine RMB ADS, not a test setter
   for(let i=0;i<12&&await p.locator('#zoom-in').isEnabled();i++)await p.locator('#zoom-in').click();
   await p.waitForTimeout(150);assert(await p.locator('#scope-guide').isVisible());await p.locator('#scope-guide').click();assert(await p.locator('#scope-housing').isHidden());await p.keyboard.press('q');await p.waitForTimeout(200);
   const recovered=await p.evaluate(()=>{const q=window.__KS_QA__;return {guide:q.world.scopeGuide(),mag:q.world.magnification,ammo:q.core.ammo,shot:q.core.shot}});
   assert.equal(recovered.guide,'');assert.equal(recovered.mag,level===10?64:96);assert.equal(recovered.ammo,ordinary.ammo);assert.equal(recovered.shot,null);
   await p.keyboard.press('f');assert(await p.locator('#scope-housing').isHidden());await p.keyboard.press('q');await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>window.__KS_QA__.world.scopeGuide()),'');
   for(const id of ['#aim','#breath','#fire']){assert(await p.locator(id).isVisible());const r=await p.locator(id).boundingBox();assert(r.x>=0&&r.y>=0&&r.x+r.width<=device.width&&r.y+r.height<=device.height);}
   await p.screenshot({path:`qa/v022-L${level}-${device.name}-recovered.png`});results.push({device:device.name,level,ordinary,recovered});
  }
  await p.close();
 }
 assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync('qa/v022-mouse-aim-report.json',JSON.stringify({method:'UI controls and real mouse only; QA hook reads state, never changes aim or freezes motion',results,errors},null,2));console.log(JSON.stringify({results,errors}));
}finally{await browser.close()}
