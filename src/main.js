import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { setRuntimeConfig } from './config/runtime.js';

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.body.classList.add(prefersDarkScheme ? 'dark-style' : 'light-style');

function runtimeConfigUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function loadRuntimeConfigScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    let settled = false;
    const finish = (callback, value) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      script.remove();
      callback(value);
    };
    const timeoutId = window.setTimeout(() => {
      finish(reject, new Error(`加载 ${src} 超时`));
    }, 5000);
    script.onload = () => {
      finish(resolve);
    };
    script.onerror = () => {
      finish(reject, new Error(`无法加载 ${src}`));
    };
    document.head.appendChild(script);
  });
}

async function loadRuntimeConfig() {
  if (window.config) {
    return { rawConfig: window.config, loadError: '' };
  }

  const sources = [runtimeConfigUrl('conf/config.js?v=cf_v2'), runtimeConfigUrl('conf/config_static.js')];
  const errors = [];
  for (const source of sources) {
    try {
      await loadRuntimeConfigScript(source);
      if (window.config) {
        return { rawConfig: window.config, loadError: '' };
      }
      errors.push(`${source} 未设置 window.config`);
    } catch (error) {
      errors.push(error.message);
    }
  }

  console.warn(errors.join('; '));
  return {
    rawConfig: undefined,
    loadError: '运行时配置加载失败，已进入安全手动模式；请手动填写后端 API。',
  };
}

const { rawConfig, loadError } = await loadRuntimeConfig();
const runtimeState = setRuntimeConfig(rawConfig, { safeFallback: !rawConfig });
if (loadError) {
  runtimeState.issues.splice(0, runtimeState.issues.length, loadError);
}

document.title = `${runtimeState.config.siteName} - 在线订阅转换`;
document.documentElement.lang = 'zh-CN';

createApp(App).use(router).mount('#app');
