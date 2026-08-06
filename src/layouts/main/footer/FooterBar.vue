<template>
  <footer class="site-footer">
    <span>{{ siteName }}</span>
    <span class="footer-dot" aria-hidden="true"></span>
    <a href="https://github.com/Aethersailor/subweb" target="_blank" rel="noopener noreferrer">Aethersailor/subweb</a>
    <template v-if="shortRevision !== 'local'">
      <span class="footer-dot" aria-hidden="true"></span>
      <a v-if="revisionUrl" :href="revisionUrl" target="_blank" rel="noopener noreferrer">版本 {{ shortRevision }}</a>
      <span v-else>版本 {{ shortRevision }}</span>
    </template>
  </footer>
</template>

<script>
import { getRuntimeConfig } from '@/config/runtime.js';

export default {
  name: 'FooterBar',
  data() {
    const revision = import.meta.env.APP_REVISION || 'local';
    return {
      siteName: getRuntimeConfig().siteName,
      shortRevision: revision === 'local' ? revision : revision.slice(0, 8),
      revisionUrl: /^[0-9a-f]{40}$/i.test(revision) ? `https://github.com/Aethersailor/subweb/commit/${revision}` : '',
    };
  },
};
</script>

<style scoped>
.site-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 26px 18px 30px;
  color: var(--text-muted);
  font-size: 0.84rem;
}

.site-footer a {
  color: var(--text-secondary);
  font-weight: 700;
  text-decoration: none;
}

.site-footer a:hover {
  color: var(--accent-blue);
}

.footer-dot {
  width: 5px;
  height: 5px;
  background: var(--accent-gradient);
  border-radius: 999px;
}

@media (max-width: 440px) {
  .site-footer {
    flex-wrap: wrap;
  }
}
</style>
