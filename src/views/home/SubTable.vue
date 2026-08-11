<template>
  <form class="converter-form" novalidate @submit.prevent="getSubUrl">
    <div class="section-heading">
      <div>
        <span class="section-kicker">Subscription converter</span>
        <h2>生成订阅链接</h2>
      </div>
      <span class="section-badge">{{ targetLabel }}</span>
    </div>

    <div v-if="formMessage.text" class="form-message" :class="`is-${formMessage.type}`" role="alert">
      {{ formMessage.text }}
    </div>

    <div class="field field-wide">
      <label for="subscription-urls">订阅链接或节点</label>
      <textarea
        id="subscription-urls"
        ref="urlsInput"
        v-model.trim="urls"
        :aria-invalid="formMessage.field === 'urls'"
        :placeholder="placeholder"
        rows="4"
        spellcheck="false"
      ></textarea>
      <span class="field-hint">每行一条，也支持使用 | 分隔多个链接或节点。</span>
    </div>

    <div class="field-grid">
      <div class="field">
        <label for="client">目标客户端</label>
        <div class="select-wrap">
          <select id="client" v-model="target">
            <option v-for="option in targetOptions" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="api">后端服务</label>
        <div class="select-wrap">
          <select id="api" v-model="backendSelection" @change="selectApi">
            <option v-for="option in backendOptions" :key="`${option.name}-${option.url}`" :value="option.url">
              {{ option.name }}
            </option>
            <option value="manual">自定义后端 API 地址</option>
          </select>
        </div>
      </div>
      <div v-if="api" class="backend-status" :class="`is-${backendProbe.state}`" role="status" aria-live="polite">
        <span class="backend-status-dot" aria-hidden="true"></span>
        <span>{{ backendProbeText }}</span>
      </div>
    </div>

    <div v-if="isShowManualApiUrl" class="field field-wide reveal-block">
      <label for="manual-api">自定义后端 API</label>
      <input
        id="manual-api"
        ref="apiInput"
        v-model.trim="api"
        type="url"
        inputmode="url"
        :aria-invalid="formMessage.field === 'api'"
        placeholder="https://sub.example.com"
        @blur="probeBackend(api)"
      />
      <span class="field-hint">点击页面其他位置时会检测后端；转换数据会发送到该地址。</span>
    </div>

    <div class="remote-row">
      <div class="field">
        <label for="remote">远程配置</label>
        <div class="select-wrap">
          <select id="remote" v-model="remoteSelection" @change="selectRemoteConfig">
            <option v-for="option in remoteConfigOptions" :key="`${option.text}-${option.value}`" :value="option.value">
              {{ option.text }}
            </option>
            <option value="">不使用远程配置</option>
            <option value="manual">自定义远程配置地址</option>
          </select>
        </div>
      </div>
      <button
        class="secondary-button parameter-button"
        type="button"
        :aria-expanded="isShowMoreConfig"
        @click="showMoreConfig"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4" />
        </svg>
        {{ isShowMoreConfig ? '收起参数' : '可选参数'
        }}<span v-if="activeOptionCount">（{{ activeOptionCount }}）</span>
      </button>
    </div>

    <div v-if="isShowRemoteConfig" class="field field-wide reveal-block">
      <label for="manual-remote">自定义远程配置</label>
      <input
        id="manual-remote"
        ref="remoteInput"
        v-model.trim="remoteConfig"
        type="url"
        inputmode="url"
        :aria-invalid="formMessage.field === 'remote'"
        placeholder="https://example.com/config.ini"
      />
    </div>

    <section v-if="isShowMoreConfig" class="options-panel reveal-block" aria-label="可选参数">
      <div class="options-section">
        <div class="options-heading">
          <h3>文本参数</h3>
          <div class="options-heading-actions">
            <span>留空即使用后端默认值；收起后仍会生效</span>
            <button v-if="activeOptionCount" type="button" class="text-button" @click="resetMoreConfig">
              清空参数
            </button>
          </div>
        </div>
        <div class="options-inputs">
          <div class="field">
            <label for="include">Include</label>
            <input id="include" v-model="moreConfig.include" placeholder="仅保留匹配节点" />
          </div>
          <div class="field">
            <label for="exclude">Exclude</label>
            <input id="exclude" v-model="moreConfig.exclude" placeholder="排除匹配节点" />
          </div>
          <div class="field">
            <label for="group">节点分组名</label>
            <input id="group" v-model="moreConfig.group" placeholder="覆盖直接节点的分组名" />
          </div>
          <div class="field">
            <label for="filename">下载文件名</label>
            <input id="filename" v-model="moreConfig.filename" placeholder="例如 profile.yaml" />
          </div>
          <div class="field">
            <label for="interval">更新间隔</label>
            <input id="interval" v-model="moreConfig.interval" type="number" min="0" placeholder="秒" />
          </div>
          <div class="field">
            <label for="dev-id">Quantumult X 设备 ID</label>
            <input id="dev-id" v-model="moreConfig.dev_id" placeholder="dev_id" />
          </div>
        </div>
      </div>

      <div class="options-section">
        <div class="options-heading">
          <h3>自定义规则与分组</h3>
          <span>自动编码为 URL-safe Base64；远程配置加载成功时后端会忽略此处内容</span>
        </div>
        <div class="advanced-inputs">
          <div class="field">
            <label for="rename">节点重命名规则</label>
            <textarea
              id="rename"
              v-model="moreConfig.rename"
              rows="2"
              placeholder="正则@替换，多个规则使用 ` 分隔"
            ></textarea>
          </div>
          <div class="field">
            <label for="groups">自定义代理组</label>
            <textarea
              id="groups"
              v-model="moreConfig.groups"
              rows="2"
              placeholder="custom_proxy_group=...，多个项目使用 @ 分隔"
            ></textarea>
          </div>
          <div class="field">
            <label for="ruleset">自定义规则集</label>
            <textarea
              id="ruleset"
              v-model="moreConfig.ruleset"
              rows="2"
              placeholder="ruleset=...，多个项目使用 @ 分隔"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="options-section">
        <div class="options-heading">
          <h3>行为开关</h3>
          <span>三态设置可显式开启、关闭或跟随后端</span>
        </div>
        <div class="toggle-grid">
          <div
            v-for="option in booleanParameters"
            :key="option.key"
            class="toggle-field"
            :class="{ 'is-disabled': isEmojiDetailDisabled(option.key) }"
          >
            <label :for="`option-${option.key}`" :title="option.hint">{{ option.label }}</label>
            <div class="select-wrap compact-select">
              <select
                :id="`option-${option.key}`"
                v-model="moreConfig[option.key]"
                :disabled="isEmojiDetailDisabled(option.key)"
              >
                <option value="">后端默认</option>
                <option value="true">开启</option>
                <option value="false">关闭</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="section-divider">
      <span></span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
      </svg>
      <span></span>
    </div>

    <div class="result-group">
      <div class="result-copy">
        <label for="result-url">转换结果</label>
        <input id="result-url" v-model.trim="result.subUrl" readonly placeholder="点击转换后自动生成并复制" />
      </div>
      <button class="primary-button" type="submit">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        转换并复制
      </button>
    </div>

    <div v-if="isShortUrlEnabled" class="result-group short-result">
      <div class="result-copy">
        <label for="short-url">短链接</label>
        <input id="short-url" v-model.trim="result.shortUrl" readonly placeholder="生成便于分享的短链接" />
      </div>
      <button class="secondary-button short-url-btn" type="button" :disabled="isShortUrlLoading" @click="getShortUrl">
        <span v-if="isShortUrlLoading" class="spinner" aria-hidden="true"></span>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"
          />
        </svg>
        {{ isShortUrlLoading ? '生成中' : '生成短链' }}
      </button>
    </div>
  </form>
</template>

<script>
import {
  countActiveOptions,
  getSubLink,
  normalizeApiBaseUrl,
  normalizeRemoteConfigUrl,
  toStandardBase64,
} from './index.js';
import showNotification from '@/components/notification';
import { getRuntimeConfig } from '@/config/runtime.js';

export default {
  name: 'SubTable',
  setup() {
    const DEFAULT_MORECONFIG = {
      include: '',
      exclude: '',
      group: '',
      filename: '',
      interval: '',
      dev_id: '',
      rename: '',
      groups: '',
      ruleset: '',
      emoji: '',
      add_emoji: '',
      remove_emoji: '',
      append_type: '',
      tfo: '',
      udp: '',
      list: '',
      sort: '',
      sort_script: '',
      script: '',
      insert: '',
      scv: '',
      fdn: '',
      expand: '',
      append_info: '',
      prepend: '',
      classic: '',
      tls13: '',
      provider_proxy_direct: '',
      new_name: '',
      strict: '',
    };
    const booleanParameters = [
      { key: 'emoji', label: 'Emoji', hint: '同时控制添加 Emoji 和移除旧 Emoji' },
      { key: 'add_emoji', label: '添加 Emoji', hint: '单独控制添加 Emoji' },
      { key: 'remove_emoji', label: '移除旧 Emoji', hint: '单独控制移除已有 Emoji' },
      { key: 'append_type', label: '追加节点类型', hint: '在节点名后追加协议类型' },
      { key: 'tfo', label: 'TCP Fast Open', hint: '启用 TCP Fast Open' },
      { key: 'udp', label: 'UDP', hint: '启用 UDP 转发' },
      { key: 'list', label: 'Node List', hint: '生成节点列表；Extended 会强制使用 Provider 模式' },
      { key: 'sort', label: '排序节点', hint: '按后端规则排序节点' },
      { key: 'sort_script', label: '使用排序脚本', hint: '使用后端配置的排序脚本' },
      { key: 'script', label: 'Clash Script', hint: '生成 Clash Script 配置' },
      { key: 'insert', label: '插入预设节点', hint: '插入后端预先配置的节点' },
      { key: 'scv', label: '跳过证书验证', hint: '为支持的节点跳过 TLS 证书验证' },
      { key: 'fdn', label: '过滤废弃节点', hint: '过滤后端识别的废弃节点' },
      { key: 'expand', label: '使用规则集', hint: '将规则集内联展开到生成配置' },
      { key: 'append_info', label: '追加订阅信息', hint: '在响应中追加订阅流量信息' },
      { key: 'prepend', label: '前置插入节点', hint: '将后端预设节点插入到最前面' },
      { key: 'classic', label: 'Classical 规则', hint: '使用 Classical rule-provider 格式' },
      { key: 'tls13', label: 'TLS 1.3', hint: '为支持的节点启用 TLS 1.3' },
      { key: 'provider_proxy_direct', label: 'Provider 直连', hint: '规则 Provider 使用直连策略' },
      { key: 'new_name', label: 'Mihomo 新字段', hint: '使用 proxies、proxy-groups 等新字段名' },
      { key: 'strict', label: '严格更新', hint: '启用托管配置严格更新模式' },
    ];
    return {
      booleanParameters,
      DEFAULT_MORECONFIG,
    };
  },
  data() {
    const runtimeConfig = getRuntimeConfig();
    return {
      placeholder: 'https://example.com/subscription\nvmess://...\nss://...',
      targetOptions: [
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
      ],
      runtimeConfig,
      backendOptions: [],
      backendSelection: 'manual',
      api: '',
      shortUrl: runtimeConfig.shortUrl,
      remoteConfigOptions: runtimeConfig.remoteConfigOptions,
      remoteSelection: runtimeConfig.remoteConfigOptions[0]?.value || '',
      moreConfig: { ...this.DEFAULT_MORECONFIG },
      isShowMoreConfig: false,
      isShowManualApiUrl: false,
      isShowRemoteConfig: false,
      result: {
        subUrl: '',
        shortUrl: '',
      },
      urls: '',
      target: 'clash',
      remoteConfig: runtimeConfig.remoteConfigOptions[0]?.value || '',
      isShortUrlLoading: false,
      formMessage: {
        type: 'error',
        text: '',
        field: '',
      },
      backendProbe: {
        state: 'idle',
        version: '',
      },
      backendProbeController: null,
      backendProbeRequestId: 0,
    };
  },
  computed: {
    isShortUrlEnabled() {
      return this.runtimeConfig.enableShortUrl;
    },
    activeOptionCount() {
      return countActiveOptions(this.moreConfig);
    },
    targetLabel() {
      return this.targetOptions.find((option) => option.value === this.target)?.text || this.target;
    },
    backendProbeText() {
      if (this.backendProbe.state === 'checking') {
        return '正在探测后端';
      }
      if (this.backendProbe.state === 'online') {
        return `在线 · ${this.backendProbe.version}`;
      }
      if (this.backendProbe.state === 'unreachable') {
        return '浏览器无法确认可用性（可能是离线、超时或 CORS 限制）';
      }
      return '尚未检测后端';
    },
  },
  created() {
    this.initBackendOptions();
    if (this.api) {
      this.probeBackend(this.api);
    }
  },
  beforeUnmount() {
    this.backendProbeRequestId += 1;
    this.cancelBackendProbe();
  },
  watch: {
    'moreConfig.emoji'(value) {
      if (value) {
        this.moreConfig.add_emoji = '';
        this.moreConfig.remove_emoji = '';
      }
    },
  },
  methods: {
    initBackendOptions() {
      this.backendOptions = this.runtimeConfig.apiBackends;
      if (this.backendOptions.length > 0) {
        this.backendSelection = this.backendOptions[0].url;
        this.api = this.backendSelection;
      } else {
        this.backendSelection = 'manual';
        this.isShowManualApiUrl = true;
      }
    },
    showMoreConfig() {
      this.isShowMoreConfig = !this.isShowMoreConfig;
    },
    resetMoreConfig() {
      this.moreConfig = { ...this.DEFAULT_MORECONFIG };
    },
    isEmojiDetailDisabled(key) {
      return (key === 'add_emoji' || key === 'remove_emoji') && this.moreConfig.emoji !== '';
    },
    cancelBackendProbe() {
      if (this.backendProbeController) {
        this.backendProbeController.abort();
        this.backendProbeController = null;
      }
    },
    resetBackendProbe() {
      this.cancelBackendProbe();
      this.backendProbeRequestId += 1;
      this.backendProbe = {
        state: 'idle',
        version: '',
      };
    },
    async probeBackend(api) {
      this.cancelBackendProbe();
      let normalizedApi;
      try {
        normalizedApi = normalizeApiBaseUrl(api);
      } catch {
        this.resetBackendProbe();
        return;
      }
      const requestId = this.backendProbeRequestId + 1;
      const controller = new AbortController();
      this.backendProbeRequestId = requestId;
      this.backendProbeController = controller;
      this.backendProbe = {
        state: 'checking',
        version: '',
      };
      const timeoutId = window.setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${normalizedApi}/version`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Backend returned HTTP ${response.status}`);
        }

        const body = (await response.text()).trim().replace(/\s+/g, ' ').slice(0, 120);
        if (!body) {
          throw new Error('Backend returned an empty version response');
        }
        if (requestId !== this.backendProbeRequestId) {
          return;
        }
        this.backendProbe = {
          state: 'online',
          version: body,
        };
      } catch {
        if (requestId !== this.backendProbeRequestId) {
          return;
        }
        this.backendProbe = {
          state: 'unreachable',
          version: '',
        };
      } finally {
        window.clearTimeout(timeoutId);
        if (this.backendProbeController === controller) {
          this.backendProbeController = null;
        }
      }
    },
    selectApi(event) {
      if (event.target.value === 'manual') {
        this.api = '';
        this.isShowManualApiUrl = true;
        this.resetBackendProbe();
      } else {
        this.isShowManualApiUrl = false;
        this.api = event.target.value;
        this.probeBackend(this.api);
      }
    },
    selectRemoteConfig(event) {
      if (event.target.value === 'manual') {
        this.remoteConfig = '';
        this.isShowRemoteConfig = true;
      } else {
        this.isShowRemoteConfig = false;
        this.remoteConfig = event.target.value;
      }
    },
    async toCopy(url, title) {
      if (!url) {
        this.setFormMessage('复制失败，内容为空');
        return;
      }

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const copyInput = document.createElement('textarea');
          copyInput.value = url;
          copyInput.setAttribute('readonly', '');
          copyInput.className = 'clipboard-helper';
          document.body.appendChild(copyInput);
          copyInput.select();
          const copied = document.execCommand('copy');
          copyInput.remove();
          if (!copied) {
            throw new Error('Copy command was rejected');
          }
        }
        showNotification(`${title}复制成功`, '成功');
      } catch {
        this.setFormMessage('复制失败，请手动复制生成的链接');
      }
    },
    setFormMessage(text, field = '', type = 'error') {
      this.formMessage = { text, field, type };
      if (field) {
        this.$nextTick(() => this.$refs[`${field}Input`]?.focus());
      }
    },
    clearFormMessage() {
      this.formMessage = { text: '', field: '', type: 'error' };
    },
    getConverter() {
      this.clearFormMessage();
      this.result = { subUrl: '', shortUrl: '' };
      if (!this.urls.trim()) {
        this.setFormMessage('请输入订阅链接或节点。', 'urls');
        return false;
      }
      try {
        this.api = normalizeApiBaseUrl(this.api);
      } catch (error) {
        this.setFormMessage(error.message, 'api');
        return false;
      }
      if (!this.remoteConfig && this.isShowRemoteConfig) {
        this.setFormMessage('请输入远程配置地址，或选择“不使用远程配置”。', 'remote');
        return false;
      }
      try {
        this.remoteConfig = normalizeRemoteConfigUrl(this.remoteConfig);
      } catch (error) {
        this.setFormMessage(error.message, 'remote');
        return false;
      }
      try {
        this.result.subUrl = getSubLink({
          urls: this.urls,
          api: this.api,
          target: this.target,
          remoteConfig: this.remoteConfig,
          moreConfig: this.moreConfig,
        });
      } catch (error) {
        this.setFormMessage(error.message, 'urls');
        return false;
      }
      return true;
    },
    getSubUrl() {
      if (this.getConverter()) {
        this.toCopy(this.result.subUrl, '订阅链接');
      }
    },
    async getShortUrl() {
      if (!this.getConverter()) {
        return;
      }
      this.isShortUrlLoading = true;
      const data = new FormData();
      data.append('longUrl', toStandardBase64(this.result.subUrl));
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${this.shortUrl}/short`, {
          method: 'POST',
          body: data,
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (payload.Code !== 1 || typeof payload.ShortUrl !== 'string' || !payload.ShortUrl) {
          throw new Error('短链接服务未返回有效链接');
        }
        this.result.shortUrl = normalizeRemoteConfigUrl(payload.ShortUrl);
        await this.toCopy(this.result.shortUrl, '短链接');
      } catch (error) {
        const reason = error.name === 'AbortError' ? '请求超时' : error.message;
        this.setFormMessage(`短链接生成失败：${reason}`);
      } finally {
        window.clearTimeout(timeoutId);
        this.isShortUrlLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.converter-form {
  display: grid;
  gap: 20px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 4px;
}

.section-kicker {
  display: block;
  margin-bottom: 7px;
  color: var(--accent-blue);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.45rem, 3vw, 1.85rem);
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.section-badge {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  padding: 7px 12px;
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent-blue) 22%, transparent);
  border-radius: 999px;
}

.field-grid,
.options-inputs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field-grid {
  align-items: start;
}

.field {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 8px;
}

.field label,
.result-copy label {
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
}

.field-hint {
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.form-message {
  padding: 12px 14px;
  color: var(--danger);
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.5;
  background: color-mix(in srgb, var(--danger) 10%, var(--surface-soft));
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  border-radius: 14px;
}

.form-message.is-success {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 10%, var(--surface-soft));
  border-color: color-mix(in srgb, var(--success) 30%, transparent);
}

.backend-status {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  grid-column: 2;
  align-items: center;
  gap: 7px;
  margin-top: -8px;
  color: var(--text-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.backend-status span:last-child {
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.backend-status-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  background: currentColor;
  border-radius: 50%;
}

.backend-status.is-checking {
  color: var(--accent-blue);
}

.backend-status.is-checking .backend-status-dot {
  animation: status-pulse 1s ease-in-out infinite;
}

.backend-status.is-online {
  color: var(--success);
}

.backend-status.is-unreachable {
  color: var(--warning);
}

input,
select,
textarea {
  display: block;
  width: 100%;
  min-width: 0;
  color: var(--text-primary);
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 16px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

input,
select {
  min-height: 50px;
  padding: 0 15px;
}

textarea {
  min-height: 126px;
  padding: 14px 15px;
  line-height: 1.55;
  resize: vertical;
}

input:hover,
select:hover,
textarea:hover {
  background: var(--control-hover);
}

input:focus,
select:focus,
textarea:focus {
  background: var(--control-hover);
  border-color: color-mix(in srgb, var(--accent-blue) 58%, transparent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

input::placeholder,
textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.72;
}

.select-wrap {
  position: relative;
}

.select-wrap::after {
  position: absolute;
  top: 50%;
  right: 16px;
  width: 8px;
  height: 8px;
  pointer-events: none;
  border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted);
  content: '';
  transform: translateY(-70%) rotate(45deg);
}

select {
  padding-right: 42px;
  cursor: pointer;
  appearance: none;
}

.remote-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 12px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 18px;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 999px;
  box-shadow: var(--control-shadow);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;
}

.primary-button {
  color: #f8fafc;
  background: var(--accent-gradient);
  border-color: transparent;
}

.primary-button:hover,
.secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.secondary-button:hover:not(:disabled) {
  background: var(--control-hover);
}

.primary-button svg,
.secondary-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.parameter-button {
  min-width: 132px;
}

.options-panel {
  display: grid;
  gap: 22px;
  padding: 18px;
  background: var(--surface-soft);
  border: 1px solid var(--inner-border);
  border-radius: 22px;
}

.options-section {
  display: grid;
  gap: 14px;
}

.options-section + .options-section {
  padding-top: 20px;
  border-top: 1px solid var(--inner-border);
}

.options-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.options-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.94rem;
}

.options-heading span {
  color: var(--text-muted);
  font-size: 0.74rem;
  line-height: 1.4;
  text-align: right;
}

.options-heading-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.text-button {
  padding: 3px 0;
  color: var(--accent-blue);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.advanced-inputs {
  display: grid;
  gap: 14px;
}

.advanced-inputs textarea {
  min-height: 82px;
}

.toggle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.toggle-field {
  display: grid;
  min-width: 0;
  gap: 7px;
}

.toggle-field label {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toggle-field.is-disabled {
  opacity: 0.48;
}

.compact-select select {
  min-height: 42px;
  padding-left: 12px;
  font-size: 0.8rem;
}

.section-divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 13px;
  color: var(--text-muted);
}

.section-divider span {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--inner-border));
}

.section-divider span:last-child {
  background: linear-gradient(90deg, var(--inner-border), transparent);
}

.section-divider svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.result-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 12px;
}

.result-copy {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.result-group button {
  min-width: 164px;
}

.short-result {
  padding-top: 17px;
  border-top: 1px solid var(--inner-border);
}

.short-url-btn:disabled {
  cursor: progress;
  opacity: 0.72;
}

.spinner {
  width: 17px;
  height: 17px;
  border: 2px solid color-mix(in srgb, var(--text-primary) 25%, transparent);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.reveal-block {
  animation: reveal 0.24s ease-out;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes status-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 680px) {
  .converter-form {
    gap: 17px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 11px;
  }

  .field-grid,
  .options-inputs,
  .remote-row,
  .result-group {
    grid-template-columns: 1fr;
  }

  .backend-status {
    grid-column: 1;
  }

  .toggle-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .options-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .options-heading-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .options-heading span {
    text-align: left;
  }

  .parameter-button,
  .result-group button {
    width: 100%;
  }

  .options-panel {
    padding: 15px;
    border-radius: 18px;
  }
}

@media (max-width: 420px) {
  .toggle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
