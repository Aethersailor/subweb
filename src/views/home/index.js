import {
  BASE64_PARAMETERS,
  BOOLEAN_PARAMETERS,
  TEXT_PARAMETERS,
  countActiveOptions as countProfileOptions,
  filterMoreConfig,
} from '../../converter/profiles.js';

export { BASE64_PARAMETERS, BOOLEAN_PARAMETERS, TEXT_PARAMETERS };

function bytesToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function toUrlSafeBase64(value) {
  return bytesToBase64(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function toStandardBase64(value) {
  return bytesToBase64(value);
}

export function normalizeApiBaseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError('请输入后端 API 地址');
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new TypeError('后端 API 地址格式无效');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new TypeError('后端 API 仅支持 HTTP 或 HTTPS');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new TypeError('后端 API 地址不能包含账号、查询参数或锚点');
  }

  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href.replace(/\/+$/, '');
}

export function normalizeRemoteConfigUrl(value) {
  if (!value) {
    return '';
  }
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new TypeError('远程配置地址格式无效');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new TypeError('远程配置仅支持不含账号信息的 HTTP 或 HTTPS 地址');
  }
  return url.href;
}

export function countActiveOptions(moreConfig = {}, backendType = 'legacy', target = 'clash') {
  return countProfileOptions(moreConfig, backendType, target);
}

export function getSubLink({ urls, api, target, remoteConfig = '', moreConfig = {}, backendType = 'legacy' }) {
  const normalizedApi = normalizeApiBaseUrl(api);
  const normalizedSources = urls
    .split(/\r?\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join('|');
  if (!normalizedSources) {
    throw new TypeError('请输入有效的订阅链接或节点');
  }
  const params = new URLSearchParams();
  const [targetName, ...targetArguments] = target.split('&');
  params.set('target', targetName);
  for (const argument of targetArguments) {
    const [name, value = ''] = argument.split('=');
    if (name) {
      params.set(name, value);
    }
  }
  params.set('url', normalizedSources);

  const normalizedRemoteConfig = normalizeRemoteConfigUrl(remoteConfig);
  if (normalizedRemoteConfig) {
    params.set('config', normalizedRemoteConfig);
  }

  const effectiveConfig = filterMoreConfig(moreConfig, backendType, target);
  if (
    backendType === 'subconverter-extended' &&
    effectiveConfig.script === 'true' &&
    effectiveConfig.expand === 'true'
  ) {
    throw new TypeError('Clash Script 与内联展开规则集不能同时开启');
  }

  for (const name of TEXT_PARAMETERS) {
    const value = String(effectiveConfig[name] ?? '').trim();
    if (value) {
      params.set(name, value);
    }
  }
  for (const name of BASE64_PARAMETERS) {
    const value = String(effectiveConfig[name] ?? '').trim();
    if (value) {
      params.set(name, toUrlSafeBase64(value));
    }
  }
  for (const name of BOOLEAN_PARAMETERS) {
    const value = effectiveConfig[name];
    if (value === 'true' || value === 'false') {
      params.set(name, value);
    }
  }

  return `${normalizedApi}/sub?${params.toString()}`;
}

export function regexCheck(value) {
  try {
    normalizeApiBaseUrl(value);
    return true;
  } catch {
    return false;
  }
}
