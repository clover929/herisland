import {test,expect} from '@playwright/test';
import review from '../../src/features/women/review-001.json' with {type:'json'};
import records from '../../src/features/women/candidates.json' with {type:'json'};
test('首页保留虚构故事，精选八位并进入102位目录',async({page})=>{
 await page.goto('/');await expect(page.getByText('人物专题 · 虚构示例')).toBeVisible();
 await expect(page.getByRole('region',{name:'精选真实女性人物'}).locator('.woman-card')).toHaveCount(8);
 await page.getByRole('link',{name:'浏览人物资料库 →'}).click();
 await expect(page.getByRole('status')).toHaveText('共 102 位人物');await expect(page.locator('.woman-card')).toHaveCount(12);
 await page.screenshot({path:'test-results/women-directory-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'下一页'}).click();await expect(page).toHaveURL(/page=2/);
 await expect(page.getByText('已核实 · 待内容审核',{exact:true}).first()).toBeVisible();
});
test('真实搜索、组合筛选及空状态',async({page})=>{
 await page.goto('/women');await page.getByLabel('姓名或关键词').fill('Marie');
 await page.getByLabel('领域',{exact:true}).selectOption('科学');await page.getByLabel('国家或地区',{exact:true}).selectOption('法国');
 await page.getByRole('button',{name:'搜索筛选'}).click();await expect(page.getByRole('status')).toHaveText('共 1 位人物');
 await page.getByRole('link',{name:'玛丽·居里',exact:true}).click();await expect(page.getByRole('heading',{name:'玛丽·居里',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'资料来源',exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'相关推荐'}).locator('.woman-card')).toHaveCount(3);
 await page.goto('/women?q=没有这个人物');await expect(page.getByRole('heading',{name:'没有匹配的人物'})).toBeVisible();
});
test('首批详情200，其余审核中及未知人物404',async({request})=>{
 for(const slug of review.slugs){const r=await request.get(`/women/${slug}`);expect(r.status()).toBe(200);expect(await r.text()).toContain('已审核发布');}
 for(const w of records.filter(w=>w.status!=='published'))expect((await request.get(`/women/${w.slug}`)).status()).toBe(404);
 expect((await request.get('/women/missing-person')).status()).toBe(404);
});
test('移动目录及详情无横向溢出，分页可操作',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/women');
 await expect(page.locator('.woman-card')).toHaveCount(12);await page.getByRole('link',{name:'下一页'}).click();
 await expect(page).toHaveURL(/page=2/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/women/marie-curie');await expect(page.getByRole('img',{name:'玛丽·居里 · 肖像占位图'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/women-detail-mobile.png',fullPage:true});
});
