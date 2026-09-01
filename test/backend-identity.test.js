import assert from 'node:assert/strict';
import test from 'node:test';
import { BACKEND_TYPES, parseBackendIdentity, resolveBackendType } from '../src/converter/backend.js';

test('识别 SCE 正式版、开发版和传统后端版本', () => {
  assert.deepEqual(parseBackendIdentity('SubConverter-Extended v1.9.2-483a9e7 backend'), {
    family: 'sce',
    version: 'v1.9.2',
    channel: 'stable',
    revision: '483a9e7',
    raw: 'SubConverter-Extended v1.9.2-483a9e7 backend',
  });
  assert.equal(parseBackendIdentity('SubConverter-Extended dev-ac281c5 backend').channel, 'dev');
  assert.equal(parseBackendIdentity('subconverter v0.9.9-ecb63a9b backend').family, 'legacy');
  assert.equal(parseBackendIdentity('').family, 'unknown');
});

test('后端配置与在线身份冲突时进入未知安全模式', () => {
  assert.equal(resolveBackendType('auto', BACKEND_TYPES.SCE, true), BACKEND_TYPES.SCE);
  assert.equal(resolveBackendType('sce', BACKEND_TYPES.SCE, true), BACKEND_TYPES.SCE);
  assert.equal(resolveBackendType('sce', BACKEND_TYPES.LEGACY, true), BACKEND_TYPES.UNKNOWN);
  assert.equal(resolveBackendType('sce', BACKEND_TYPES.UNKNOWN, false), BACKEND_TYPES.SCE);
  assert.equal(resolveBackendType('auto', BACKEND_TYPES.UNKNOWN, false), BACKEND_TYPES.UNKNOWN);
});
