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
  assert.deepEqual(config.apiBackends, [{ name: '正常', url: 'https://api.example.com/base' }]);
  assert.deepEqual(config.menuItem, []);
  assert.equal(config.enableShortUrl, true);
  assert.equal(config.shortUrl, 'https://short.example.com');
});
