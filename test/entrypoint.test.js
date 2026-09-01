import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import vm from 'node:vm';

const projectRoot = path.resolve(import.meta.dirname, '..');
const staticConfig = path.join(projectRoot, 'public', 'conf', 'config_static.js');

function shellPath(value) {
  return value.replaceAll('\\', '/');
}

function runEntrypoint(configDir, overrides = {}) {
  return spawnSync('sh', ['start.sh'], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      SUBWEB_CONFIG_DIR: shellPath(configDir),
      SUBWEB_STATIC_CONFIG: shellPath(staticConfig),
      SUBWEB_NGINX_BIN: 'true',
      API_URL: '',
      SHORT_URL: '',
      SITE_NAME: '',
      ENABLE_SHORT_URL: '',
      ...overrides,
    },
  });
}

function readGeneratedConfig(configDir) {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(path.join(configDir, 'config.js'), 'utf8'), sandbox);
  return JSON.parse(JSON.stringify(sandbox.window.config));
}

test('容器入口安装默认配置，并按环境变量幂等地重新生成', () => {
  const configDir = mkdtempSync(path.join(tmpdir(), 'subweb-entrypoint-'));
  try {
    const first = runEntrypoint(configDir);
    assert.equal(first.status, 0, first.stderr);
    assert.equal(readGeneratedConfig(configDir).enableShortUrl, false);

    const second = runEntrypoint(configDir, {
      API_URL: 'https://api.example.com/base',
      SITE_NAME: '我的 "站点" \\ test',
      ENABLE_SHORT_URL: 'false',
    });
    assert.equal(second.status, 0, second.stderr);
    assert.deepEqual(readGeneratedConfig(configDir).apiBackends, [
      { name: '自定义后端', url: 'https://api.example.com/base', type: 'auto' },
    ]);
    assert.equal(readGeneratedConfig(configDir).siteName, '我的 "站点" \\ test');
    assert.equal(readGeneratedConfig(configDir).menuItem.length, 2);
    assert.equal(readGeneratedConfig(configDir).remoteConfigOptions.length, 2);

    const third = runEntrypoint(configDir, { API_URL: 'https://new.example.com', SITE_NAME: '更新后' });
    assert.equal(third.status, 0, third.stderr);
    assert.equal(readGeneratedConfig(configDir).apiBackends[0].url, 'https://new.example.com');
    assert.equal(readGeneratedConfig(configDir).siteName, '更新后');
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
});

test('容器入口拒绝非 HTTP(S) 后端与无效短链开关', () => {
  const configDir = mkdtempSync(path.join(tmpdir(), 'subweb-entrypoint-'));
  try {
    const badApi = runEntrypoint(configDir, { API_URL: 'file:///etc/passwd' });
    assert.notEqual(badApi.status, 0);
    assert.match(badApi.stderr, /API_URL must start/);

    const badFlag = runEntrypoint(configDir, { ENABLE_SHORT_URL: 'yes' });
    assert.notEqual(badFlag.status, 0);
    assert.match(badFlag.stderr, /must be true or false/);

    const badName = runEntrypoint(configDir, { SITE_NAME: 'bad\nname' });
    assert.notEqual(badName.status, 0);
    assert.match(badName.stderr, /control characters/);
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
});
