import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../functions/conf/config.js.js';

function parseConfigScript(script) {
  const prefix = 'window.config = ';
  assert.ok(script.startsWith(prefix));
  return JSON.parse(script.slice(prefix.length, -1));
}

test('Pages Function 默认关闭短链接并返回禁止缓存的脚本', async () => {
  const response = await onRequest({ env: {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const config = parseConfigScript(await response.text());
  assert.equal(config.enableShortUrl, false);
  assert.equal(config.apiBackends[0].url, 'https://sub.xeton.dev');
});

test('Pages Function 校验 JSON 环境变量并过滤不安全值', async () => {
  const response = await onRequest({
    env: {
      API_BACKENDS: JSON.stringify([
        { name: '正常', url: 'https://api.example.com/base/' },
        { name: '危险', url: 'javascript:alert(1)' },
      ]),
      MENU_ITEM: JSON.stringify([{ title: '危险', link: 'data:text/html,bad', target: '_blank' }]),
      ENABLE_SHORT_URL: 'true',
      SHORT_URL: 'https://short.example.com/',
    },
  });
  const config = parseConfigScript(await response.text());
  assert.deepEqual(config.apiBackends, [{ name: '正常', url: 'https://api.example.com/base', type: 'auto' }]);
  assert.deepEqual(config.menuItem, []);
  assert.equal(config.enableShortUrl, true);
  assert.equal(config.shortUrl, 'https://short.example.com');
});

test('Pages Function 保留后端类型、拒绝不安全后端并限制请求方法', async () => {
  const response = await onRequest({
    request: new Request('https://sub.example.com/conf/config.js'),
    env: {
      API_BACKENDS: JSON.stringify([
        { name: 'SCE', url: 'https://api.example.com', type: 'sce' },
        { name: '传统', url: 'https://legacy.example.com', type: 'legacy' },
        { name: '不安全', url: 'http://plain.example.com', type: 'sce' },
      ]),
    },
  });
  const config = parseConfigScript(await response.text());
  assert.deepEqual(config.apiBackends, [
    { name: 'SCE', url: 'https://api.example.com', type: 'sce' },
    { name: '传统', url: 'https://legacy.example.com', type: 'legacy' },
  ]);

  const head = await onRequest({
    request: new Request('https://sub.example.com/conf/config.js', { method: 'HEAD' }),
    env: {},
  });
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('cache-control'), 'no-store, max-age=0');

  const rejected = await onRequest({
    request: new Request('https://sub.example.com/conf/config.js', { method: 'POST' }),
    env: {},
  });
  assert.equal(rejected.status, 405);
  assert.equal(rejected.headers.get('allow'), 'GET, HEAD');
});
