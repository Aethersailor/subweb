import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Pages 只让运行时配置请求进入 Function', async () => {
  const routes = JSON.parse(await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'));
  assert.deepEqual(routes, {
    version: 1,
    include: ['/conf/config.js'],
    exclude: [],
  });
});

test('Pages 对配置与版本禁用缓存，对指纹资源启用长期缓存', async () => {
  const headers = await readFile(new URL('../public/_headers', import.meta.url), 'utf8');
  assert.match(headers, /\/version\.json\s+Cache-Control: no-store, max-age=0/);
  assert.match(headers, /\/conf\/config_static\.js\s+Cache-Control: no-store, max-age=0/);
  assert.match(headers, /\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
});

test('Pages 与 CI 使用同一 Node.js 主版本', async () => {
  const version = (await readFile(new URL('../.node-version', import.meta.url), 'utf8')).trim();
  assert.equal(version, '26');
});
