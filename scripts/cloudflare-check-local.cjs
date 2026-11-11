// Local-only smoke runner; never deploys. Override the preview port if needed.
const fs=require('node:fs');
const source=fs.readFileSync('scripts/audit-production.cjs','utf8')
 .replace('http://127.0.0.1:3200',process.env.HERISLAND_CF_PREVIEW_URL||'http://127.0.0.1:3302')
 .replace('/tmp/her-production-smoke.json','/tmp/her-cloudflare-smoke.json')
 .replaceAll('production-${width}','cloudflare-${width}');
require('node:vm').runInThisContext('(function(require){'+source+'\n})',{filename:__filename})(require);
