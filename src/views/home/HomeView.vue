<template>
  <section class="home-page">
    <div class="hero">
      <div class="status-pill">SubConverter-compatible frontend</div>
      <h1>Subconverter <span>订阅转换</span></h1>
      <p>将订阅或节点转换为 Clash、Surge、Quantumult X、V2Ray 等常用客户端格式。</p>
    </div>
    <div v-if="configIssues.length" class="config-warning" role="alert">
      <strong>配置提示</strong>
      <span>{{ configIssues.join('；') }}</span>
    </div>
    <div class="converter-panel glass-panel">
      <SubTable />
    </div>
  </section>
</template>

<script>
import SubTable from './SubTable.vue';
import { getRuntimeConfigIssues } from '@/config/runtime.js';
export default {
  name: 'SubconverterView',
  components: {
    SubTable,
  },
  data() {
    return { configIssues: getRuntimeConfigIssues() };
  },
};
</script>

<style scoped>
.home-page {
  width: min(var(--content-width), calc(100% - 40px));
  margin: 0 auto;
  padding: 64px 0 12px;
}

.hero {
  max-width: 760px;
  margin: 0 auto 28px;
  text-align: center;
}

.status-pill {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 9px;
  margin-bottom: 16px;
  padding: 8px 13px;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: var(--surface-soft);
  border: 1px solid var(--inner-border);
  border-radius: 999px;
}

.hero h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(2.25rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.04;
  letter-spacing: -0.045em;
}

.hero h1 span {
  color: transparent;
  background: var(--accent-gradient);
  background-clip: text;
  -webkit-background-clip: text;
}

.hero p {
  max-width: 660px;
  margin: 17px auto 0;
  color: var(--text-secondary);
  font-size: clamp(0.98rem, 2vw, 1.1rem);
  line-height: 1.7;
}

.converter-panel {
  padding: 32px;
  animation: panel-enter 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}

.config-warning {
  display: grid;
  gap: 5px;
  margin: 0 0 18px;
  padding: 13px 16px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--warning) 11%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--warning) 36%, transparent);
  border-radius: 16px;
}

.config-warning strong {
  color: var(--warning);
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 720px) {
  .home-page {
    width: min(100% - 20px, var(--content-width));
    padding-top: 42px;
  }

  .hero {
    margin-bottom: 22px;
    padding: 0 8px;
  }

  .hero h1 {
    font-size: clamp(2.05rem, 11vw, 3.1rem);
  }

  .converter-panel {
    padding: 21px 16px;
  }
}
</style>
