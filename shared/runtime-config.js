const DEFAULT_API_BACKENDS = [
  {
    name: '官方公共服务（订阅内容会发送至此）',
    url: 'https://sub.xeton.dev',
    type: 'auto',
  },
];

const DEFAULT_REMOTE_CONFIG_OPTIONS = [
  {
    value: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini',
    text: 'ACL4SSR Online',
  },
  {
    value: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini',
    text: 'ACL4SSR Online Full',
  },
];

const DEFAULT_MENU_ITEMS = [
  { title: '首页', link: '/', target: '' },
  {
    title: 'GitHub',
    link: 'https://github.com/Aethersailor/subweb',
    target: '_blank',
  },
];

export const DEFAULT_RUNTIME_CONFIG = Object.freeze({
  siteName: 'Subconverter Web',
  apiBackends: DEFAULT_API_BACKENDS,
  enableShortUrl: false,
  shortUrl: '',
  menuItem: DEFAULT_MENU_ITEMS,
  remoteConfigOptions: DEFAULT_REMOTE_CONFIG_OPTIONS,
});

function normalizeHttpUrl(value, { allowPath = true, requireHttps = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  try {
    const url = new URL(value.trim());
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (requireHttps && url.protocol !== 'https:') ||
      url.username ||
      url.password
    ) {
      return '';
    }
    if (!allowPath && (url.search || url.hash)) {
      return '';
    }
    return url.href;
  } catch {
    return '';
  }
}

function normalizeMenuLink(value) {
  if (typeof value !== 'string') {
    return '';
  }
  const link = value.trim();
  if (link.startsWith('/') && !link.startsWith('//')) {
    return link;
  }
  return normalizeHttpUrl(link);
}

function normalizeApiBackends(value, issues, { requireHttps = false } = {}) {
  if (!Array.isArray(value)) {
    issues.push('apiBackends 不是数组，已使用默认后端');
    value = DEFAULT_API_BACKENDS;
  }

  const normalized = value.flatMap((item) => {
    const url = normalizeHttpUrl(item?.url, { allowPath: false, requireHttps });
    if (!url) {
      return [];
    }
    const type = ['auto', 'sce', 'legacy'].includes(item?.type) ? item.type : 'auto';
    if (item?.type !== undefined && item.type !== type) {
      issues.push(`后端 ${String(item?.name || new URL(url).host)} 的 type 无效，已使用 auto`);
    }
    return [{ name: String(item?.name || new URL(url).host).trim(), url: url.replace(/\/+$/, ''), type }];
  });

  if (normalized.length !== value.length) {
    issues.push('已忽略无效的后端配置');
  }
  return normalized;
}

function normalizeRemoteConfigs(value, issues) {
  if (!Array.isArray(value)) {
    issues.push('remoteConfigOptions 不是数组，已使用默认远程配置');
    value = DEFAULT_REMOTE_CONFIG_OPTIONS;
  }

  const normalized = value.flatMap((item) => {
    const url = normalizeHttpUrl(item?.value);
    if (!url) {
      return [];
    }
    return [{ text: String(item?.text || new URL(url).host).trim(), value: url }];
  });
  if (normalized.length !== value.length) {
    issues.push('已忽略无效的远程配置地址');
  }
  return normalized;
}

function normalizeMenuItems(value, issues) {
  if (!Array.isArray(value)) {
    issues.push('menuItem 不是数组，已使用默认菜单');
    value = DEFAULT_MENU_ITEMS;
  }

  const normalized = value.flatMap((item) => {
    const link = normalizeMenuLink(item?.link);
    const title = String(item?.title || '').trim();
    if (!link || !title) {
      return [];
    }
    return [{ title, link, target: item?.target === '_blank' ? '_blank' : '' }];
  });
  if (normalized.length !== value.length) {
    issues.push('已忽略不安全或不完整的菜单项');
  }
  return normalized;
}

export function normalizeRuntimeConfig(rawConfig, { safeFallback = false, requireSecureBackends = false } = {}) {
  const issues = [];
  const raw = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
  if (raw !== rawConfig) {
    issues.push('运行时配置缺失，已进入安全手动模式');
  }

  const defaults = safeFallback
    ? { ...DEFAULT_RUNTIME_CONFIG, apiBackends: [], remoteConfigOptions: [] }
    : DEFAULT_RUNTIME_CONFIG;
  const source = { ...defaults, ...raw };
  const shortUrl = normalizeHttpUrl(source.shortUrl, {
    allowPath: false,
    requireHttps: requireSecureBackends,
  }).replace(/\/+$/, '');
  const enableShortUrl = source.enableShortUrl === true && Boolean(shortUrl);

  if (source.enableShortUrl === true && !shortUrl) {
    issues.push('短链接地址无效，短链接功能已关闭');
  }

  return {
    config: {
      siteName:
        String(source.siteName || defaults.siteName)
          .trim()
          .slice(0, 80) || defaults.siteName,
      apiBackends: normalizeApiBackends(source.apiBackends, issues, { requireHttps: requireSecureBackends }),
      enableShortUrl,
      shortUrl,
      menuItem: normalizeMenuItems(source.menuItem, issues),
      remoteConfigOptions: normalizeRemoteConfigs(source.remoteConfigOptions, issues),
    },
    issues: [...new Set(issues)],
  };
}
