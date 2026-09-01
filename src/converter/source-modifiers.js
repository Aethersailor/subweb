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

export function splitSources(value) {
  return String(value || '')
    .split(/\r?\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSourceItem(value) {
  const item = { url: String(value || '').trim(), tag: '', provider: '', interval: '', proxyDirect: '' };
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

export function modifierAvailable(key, target, capabilities) {
  const remoteName = key === 'proxyDirect' ? 'proxy_direct' : key;
  const remote = capabilities?.source_modifiers?.find((item) => item.name === remoteName);
  const targets = remote?.targets || SOURCE_MODIFIER_TARGETS[key];
  return targets?.includes(baseTarget(target)) === true;
}

export function validateSourceItems(items, target, capabilities) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('请先输入至少一条订阅链接或节点');
  }
  const targetName = baseTarget(target);
  for (const [index, item] of items.entries()) {
    if (!item.url?.trim()) {
      throw new TypeError(`第 ${index + 1} 条来源缺少 URL 或节点`);
    }
    for (const key of ['tag', 'provider', 'interval', 'proxyDirect']) {
      if (String(item[key] || '').trim() && !modifierAvailable(key, targetName, capabilities)) {
        throw new TypeError(`第 ${index + 1} 条来源的${MODIFIER_LABELS[key]}不适用于当前目标客户端`);
      }
    }
    if (String(item.interval || '').trim()) {
      if (!/^\d+$/.test(String(item.interval))) {
        throw new TypeError(`第 ${index + 1} 条来源的更新间隔必须是非负整数`);
      }
      const interval = Number(item.interval);
      if (!Number.isSafeInteger(interval) || interval > 2147483647) {
        throw new TypeError(`第 ${index + 1} 条来源的更新间隔超出允许范围`);
      }
      if ((targetName === 'surge' || targetName === 'stash') && interval === 0) {
        throw new TypeError(`第 ${index + 1} 条来源的更新间隔必须大于 0`);
      }
    }
    if (String(item.proxyDirect || '').trim() && !['true', 'false'].includes(String(item.proxyDirect))) {
      throw new TypeError(`第 ${index + 1} 条来源的 Provider 出口值无效`);
    }
  }
}

export function serializeSourceItem(item) {
  const prefixes = [];
  if (item.tag?.trim()) prefixes.push(`tag:${item.tag.trim()}`);
  if (item.provider?.trim()) prefixes.push(`provider:${item.provider.trim()}`);
  if (String(item.interval || '').trim()) prefixes.push(`interval:${String(item.interval).trim()}`);
  if (item.proxyDirect) prefixes.push(`proxy_direct:${item.proxyDirect}`);
  return [...prefixes, item.url.trim()].join(',');
}

export function serializeSourceItems(items, target, capabilities) {
  validateSourceItems(items, target, capabilities);
  return items.map(serializeSourceItem).join('\n');
}
