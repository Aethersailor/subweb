import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BACKEND_TYPES,
  assertCapabilitiesMatchIdentity,
  parseBackendIdentity,
  resolveBackendType,
  validateSceCapabilities,
} from '../src/converter/backend.js';

function capabilitiesFixture() {
  return {
    schema_version: 1,
    backend: { family: 'SubConverter-Extended', version: 'v1.9.2', revision: '483a9e7' },
    targets: [
      { name: 'auto', parser: 'user-agent', remote_mode: 'auto', simple_subscription: false },
      { name: 'clash', parser: 'mihomo', remote_mode: 'clash-proxy-provider', simple_subscription: false },
    ],
    query_parameters: {
      recognized: ['target', 'url', 'new_name'],
      ignored: ['groups'],
      internal: ['upload'],
      forced: { new_name: true },
      target_constraints: { provider_proxy_direct: ['clash'] },
    },
    source_modifiers: [{ name: 'tag', type: 'string', targets: ['clash'] }],
  };
}

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

test('SCE 能力接口经过严格规范化并拒绝重复目标', () => {
  const normalized = validateSceCapabilities(capabilitiesFixture());
  assert.deepEqual(
    normalized.targets.map((item) => item.name),
    ['auto', 'clash'],
  );
  assert.deepEqual(normalized.query_parameters.forced, { new_name: true });

  const duplicate = capabilitiesFixture();
  duplicate.targets.push(duplicate.targets[1]);
  assert.throws(() => validateSceCapabilities(duplicate), /重复目标/);

  assert.equal(
    assertCapabilitiesMatchIdentity(normalized, parseBackendIdentity('SubConverter-Extended v1.9.2-483a9e7 backend')),
    normalized,
  );
  assert.throws(
    () =>
      assertCapabilitiesMatchIdentity(normalized, parseBackendIdentity('SubConverter-Extended v1.9.1-702ba49 backend')),
    /版本与 \/version 不一致/,
  );
});
