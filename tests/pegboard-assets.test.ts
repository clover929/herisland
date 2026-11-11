import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {items} from '../src/features/pegboard/catalog';
import {readyAssetIds} from '../src/features/pegboard/asset-manifest';
describe('pegboard production artwork',()=>{it('has a verified independent file for every item',()=>{expect(readyAssetIds).toHaveLength(74);for(const item of items){expect(item.assetReady,item.id).toBe(true);const path=join(process.cwd(),'public',item.assetPath);expect(existsSync(path),item.id).toBe(true);expect(readFileSync(path).subarray(8,12).toString()).toBe('WEBP')}});it('has nonempty alpha-verified packaging records',()=>{const report=JSON.parse(readFileSync(join(process.cwd(),'public/pegboard/asset-report.json'),'utf8')) as Array<{id:string;transparent:boolean;width:number;height:number;bytes:number}>;expect(report).toHaveLength(74);for(const asset of report){expect(asset.transparent).toBe(true);expect(asset.width).toBeGreaterThan(0);expect(asset.height).toBeGreaterThan(0);expect(asset.bytes).toBeGreaterThan(500)}})});
