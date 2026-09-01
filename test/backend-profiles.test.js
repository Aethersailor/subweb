import assert from 'node:assert/strict';
import test from 'node:test';
import { countSuppressedOptions, getTargetOptions, isParameterAvailable } from '../src/converter/profiles.js';
import { getSubLink } from '../src/views/home/index.js';

test('SubConverter-Extended 内置目标完整且传统目标保持原列表', () => {
  const extendedTargets = getTargetOptions('subconverter-extended');
  assert.equal(extendedTargets.length, 25);
  for (const target of [
    'auto',
    'stash',
    'v2rayn',
    'v2rayng',
    'shadowrocket',
    'trojan',
    'vless',
    'hysteria2',
    'mixed',
  ]) {
    assert.ok(
      extendedTargets.some((item) => item.value === target),
      `缺少 ${target}`,
    );
  }
  const legacy = getTargetOptions('legacy');
  assert.equal(legacy.length, 15);
  assert.equal(
    legacy.some((item) => item.value === 'stash'),
    false,
  );
});

test('SubConverter-Extended 参数按目标限制，传统模式保持历史可用性', () => {
  assert.equal(isParameterAvailable('groups', 'subconverter-extended', 'clash'), false);
  assert.equal(isParameterAvailable('new_name', 'subconverter-extended', 'clash'), false);
  assert.equal(isParameterAvailable('provider_proxy_direct', 'subconverter-extended', 'clash'), true);
  assert.equal(isParameterAvailable('provider_proxy_direct', 'subconverter-extended', 'stash'), false);
  assert.equal(isParameterAvailable('provider_headers', 'subconverter-extended', 'stash'), true);
  assert.equal(isParameterAvailable('provider_headers', 'subconverter-extended', 'surge&ver=4'), false);
  assert.equal(isParameterAvailable('groups', 'legacy', 'clash'), true);
  assert.equal(isParameterAvailable('provider_headers', 'legacy', 'clash'), false);
});

test('SubConverter-Extended 链接不发送被忽略或强制的参数', () => {
  const link = new URL(
    getSubLink({
      urls: 'ss://node',
      api: 'https://api.example.com',
      target: 'clash',
      backendType: 'subconverter-extended',
      moreConfig: {
        groups: 'ignored group',
        ruleset: 'ignored rule',
        new_name: 'false',
        provider_proxy_direct: 'true',
        provider_headers: 'X-Test-Key',
      },
    }),
  );
  assert.equal(link.searchParams.has('groups'), false);
  assert.equal(link.searchParams.has('ruleset'), false);
  assert.equal(link.searchParams.has('new_name'), false);
  assert.equal(link.searchParams.get('provider_proxy_direct'), 'true');
  assert.equal(link.searchParams.get('provider_headers'), 'X-Test-Key');
  assert.equal(
    countSuppressedOptions({ groups: 'x', provider_proxy_direct: 'true' }, 'subconverter-extended', 'stash'),
    2,
  );
});

test('SubConverter-Extended 拒绝同时开启 Clash Script 和内联规则', () => {
  assert.throws(
    () =>
      getSubLink({
        urls: 'ss://node',
        api: 'https://api.example.com',
        target: 'clash',
        backendType: 'subconverter-extended',
        moreConfig: { script: 'true', expand: 'true' },
      }),
    /不能同时开启/,
  );
});
