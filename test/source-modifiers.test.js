import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseSourceItem,
  parseSourceItems,
  serializeSourceItems,
  validateSourceItems,
} from '../src/converter/source-modifiers.js';

test('解析并规范化 SubConverter-Extended 来源前缀', () => {
  assert.deepEqual(parseSourceItem('tag:香港,provider:机场,interval:3600,proxy_direct:false,https://example.com/sub'), {
    url: 'https://example.com/sub',
    tag: '香港',
    provider: '机场',
    interval: '3600',
    proxyDirect: 'false',
  });
  assert.equal(parseSourceItems('https://a.example/sub\nss://node').length, 2);
});

test('来源参数按目标客户端校验并序列化', () => {
  const item = {
    url: 'https://example.com/sub',
    tag: '香港',
    provider: '机场',
    interval: '3600',
    proxyDirect: 'true',
  };
  assert.equal(
    serializeSourceItems([item], 'clash'),
    'tag:香港,provider:机场,interval:3600,proxy_direct:true,https://example.com/sub',
  );
  assert.throws(() => validateSourceItems([item], 'stash'), /Provider 下载出口/);
  assert.throws(() => validateSourceItems([{ ...item, proxyDirect: '', interval: '0' }], 'surge&ver=4'), /必须大于 0/);
});
