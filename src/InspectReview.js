const {chromium}=require('C:/Users/sonoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const run=process.argv[2];
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});
 let errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto('file:///'+path.join(run,'Review.html').replaceAll('\\','/'));
 await page.screenshot({path:path.join(run,'review-preview.png'),fullPage:false});
 await page.locator('svg').first().screenshot({path:path.join(run,'layout-preview.png')});
 const filter=page.locator('#filter');await filter.fill('Partition');
 const rows=await page.locator('#bom tr:visible').count();
 if(rows===0)throw Error('BOM filter failed');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
 console.log(JSON.stringify({pageErrors:errs,filteredRows:rows,horizontalOverflow:overflow}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
