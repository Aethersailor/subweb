import { normalizeRuntimeConfig } from '../../shared/runtime-config.js';

let state = normalizeRuntimeConfig(undefined, { safeFallback: true });

export function setRuntimeConfig(rawConfig, options) {
  state = normalizeRuntimeConfig(rawConfig, options);
  return state;
}

export function getRuntimeConfig() {
  return state.config;
}

export function getRuntimeConfigIssues() {
  return state.issues;
}
