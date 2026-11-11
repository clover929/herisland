import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import records from '../src/features/women/candidates.json';
import {parseWomen,directoryWomen,publicWomen,browseWomen,relatedWomen} from '../src/features/women/schema';
import {WomanPortrait} from '../src/components/woman-portrait';
import review from '../src/features/women/review-001.json';
const all=parseWomen(records);
describe('102位目录与首批审核',()=>{
 it('真实目录标识与姓名唯一、每领域至少十位',()=>{
  expect(all.length).toBeGreaterThanOrEqual(100);
  for(const key of ['id','slug','nameEn'] as const)expect(new Set(all.map(w=>w[key])).size).toBe(all.length);
  for(const f of new Set(all.flatMap(w=>w.fields)))expect(all.filter(w=>w.fields.includes(f)).length).toBeGreaterThanOrEqual(10);
 });
 it('真实姓名、领域地区组合、关键词、空态与分页',()=>{
  expect(directoryWomen(all)).toHaveLength(102);
  expect(browseWomen(all,'MARIE CURIE','科学','法国').items.map(w=>w.slug)).toEqual(['marie-curie']);
  expect(browseWomen(all,'屠呦呦','医学','中国').total).toBe(1);
  expect(browseWomen(all,'青蒿素').items.map(w=>w.slug)).toContain('tu-youyou');
  expect(browseWomen(all,'屠呦呦','体育').total).toBe(0);
  expect(browseWomen(all,'','','',9).items).toHaveLength(6);
  expect(browseWomen(all,'','','',-1).page).toBe(1);
 });
 it('候选不进目录、已核实不直接发布、精选需审核',()=>{
  const sample=all[0];
  for(const status of ['candidate','researching','verified'] as const){
   const rows=[{...sample,status,featured:false,reviewedAt:null}];
   expect(publicWomen(rows)).toHaveLength(0);
   expect(directoryWomen(rows)).toHaveLength(status==='verified'?1:0);
  }
  expect(()=>parseWomen([{...sample,reviewedAt:null}])).toThrow();
  expect(()=>parseWomen([{...sample,status:'verified',featured:true}])).toThrow();
  expect(publicWomen(all).map(w=>w.slug)).toEqual(review.slugs);
  expect(all.filter(w=>w.featured)).toHaveLength(8);
 });
 it('时间线、核实日期和图片出处需要完整证据',()=>{
  for(const w of all){
   expect(w.lastVerifiedAt).toBe('2026-11-09');
   for(const event of w.timeline)for(const url of event.sourceUrls)expect(w.sources.some(s=>s.url===url)).toBe(true);
   expect(w.image.sourceUrl).toBe('/women-placeholder.svg');expect(w.image.author).toBe('HerSpace');
  }
  expect(()=>parseWomen([{...all[0],timeline:[{year:1903,description:'事件',sourceUrls:['https://missing.example']}]}])).toThrow();
  expect(()=>parseWomen([{...all[0],lastVerifiedAt:null}])).toThrow();
  expect(()=>parseWomen([{...all[0],image:{...all[0].image,sourceUrl:'javascript:alert(1)'}}])).toThrow();
 });
 it('相关推荐只含已发布人物并优先同领域、排除自身',()=>{
  const related=relatedWomen(all,all[0]);expect(related).toHaveLength(3);
  expect(related.every(w=>w.status==='published'&&w.id!==all[0].id)).toBe(true);
  expect(related[0].fields).toContain('科学');
 });
 it('图片缺失或统一占位时安全显示设计占位图',()=>{
  for(const src of [undefined,'','/women-placeholder.svg']){
   const html=renderToStaticMarkup(createElement(WomanPortrait,{name:'测试人物',src}));
   expect(html).toContain('测试人物 · 肖像占位图');expect(html).not.toContain('<img');
  }
 });
});
