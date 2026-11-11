import {describe,it,expect} from 'vitest';
import records from '../src/features/women/candidates.json';
import first from '../src/features/women/batch-001.json';
import previous from '../src/features/women/batch-002.json';
import batch from '../src/features/women/batch-003.json';
import {parseWomen,publicWomen} from '../src/features/women/schema';
describe('研究批次003',()=>{
 it('恰好十位，排除上一批并保持唯一标识',()=>{
  expect(batch.slugs).toHaveLength(10);
  expect(new Set(batch.slugs).size).toBe(10);
  expect(batch.slugs.filter(s=>[...first.slugs,...previous.slugs].includes(s))).toEqual([]);
  expect(new Set(records.map(w=>w.nameEn)).size).toBe(records.length);
  expect(parseWomen(records)).toHaveLength(102);
 });
 it('十个目标领域各覆盖一位，每人有职业、两项事实、正文及证据',()=>{
  const selected=records.filter(w=>batch.slugs.includes(w.slug));
  expect(new Set(selected.flatMap(w=>w.fields)).size).toBe(10);
  for(const w of selected){
   expect(['verified','published']).toContain(w.status);expect(w.occupation.length).toBeGreaterThan(0);
   expect(w.facts.length).toBeGreaterThanOrEqual(2);
   expect(w.achievements.length).toBeGreaterThanOrEqual(2);
   expect(w.summary.length).toBeGreaterThanOrEqual(100);expect(w.summary.length).toBeLessThanOrEqual(150);
   expect(w.story.replace(/\s/g,'').length).toBeGreaterThanOrEqual(300);expect(w.story.replace(/\s/g,'').length).toBeLessThanOrEqual(500);
   for(const f of w.facts)for(const url of f.sourceUrls)expect(w.sources.some(s=>s.url===url&&s.checkedAt===batch.checkedAt)).toBe(true);
   expect(batch.evidence.find(e=>e.slug===w.slug)?.facts).toEqual(w.facts);
   expect(w.image.url).toBe('/women-placeholder.svg');expect(w.featured ? w.status==='published' : true).toBe(true);
  }
 });
 it('保持前批已核实与公开隔离',()=>{
  for(const slug of [...first.slugs,...previous.slugs])expect(['verified','published']).toContain(records.find(w=>w.slug===slug)?.status);
  expect(publicWomen(records)).toHaveLength(10);expect(publicWomen(records).every(w=>Boolean(w.reviewedAt))).toBe(true);
 });
});
