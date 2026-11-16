import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=process.env.KS_QA_URL||'http://127.0.0.1:5190/QuRa-Game-Design/sniper/';
const output=process.env.KS_QA_REPORT||'qa/v043-hosting-local.json';
const report={base,errors:[],failedRequests:[],assetCount:0,levels:[]};
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--ignore-gpu-blocklist']});
try {
  const page=await browser.newPage({viewport:{width:1067,height:610},deviceScaleFactor:1});
  page.on('pageerror',error=>report.errors.push(String(error)));
  page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text())});
  page.on('requestfailed',request=>report.failedRequests.push(request.url()+': '+request.failure()?.errorText));
  page.on('response',response=>{if(response.status()>=400)report.errors.push(response.status()+' '+response.url());if(response.url().includes('/assets/'))report.assetCount++});
  await page.goto(base,{timeout:90000});
  await page.locator('#loading.hidden').waitFor({state:'attached',timeout:120000});
  report.title=await page.title();assert.equal(report.title,'QuRa. Снайпер');
  assert.equal(await page.evaluate(()=>typeof window.__KS_QA__),'undefined');
  await page.locator('#start').click();
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('Space');
  await page.waitForFunction(()=>document.querySelector('#ammo').textContent==='17');
  report.normalShot={ammo:await page.locator('#ammo').textContent(),score:await page.locator('#score').textContent()};
  await page.goto(base+'?qa=1',{timeout:90000});
  await page.waitForFunction(()=>!!window.__KS_QA__,undefined,{timeout:120000});
  for(let id=1;id<=10;id++) {
    await page.evaluate(id=>{const q=window.__KS_QA__;q.start(id);q.freeze(true);q.ads(true)},id);
    await page.waitForTimeout(800);
    const scope=await page.evaluate(async()=>{
      const w=window.__KS_QA__.world,s=w.scope.getSize();
      const a=await w.scope.readPixels(0,0,null,true,false,s.width/2-48,s.height/2-48,96,96);
      let sum=0,sq=0;for(let i=0;i<a.length;i+=4){sum+=a[i];sq+=a[i]*a[i]}
      const n=a.length/4;return {sd:Math.sqrt(Math.max(0,sq/n-(sum/n)**2)),frames:w.scopeStatus.frames};
    });
    report.levels.push({id,...scope});
    if(id>1)assert.ok(scope.sd>5,`Level ${id} scope is blank: ${scope.sd}`);
    if([2,10].includes(id))await page.screenshot({path:output.replace(/\.json$/,`-L${id}.png`)});
  }
  report.info=await page.evaluate(async()=>fetch(new URL('kuro-prototype-info.json',location.href)).then(r=>r.json()));
  assert.equal(report.info.version,'0.4.3');
  assert.ok(report.assetCount>80);
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);
  report.passed=true;
} finally {
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  await browser.close();
}
console.log(JSON.stringify(report));
