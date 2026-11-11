const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();
 for(const width of [1440,1024,390]){
  const p=await b.newPage({viewport:{width,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:3000');await p.waitForSelector('.hi-water-overlay');await p.locator('.stories').scrollIntoViewIfNeeded();
  console.log(width,await p.evaluate(()=>({cards:[...document.querySelectorAll('.story')].map(e=>({gap:e.querySelector('h3').getBoundingClientRect().top-e.querySelector('span').getBoundingClientRect().bottom,overflow:e.scrollWidth>e.clientWidth})),gap:document.querySelector('.columns .sectionhead').getBoundingClientRect().top-document.querySelector('.stories').getBoundingClientRect().bottom,labels:[...document.querySelectorAll('.hi-region-nav small')].map(e=>e.textContent)})));
  await p.screenshot({path:`artifacts/visual-check/fixed-stories-${width}.png`});
  if(width===1440){
   await p.locator('.hi-tilt-card').first().hover({position:{x:15,y:15}});await p.waitForTimeout(450);console.log('tilt',await p.locator('.hi-tilt-card').first().evaluate(e=>getComputedStyle(e).transform));
   await p.locator('.hi-viewport').scrollIntoViewIfNeeded();let last=0;
   for(const t of [0,2,5]){await p.waitForTimeout((t-last)*1000);last=t;console.log('frame',t,await p.locator('.hi-world').evaluate(e=>({map:e.style.transform,wave:getComputedStyle(e.querySelector('.hi-water-a')).transform,foam:getComputedStyle(e.querySelector('.hi-shore-foam')).strokeDashoffset})));await p.screenshot({path:`artifacts/visual-check/water-${t}.png`});}
  }
  console.log('errors',errors);await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
