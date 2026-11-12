/** Accept the provider's non-binding development-domain notice, never a TLS warning. */
exports.visit=async function visit(page,url){
 let response=await page.goto(url,{timeout:45000});
 const notice=page.getByRole('button',{name:/确定访问/});
 if(await notice.count()){
  const navigation=page.waitForResponse(r=>r.request().isNavigationRequest()&&new URL(r.url()).pathname===new URL(url).pathname&&r.status()===200,{timeout:45000});
  await notice.click({timeout:15000});response=await navigation;
  await page.locator('header .brand').waitFor({timeout:30000});
 }
 return response;
};
