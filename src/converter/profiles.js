import { BACKEND_TYPES } from './backend.js';

export const TEXT_PARAMETERS = [
  'include',
  'exclude',
  'group',
  'filename',
  'interval',
  'dev_id',
  'rename',
  'provider_headers',
];
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

export const DEFAULT_MORE_CONFIG = Object.freeze(
  Object.fromEntries([...TEXT_PARAMETERS, ...BASE64_PARAMETERS, ...BOOLEAN_PARAMETERS].map((name) => [name, ''])),
);

export const BOOLEAN_PARAMETER_OPTIONS = Object.freeze([
  { key: 'emoji', label: 'Emoji', hint: '同时控制添加 Emoji 和移除旧 Emoji' },
  { key: 'add_emoji', label: '添加 Emoji', hint: '单独控制添加 Emoji' },
  { key: 'remove_emoji', label: '移除旧 Emoji', hint: '单独控制移除已有 Emoji' },
  { key: 'append_type', label: '追加节点类型', hint: '在节点名后追加协议类型' },
  { key: 'tfo', label: 'TCP Fast Open', hint: '启用 TCP Fast Open' },
  { key: 'udp', label: 'UDP', hint: '启用 UDP 转发' },
  {
    key: 'list',
    label: '服务端展开节点',
    hint: 'SubConverter-Extended 默认使用远程资源；开启后由后端解析并展开节点',
  },
  { key: 'sort', label: '排序节点', hint: '按后端规则排序节点' },
  { key: 'sort_script', label: '使用排序脚本', hint: '排序开启时使用后端配置的排序脚本' },
  { key: 'script', label: 'Clash Script', hint: '生成 Clash Script 配置' },
  { key: 'insert', label: '插入预设节点', hint: '插入后端预先配置的节点' },
  { key: 'scv', label: '跳过证书验证', hint: '为支持的节点跳过 TLS 证书验证' },
  { key: 'fdn', label: '过滤废弃节点', hint: '过滤后端识别的废弃节点' },
  { key: 'expand', label: '内联展开规则集', hint: '将规则集内联到生成配置' },
  { key: 'append_info', label: '追加订阅信息', hint: '在响应中追加订阅流量信息' },
  { key: 'prepend', label: '前置插入节点', hint: '将后端预设节点插入到最前面' },
  { key: 'classic', label: 'Classical 规则', hint: '使用 Classical rule-provider 格式' },
  { key: 'tls13', label: 'TLS 1.3', hint: '为支持的节点启用 TLS 1.3' },
  {
    key: 'provider_proxy_direct',
    label: 'Provider 直连',
    hint: '仅控制 Clash/ClashR proxy-provider 的下载出口',
  },
  { key: 'new_name', label: 'Mihomo 新字段', hint: '使用 proxies、proxy-groups 等新字段名' },
  { key: 'strict', label: '严格更新', hint: '启用托管配置严格更新模式' },
]);

export const LEGACY_TARGET_OPTIONS = Object.freeze([
  { value: 'clash', text: 'Clash' },
  { value: 'clashr', text: 'ClashR' },
  { value: 'v2ray', text: 'V2Ray' },
  { value: 'quan', text: 'Quantumult' },
  { value: 'quanx', text: 'Quantumult X' },
  { value: 'surge&ver=2', text: 'Surge V2' },
  { value: 'surge&ver=3', text: 'Surge V3' },
  { value: 'surge&ver=4', text: 'Surge V4' },
  { value: 'surfboard', text: 'Surfboard' },
  { value: 'ss', text: 'SS (SIP002)' },
  { value: 'sssub', text: 'SS Android' },
  { value: 'ssd', text: 'SSD' },
  { value: 'ssr', text: 'SSR' },
  { value: 'loon', text: 'Loon' },
  { value: 'singbox', text: 'Sing-box' },
]);

const SUBCONVERTER_EXTENDED_TARGET_NAMES = Object.freeze([
  'auto',
  'clash',
  'clashr',
  'surge',
  'quan',
  'quanx',
  'loon',
  'surfboard',
  'stash',
  'mellow',
  'singbox',
  'ss',
  'ssd',
  'ssr',
  'sssub',
  'v2ray',
  'v2rayn',
  'v2rayng',
  'shadowrocket',
  'trojan',
  'vless',
  'hysteria2',
  'mixed',
]);

const TARGET_LABELS = Object.freeze({
  auto: '自动识别客户端',
  clash: 'Clash / Mihomo',
  clashr: 'ClashR',
  quan: 'Quantumult',
  quanx: 'Quantumult X',
  loon: 'Loon',
  surfboard: 'Surfboard',
  stash: 'Stash',
  mellow: 'Mellow',
  singbox: 'Sing-box',
  ss: 'SS (SIP002)',
  ssd: 'SSD',
  ssr: 'SSR',
  sssub: 'SS Android',
  v2ray: 'Legacy VMess 订阅',
  v2rayn: 'v2rayN',
  v2rayng: 'v2rayNG',
  shadowrocket: 'Shadowrocket',
  trojan: 'Trojan',
  vless: 'VLESS',
  hysteria2: 'Hysteria2',
  mixed: '标准混合订阅',
});

function expandTarget(name) {
  if (name === 'surge') {
    return [
      { value: 'surge&ver=2', text: 'Surge V2' },
      { value: 'surge&ver=3', text: 'Surge V3' },
      { value: 'surge&ver=4', text: 'Surge V4' },
    ];
  }
  return [{ value: name, text: TARGET_LABELS[name] || name }];
}

export function getTargetOptions(backendType) {
  if (backendType !== BACKEND_TYPES.SUBCONVERTER_EXTENDED) {
    return LEGACY_TARGET_OPTIONS;
  }
  return SUBCONVERTER_EXTENDED_TARGET_NAMES.flatMap(expandTarget);
}

export function baseTarget(target) {
  return String(target || '').split('&', 1)[0];
}

const SUBCONVERTER_EXTENDED_UNSUPPORTED = new Set(['groups', 'ruleset', 'new_name']);
const SUBCONVERTER_EXTENDED_TARGET_CONSTRAINTS = Object.freeze({
  dev_id: ['quanx'],
  provider_headers: ['clash', 'stash'],
  provider_proxy_direct: ['clash', 'clashr'],
  script: ['clash', 'clashr'],
  classic: ['clash', 'clashr'],
});

export function isParameterAvailable(name, backendType, target) {
  if (backendType !== BACKEND_TYPES.SUBCONVERTER_EXTENDED) {
    return name !== 'provider_headers';
  }
  if (SUBCONVERTER_EXTENDED_UNSUPPORTED.has(name)) {
    return false;
  }
  const targetName = baseTarget(target);
  const constraints = SUBCONVERTER_EXTENDED_TARGET_CONSTRAINTS[name];
  return !constraints || constraints.includes(targetName);
}

export function availableBooleanParameters(backendType, target) {
  return BOOLEAN_PARAMETER_OPTIONS.filter((item) => isParameterAvailable(item.key, backendType, target));
}

export function availableParameterNames(backendType, target) {
  return [...TEXT_PARAMETERS, ...BASE64_PARAMETERS, ...BOOLEAN_PARAMETERS].filter((name) =>
    isParameterAvailable(name, backendType, target),
  );
}

export function countActiveOptions(moreConfig, backendType, target) {
  return availableParameterNames(backendType, target).filter((name) => {
    const value = moreConfig?.[name];
    return typeof value === 'string' ? value.trim() !== '' : value !== undefined && value !== null;
  }).length;
}

export function filterMoreConfig(moreConfig, backendType, target) {
  const allowed = new Set(availableParameterNames(backendType, target));
  return Object.fromEntries(Object.entries(moreConfig || {}).filter(([name]) => allowed.has(name)));
}

export function countSuppressedOptions(moreConfig, backendType, target) {
  const allowed = new Set(availableParameterNames(backendType, target));
  return Object.entries(moreConfig || {}).filter(([name, value]) => {
    const active = typeof value === 'string' ? value.trim() !== '' : value !== undefined && value !== null;
    return active && !allowed.has(name);
  }).length;
}
