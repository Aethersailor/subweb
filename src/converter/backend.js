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
