import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countSuppressedSourceModifiers,
  minimumSourceInterval,
  parseSourceItem,
  parseSourceItems,
  serializePlainSourceItems,
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
  assert.equal(serializeSourceItems([item], 'stash'), 'tag:香港,provider:机场,interval:3600,https://example.com/sub');
  assert.equal(countSuppressedSourceModifiers([item], 'stash'), 1);
  assert.equal(serializeSourceItems([item], 'singbox'), 'https://example.com/sub');
  assert.equal(countSuppressedSourceModifiers([item], 'singbox'), 4);
  assert.equal(serializePlainSourceItems([item]), 'https://example.com/sub');
  assert.equal(
    serializeSourceItems([{ ...item, url: 'ss://node' }], 'clash'),
    'tag:香港,ss://node',
    '单节点只保留有意义的 tag 前缀',
  );
  assert.equal(countSuppressedSourceModifiers([{ ...item, url: 'ss://node' }], 'clash'), 3);
  assert.equal(minimumSourceInterval('clash'), 0);
  assert.equal(minimumSourceInterval('surge&ver=4'), 1);
  assert.throws(() => validateSourceItems([{ ...item, proxyDirect: '', interval: '0' }], 'surge&ver=4'), /必须大于 0/);
  assert.throws(() => validateSourceItems([{ ...item, tag: '香港,入口' }], 'clash'), /不能包含逗号/);
  assert.throws(() => validateSourceItems([{ ...item, provider: '机场|备用' }], 'clash'), /不能包含逗号、竖线/);
});
