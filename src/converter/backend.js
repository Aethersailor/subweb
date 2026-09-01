import { normalizeApiBaseUrl } from '../views/home/index.js';

export const BACKEND_TYPES = Object.freeze({
  AUTO: 'auto',
  SCE: 'sce',
  LEGACY: 'legacy',
  UNKNOWN: 'unknown',
});

export function normalizeBackendType(value) {
  return value === BACKEND_TYPES.SCE || value === BACKEND_TYPES.LEGACY ? value : BACKEND_TYPES.AUTO;
}

export function parseBackendIdentity(value) {
  const raw = String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 240);
  const sceMatch = raw.match(/^SubConverter-Extended\s+([^\s]+)\s+backend$/i);
  if (sceMatch) {
    const token = sceMatch[1];
    const stable = token.match(/^(v\d+\.\d+\.\d+)(?:-([0-9a-f]{7,40}))?$/i);
    const development = token.match(/^dev(?:-([0-9a-f]{7,40}))?$/i);
    return {
      family: BACKEND_TYPES.SCE,
      version: stable?.[1] || (development ? 'dev' : token),
      channel: stable ? 'stable' : development ? 'dev' : 'unknown',
      revision: stable?.[2] || development?.[1] || '',
      raw,
    };
  }

  if (raw) {
    const legacyMatch = raw.match(/^subconverter\s+([^\s]+).*\sbackend$/i);
    return {
      family: BACKEND_TYPES.LEGACY,
      version: legacyMatch?.[1] || '',
      channel: 'unknown',
      revision: '',
      raw,
    };
  }

  return {
    family: BACKEND_TYPES.UNKNOWN,
    version: '',
    channel: 'unknown',
    revision: '',
    raw: '',
  };
}

function stringArray(value) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item)) {
    return null;
  }
  return [...value];
}

export function validateSceCapabilities(value) {
  if (!value || typeof value !== 'object' || value.schema_version !== 1) {
    throw new TypeError('SCE 能力接口版本不受支持');
  }
  if (value.backend?.family !== 'SubConverter-Extended') {
    throw new TypeError('SCE 能力接口返回了不匹配的后端标识');
  }
  if (!Array.isArray(value.targets) || value.targets.length === 0) {
    throw new TypeError('SCE 能力接口未返回目标客户端');
  }

  const targets = value.targets.map((item) => {
    if (!item || typeof item.name !== 'string' || !/^[a-z0-9]+$/.test(item.name)) {
      throw new TypeError('SCE 能力接口包含无效目标客户端');
    }
    return {
      name: item.name,
      parser: typeof item.parser === 'string' ? item.parser : '',
      remote_mode: typeof item.remote_mode === 'string' ? item.remote_mode : '',
      simple_subscription: item.simple_subscription === true,
    };
  });
  if (new Set(targets.map((item) => item.name)).size !== targets.length) {
    throw new TypeError('SCE 能力接口包含重复目标客户端');
  }

  const parameters = value.query_parameters || {};
  const recognized = stringArray(parameters.recognized);
  const ignored = stringArray(parameters.ignored);
  const internal = stringArray(parameters.internal);
  if (!recognized || !ignored || !internal) {
    throw new TypeError('SCE 能力接口参数定义无效');
  }

  const targetConstraints = {};
  for (const [name, targetNames] of Object.entries(parameters.target_constraints || {})) {
    const normalized = stringArray(targetNames);
    if (!/^[a-z0-9_]+$/.test(name) || !normalized) {
      throw new TypeError('SCE 能力接口目标约束无效');
    }
    targetConstraints[name] = normalized;
  }

  const sourceModifiers = Array.isArray(value.source_modifiers)
    ? value.source_modifiers.map((item) => {
        const modifierTargets = stringArray(item?.targets);
        if (!item || typeof item.name !== 'string' || !modifierTargets) {
          throw new TypeError('SCE 能力接口来源参数无效');
        }
        return {
          name: item.name,
          type: typeof item.type === 'string' ? item.type : 'string',
          targets: modifierTargets,
        };
      })
    : [];

  return {
    schema_version: 1,
    backend: {
      family: 'SubConverter-Extended',
      version: String(value.backend.version || ''),
      revision: String(value.backend.revision || ''),
    },
    targets,
    query_parameters: {
      recognized,
      ignored,
      internal,
      forced: parameters.forced?.new_name === true ? { new_name: true } : {},
      target_constraints: targetConstraints,
    },
    source_modifiers: sourceModifiers,
  };
}

export function assertCapabilitiesMatchIdentity(capabilities, identity) {
  if (identity?.family !== BACKEND_TYPES.SCE) {
    throw new TypeError('能力接口无法绑定到非 SCE 后端');
  }
  if (identity.version && capabilities.backend.version && identity.version !== capabilities.backend.version) {
    throw new TypeError('SCE 能力接口版本与 /version 不一致');
  }
  if (identity.revision && capabilities.backend.revision) {
    const left = identity.revision.toLowerCase();
    const right = capabilities.backend.revision.toLowerCase();
    if (!left.startsWith(right) && !right.startsWith(left)) {
      throw new TypeError('SCE 能力接口修订与 /version 不一致');
    }
  }
  return capabilities;
}

export function resolveBackendType(configuredType, detectedFamily, reachable) {
  const configured = normalizeBackendType(configuredType);
  if (!reachable) {
    return configured === BACKEND_TYPES.AUTO ? BACKEND_TYPES.UNKNOWN : configured;
  }
  if (configured !== BACKEND_TYPES.AUTO && configured !== detectedFamily) {
    return BACKEND_TYPES.UNKNOWN;
  }
  return detectedFamily;
}

export function capabilitiesUrl(api) {
  return `${normalizeApiBaseUrl(api)}/capabilities`;
}
