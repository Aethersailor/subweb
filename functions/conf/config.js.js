import { DEFAULT_RUNTIME_CONFIG, normalizeRuntimeConfig } from '../../shared/runtime-config.js';

function parseJsonArray(value, fallback, variableName) {
  if (!value) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new TypeError('value must be an array');
    }
    return parsed;
  } catch (error) {
    console.error(`${variableName} is invalid: ${error.message}`);
    return fallback;
  }
}

function readBoolean(value, fallback = false) {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value.trim().toLowerCase() === 'true';
}

export async function onRequest({ request, env }) {
  const method = request?.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    return new Response('Method Not Allowed\n', {
      status: 405,
      headers: {
        allow: 'GET, HEAD',
        'content-type': 'text/plain; charset=UTF-8',
        'cache-control': 'no-store, max-age=0',
        'x-content-type-options': 'nosniff',
      },
    });
  }
  const defaultBackends = env.API_URL ? [{ name: '自定义后端', url: env.API_URL }] : DEFAULT_RUNTIME_CONFIG.apiBackends;

  const rawConfig = {
    siteName: env.SITE_NAME || DEFAULT_RUNTIME_CONFIG.siteName,
    apiBackends: parseJsonArray(env.API_BACKENDS, defaultBackends, 'API_BACKENDS'),
    enableShortUrl: readBoolean(env.ENABLE_SHORT_URL, false),
    shortUrl: env.SHORT_URL || '',
    menuItem: parseJsonArray(env.MENU_ITEM, DEFAULT_RUNTIME_CONFIG.menuItem, 'MENU_ITEM'),
    remoteConfigOptions: parseJsonArray(env.REMOTE_CONFIG, DEFAULT_RUNTIME_CONFIG.remoteConfigOptions, 'REMOTE_CONFIG'),
  };

  const { config, issues } = normalizeRuntimeConfig(rawConfig, { requireSecureBackends: true });
  if (issues.length) {
    console.warn(`Runtime configuration was normalized: ${issues.join('; ')}`);
  }

  return new Response(method === 'HEAD' ? null : `window.config = ${JSON.stringify(config)};`, {
    headers: {
      'content-type': 'application/javascript; charset=UTF-8',
      'cache-control': 'no-store, max-age=0',
      'x-content-type-options': 'nosniff',
    },
  });
}
