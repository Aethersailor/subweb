export const TEXT_PARAMETERS = ['include', 'exclude', 'group', 'filename', 'interval', 'dev_id', 'rename'];
export const BASE64_PARAMETERS = ['groups', 'ruleset'];
export const BOOLEAN_PARAMETERS = [
  'emoji',
  'add_emoji',
  'remove_emoji',
  'append_type',
  'tfo',
  'udp',
  'list',
  'sort',
  'sort_script',
  'script',
  'insert',
  'scv',
  'fdn',
  'expand',
  'append_info',
  'prepend',
  'classic',
  'tls13',
  'provider_proxy_direct',
  'new_name',
  'strict',
];

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

export function countActiveOptions(moreConfig = {}) {
  return [...TEXT_PARAMETERS, ...BASE64_PARAMETERS, ...BOOLEAN_PARAMETERS].filter((name) => {
    const value = moreConfig[name];
    return typeof value === 'string' ? value.trim() !== '' : value !== undefined && value !== null;
  }).length;
}

export function getSubLink({ urls, api, target, remoteConfig = '', moreConfig = {} }) {
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

  for (const name of TEXT_PARAMETERS) {
    const value = String(moreConfig[name] ?? '').trim();
    if (value) {
      params.set(name, value);
    }
  }
  for (const name of BASE64_PARAMETERS) {
    const value = String(moreConfig[name] ?? '').trim();
    if (value) {
      params.set(name, toUrlSafeBase64(value));
    }
  }
  for (const name of BOOLEAN_PARAMETERS) {
    const value = moreConfig[name];
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
