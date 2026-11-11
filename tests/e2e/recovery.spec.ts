import {test,expect} from '@playwright/test';

test('desktop real Ollama cancellation releases the slot and retry succeeds',async({page})=>{
 test.setTimeout(150000);
 page.on('dialog',d=>d.accept());
 const pageErrors:string[]=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 await page.setViewportSize({width:1280,height:844});
 await page.goto('/');
 for(const route of ['/discussions','/communities','/profile','/ai','/']){
  await page.locator(`header nav a[href="${route}"]`).click();
  await expect(page).toHaveURL(route);
 }
 await page.getByRole('contentinfo').getByRole('link',{name:'女性人物资料库'}).click();
 await expect(page).toHaveURL('/women');
 await page.getByLabel('姓名或关键词').fill('Marie');
 await page.getByRole('button',{name:'搜索筛选'}).click();
 await page.getByRole('link',{name:'玛丽·居里',exact:true}).click();
 await expect(page.getByRole('heading',{name:'玛丽·居里',exact:true})).toBeVisible();
 await page.goto('/ai');
 const panel=page.locator('.sunny-page');
 await panel.getByLabel('对话模式').selectOption('Companion');
 await panel.getByLabel('给小晴的消息').fill('请用简短中文介绍你能提供什么帮助。');
 const firstRequest=page.waitForRequest(r=>r.url().endsWith('/api/ai/chat'),{timeout:5000});
 await panel.getByRole('button',{name:'发送',exact:true}).click();
 await firstRequest;
 await expect(panel.getByRole('status')).toBeVisible();
 await panel.getByRole('button',{name:'取消生成'}).click();
 await expect(panel.getByRole('alert')).toContainText('已取消生成');
 await expect(panel.getByRole('button',{name:'重新发送'})).toBeVisible();
 const started=performance.now();
 const retryResponse=page.waitForResponse(r=>r.url().endsWith('/api/ai/chat'),{timeout:94000});
 await panel.getByRole('button',{name:'重新发送'}).click();
 const response=await retryResponse;
 const data=await response.json();
 const elapsedMs=Math.round(performance.now()-started);
 console.log(`[REAL OLLAMA RECOVERY] ${JSON.stringify({status:response.status(),elapsedMs})}`);
 expect(response.status()).toBe(200);
 expect(data.message.content).not.toMatch(/<think>|首先，用户|关键点：|回应草稿/);
 await expect(panel.locator('.sunny-messages article')).toHaveCount(2);
 expect(pageErrors).toEqual([]);
});

test('390px mobile Sunny interaction with explicit MOCK response',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/api/ai/chat',route=>route.fulfill({json:{message:{role:'assistant',content:'这是标记为 MOCK 的移动端交互回复。'}}}));
 await page.goto('/');
 await page.getByRole('button',{name:'展开导航'}).click();
 await page.locator('header nav a[href="/ai"]').click();
 const panel=page.locator('.sunny-page');
 await panel.getByLabel('给小晴的消息').fill('移动端测试');
 await panel.getByRole('button',{name:'发送',exact:true}).click();
 await expect(panel.getByText('这是标记为 MOCK 的移动端交互回复。')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
