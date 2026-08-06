import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_RUNTIME_CONFIG, normalizeRuntimeConfig } from '../shared/runtime-config.js';

test('配置完全缺失时进入无默认后端的安全手动模式', () => {
  const { config, issues } = normalizeRuntimeConfig(undefined, { safeFallback: true });
  assert.deepEqual(config.apiBackends, []);
  assert.equal(config.enableShortUrl, false);
  assert.ok(issues.some((issue) => issue.includes('安全手动模式')));
});

test('显式空后端列表会被保留，UI 可据此进入手动模式', () => {
  const { config } = normalizeRuntimeConfig({ ...DEFAULT_RUNTIME_CONFIG, apiBackends: [] });
  assert.deepEqual(config.apiBackends, []);
});

test('无效后端、远程配置与危险菜单协议会被过滤', () => {
  const { config, issues } = normalizeRuntimeConfig({
    ...DEFAULT_RUNTIME_CONFIG,
    apiBackends: [{ name: 'bad', url: 'ftp://example.com' }],
    remoteConfigOptions: [{ text: 'bad', value: 'file:///etc/passwd' }],
    menuItem: [
      { title: '危险', link: 'javascript:alert(1)', target: '_blank' },
      { title: '站内', link: '/help', target: '_blank' },
    ],
  });
  assert.deepEqual(config.apiBackends, []);
  assert.deepEqual(config.remoteConfigOptions, []);
  assert.deepEqual(config.menuItem, [{ title: '站内', link: '/help', target: '_blank' }]);
  assert.ok(issues.length >= 3);
});

test('短链接只有在显式开启且地址有效时才启用', () => {
  assert.equal(
    normalizeRuntimeConfig({ ...DEFAULT_RUNTIME_CONFIG, enableShortUrl: true, shortUrl: '' }).config.enableShortUrl,
    false,
  );
  const { config } = normalizeRuntimeConfig({
    ...DEFAULT_RUNTIME_CONFIG,
    enableShortUrl: true,
    shortUrl: 'https://short.example.com/',
  });
  assert.equal(config.enableShortUrl, true);
  assert.equal(config.shortUrl, 'https://short.example.com');
});
