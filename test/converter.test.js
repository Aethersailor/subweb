import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countActiveOptions,
  getSubLink,
  normalizeApiBaseUrl,
  normalizeRemoteConfigUrl,
  regexCheck,
  toStandardBase64,
  toUrlSafeBase64,
} from '../src/views/home/index.js';

test('后端地址必须是完整且独立的 HTTP(S) URL', () => {
  assert.equal(regexCheck('https://api.example.com'), true);
  assert.equal(regexCheck('garbage https://example.com suffix'), false);
  assert.equal(regexCheck('ftp://evil/?next=https://example.com'), false);
  assert.throws(() => normalizeApiBaseUrl('https://user:pass@example.com'), /账号/);
  assert.throws(() => normalizeApiBaseUrl('https://example.com?token=secret'), /查询参数/);
});

test('后端地址会移除全部尾部斜杠并保留路径前缀', () => {
  assert.equal(normalizeApiBaseUrl('https://api.example.com////'), 'https://api.example.com');
  assert.equal(normalizeApiBaseUrl('https://api.example.com/subconverter///'), 'https://api.example.com/subconverter');
});

test('远程配置只接受不含账号的 HTTP(S) URL', () => {
  assert.equal(normalizeRemoteConfigUrl(''), '');
  assert.equal(normalizeRemoteConfigUrl('https://example.com/a.ini'), 'https://example.com/a.ini');
  assert.throws(() => normalizeRemoteConfigUrl('javascript:alert(1)'), /HTTP/);
});

test('生成链接始终保留已填写的高级参数，与面板是否折叠无关', () => {
  const link = getSubLink({
    urls: 'https://subscription.example/token\nss://node',
    api: 'https://api.example.com////',
    target: 'surge&ver=4',
    moreConfig: { group: '测试分组', udp: 'false', groups: '节点组-甲' },
  });
  const url = new URL(link);
  assert.equal(url.origin, 'https://api.example.com');
  assert.equal(url.pathname, '/sub');
  assert.equal(url.searchParams.get('target'), 'surge');
  assert.equal(url.searchParams.get('ver'), '4');
  assert.equal(url.searchParams.get('url'), 'https://subscription.example/token|ss://node');
  assert.equal(url.searchParams.get('group'), '测试分组');
  assert.equal(url.searchParams.get('udp'), 'false');
  assert.equal(Buffer.from(url.searchParams.get('groups'), 'base64url').toString(), '节点组-甲');
});

test('来源输入会去除空行和分隔符两侧空白，并拒绝空来源', () => {
  const link = getSubLink({
    urls: '  https://one.example/sub  \n\n | ss://node ',
    api: 'https://api.example.com',
    target: 'clash',
  });
  assert.equal(new URL(link).searchParams.get('url'), 'https://one.example/sub|ss://node');
  assert.throws(() => getSubLink({ urls: ' | \n | ', api: 'https://api.example.com', target: 'clash' }), /有效的订阅/);
});

test('高级参数计数忽略空值但保留显式 false', () => {
  assert.equal(countActiveOptions({ group: '  ', udp: '', tls13: 'false', filename: 'a.yaml' }), 2);
});

test('Base64 编码正确处理 Unicode，且短链编码不是加密', () => {
  assert.equal(Buffer.from(toStandardBase64('订阅🔐'), 'base64').toString(), '订阅🔐');
  assert.equal(Buffer.from(toUrlSafeBase64('订阅🔐'), 'base64url').toString(), '订阅🔐');
});
