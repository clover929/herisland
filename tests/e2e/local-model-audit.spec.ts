import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';

test('真实 Ollama：Companion / Explore / Write 串行完成并记录耗时',async({page})=>{
 page.on('dialog',d=>d.accept());
 test.setTimeout(240000);
 await page.goto('/ai');
 const panel=page.locator('.sunny-page');
 const results:{mode:string;status?:number;elapsedMs?:number;answer?:string;error?:string}[]=[];
 for(const [mode,prompt] of [['Companion','你好，用一句中文介绍你能提供什么帮助。'],['Explore','有哪些值得了解的女性数学家？'],['Write','给一篇读书分享拟一个十字以内的标题。']]){
  await panel.getByLabel('对话模式').selectOption(mode);
  await panel.getByLabel('给小晴的消息').fill(prompt);
  const started=performance.now();
  const responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/ai/chat'),{timeout:94000});
  await panel.getByRole('button',{name:'发送',exact:true}).click();
  const response=await responsePromise;
  const data=await response.json();
  const elapsedMs=Math.round(performance.now()-started);
  const answer=String(data.message?.content||data.error?.message||'');
  results.push({mode,status:response.status(),elapsedMs,answer:answer.slice(0,500)});
  writeFileSync('/tmp/herspace-sunny-ollama-modes.json',JSON.stringify(results,null,2));
  console.log(`[REAL OLLAMA] ${JSON.stringify({mode,status:response.status(),elapsedMs,preview:answer.slice(0,180)})}`);
  expect(response.status(),`${mode}真实本地模型状态`).toBe(200);
  expect(answer).not.toMatch(/<think>|首先，用户|关键点：|回应草稿|最终回应草稿/);
  await expect(panel.locator('.sunny-messages article')).toHaveCount(2);
  await expect(panel.locator('.sunny-messages article').last().locator('p')).not.toBeEmpty();
  if(mode==='Explore'){
   expect(answer).toMatch(/\/women\/[a-z0-9-]+/);
   expect(answer).toMatch(/来源：[^\n]*https:\/\//);
  }
  await panel.getByRole('button',{name:'清空对话'}).click();
 }
});
