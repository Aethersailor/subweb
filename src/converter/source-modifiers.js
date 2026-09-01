import { baseTarget } from './profiles.js';

const PREFIXES = Object.freeze([
  ['tag:', 'tag'],
  ['provider:', 'provider'],
  ['interval:', 'interval'],
  ['proxy_direct:', 'proxyDirect'],
]);

export const SOURCE_MODIFIER_TARGETS = Object.freeze({
  tag: ['clash', 'clashr', 'surge', 'quanx', 'loon', 'surfboard', 'stash'],
  provider: ['clash', 'clashr', 'surge', 'quanx', 'loon', 'surfboard', 'stash'],
  interval: ['clash', 'clashr', 'surge', 'quanx', 'stash'],
  proxyDirect: ['clash', 'clashr'],
});

const MODIFIER_LABELS = Object.freeze({
  tag: '来源标签',
  provider: '远程资源名称',
  interval: '单项更新间隔',
  proxyDirect: 'Provider 下载出口',
});

const MODIFIER_KEYS = Object.freeze(['tag', 'provider', 'interval', 'proxyDirect']);
const REMOTE_ONLY_MODIFIERS = new Set(['provider', 'interval', 'proxyDirect']);

export function createSourceItem(value = {}) {
  return {
    url: String(value.url || ''),
    tag: String(value.tag || ''),
    provider: String(value.provider || ''),
    interval: String(value.interval || ''),
    proxyDirect: String(value.proxyDirect || ''),
  };
}

export function splitSources(value) {
  return String(value || '')
    .split(/\r?\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSourceItem(value) {
  const item = createSourceItem({ url: String(value || '').trim() });
  let remainder = item.url;
  let parsedPrefix = false;
  while (remainder) {
    const entry = PREFIXES.find(([prefix]) => remainder.toLowerCase().startsWith(prefix));
    if (!entry) {
      break;
    }
    const comma = remainder.indexOf(',');
    if (comma < 0) {
      break;
    }
    const [prefix, key] = entry;
    item[key] = remainder.slice(prefix.length, comma).trim();
    remainder = remainder.slice(comma + 1).trim();
    parsedPrefix = true;
  }
  if (parsedPrefix && remainder) {
    item.url = remainder;
  }
  return item;
}

export function parseSourceItems(value) {
  return splitSources(value).map(parseSourceItem);
}

export function isRemoteSubscriptionSource(value) {
  const source = String(value || '').trim();
  return !source || /^https?:\/\//i.test(source);
}

export function modifierAvailable(key, target, source = '') {
  const targetSupportsModifier = SOURCE_MODIFIER_TARGETS[key]?.includes(baseTarget(target)) === true;
  return targetSupportsModifier && (!REMOTE_ONLY_MODIFIERS.has(key) || isRemoteSubscriptionSource(source));
}

export function minimumSourceInterval(target) {
  return ['surge', 'stash'].includes(baseTarget(target)) ? 1 : 0;
}

export function countSuppressedSourceModifiers(items, target) {
  return (items || []).reduce(
    (count, item) =>
      count +
      MODIFIER_KEYS.filter((key) => String(item?.[key] || '').trim() && !modifierAvailable(key, target, item?.url))
        .length,
    0,
  );
}

function validatePrefixText(value, label, index) {
  const normalized = String(value || '').trim();
  if (normalized.includes(',') || normalized.includes('|') || /[\r\n\0\x7f]/.test(normalized)) {
    throw new TypeError(`第 ${index + 1} 条来源的${label}不能包含逗号、竖线或控制字符`);
  }
}

export function validateSourceItems(items, target) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('请先输入至少一条订阅链接或节点');
  }
  const targetName = baseTarget(target);
  for (const [index, item] of items.entries()) {
    if (!item.url?.trim()) {
      throw new TypeError(`第 ${index + 1} 条来源缺少 URL 或节点`);
    }
    if (modifierAvailable('tag', targetName, item.url)) {
      validatePrefixText(item.tag, MODIFIER_LABELS.tag, index);
    }
    if (modifierAvailable('provider', targetName, item.url)) {
      validatePrefixText(item.provider, MODIFIER_LABELS.provider, index);
    }
    if (modifierAvailable('interval', targetName, item.url) && String(item.interval || '').trim()) {
      if (!/^\d+$/.test(String(item.interval))) {
        throw new TypeError(`第 ${index + 1} 条来源的更新间隔必须是非负整数`);
      }
      const interval = Number(item.interval);
      if (!Number.isSafeInteger(interval) || interval > 2147483647) {
        throw new TypeError(`第 ${index + 1} 条来源的更新间隔超出允许范围`);
      }
      if (interval < minimumSourceInterval(targetName)) {
        throw new TypeError(`第 ${index + 1} 条来源的更新间隔必须大于 0`);
      }
    }
    if (
      modifierAvailable('proxyDirect', targetName, item.url) &&
      String(item.proxyDirect || '').trim() &&
      !['true', 'false'].includes(String(item.proxyDirect))
    ) {
      throw new TypeError(`第 ${index + 1} 条来源的 Provider 出口值无效`);
    }
  }
}

export function serializeSourceItem(item, target) {
  const prefixes = [];
  if (modifierAvailable('tag', target, item.url) && item.tag?.trim()) prefixes.push(`tag:${item.tag.trim()}`);
  if (modifierAvailable('provider', target, item.url) && item.provider?.trim()) {
    prefixes.push(`provider:${item.provider.trim()}`);
  }
  if (modifierAvailable('interval', target, item.url) && String(item.interval || '').trim()) {
    prefixes.push(`interval:${String(item.interval).trim()}`);
  }
  if (modifierAvailable('proxyDirect', target, item.url) && item.proxyDirect) {
    prefixes.push(`proxy_direct:${item.proxyDirect}`);
  }
  return [...prefixes, item.url.trim()].join(',');
}

export function serializeSourceItems(items, target) {
  validateSourceItems(items, target);
  return items.map((item) => serializeSourceItem(item, target)).join('\n');
}

export function serializePlainSourceItems(items) {
  return (items || [])
    .map((item) => String(item?.url || '').trim())
    .filter(Boolean)
    .join('\n');
}
