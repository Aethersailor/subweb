<template>
  <div class="brand-wrap">
    <router-link to="/" class="brand-link" aria-label="返回首页">
      <picture class="brand-mark" aria-hidden="true">
        <source media="(prefers-color-scheme: dark)" :srcset="`${baseUrl}subconverter-extended-dark.svg`" />
        <img :src="`${baseUrl}subconverter-extended-light.svg`" alt="" width="43" height="43" decoding="async" />
      </picture>
      <span class="brand-text">{{ siteName }}</span>
    </router-link>
    <button
      class="menu-toggle"
      ref="menuToggle"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="mobile-navigation"
      aria-label="打开导航菜单"
      @click="$emit('toggle-menu')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  </div>
</template>

<script>
import { getRuntimeConfig } from '@/config/runtime.js';

export default {
  name: 'AppBrand',
  emits: ['toggle-menu'],
  props: {
    menuOpen: { type: Boolean, default: false },
  },
  data() {
    return {
      baseUrl: import.meta.env.BASE_URL,
      siteName: '',
    };
  },
  created() {
    this.siteName = getRuntimeConfig().siteName;
  },
  methods: {
    focusToggle() {
      this.$refs.menuToggle?.focus();
    },
  },
};
</script>

<style scoped>
.brand-wrap,
.brand-link {
  display: flex;
  min-width: 0;
  align-items: center;
}

.brand-wrap {
  gap: 10px;
}

.brand-link {
  gap: 11px;
  color: var(--text-primary);
  text-decoration: none;
}

.brand-mark {
  display: block;
  width: 43px;
  height: 43px;
  flex: 0 0 auto;
  border-radius: 13px;
  box-shadow:
    0 10px 22px rgba(2, 132, 199, 0.16),
    0 5px 12px rgba(101, 163, 13, 0.12);
}

.brand-mark img {
  display: block;
  width: 100%;
  height: 100%;
}

.brand-text {
  overflow: hidden;
  font-size: 1rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  padding: 10px;
  color: var(--text-primary);
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 999px;
}

.menu-toggle svg {
  width: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
}

@media (max-width: 720px) {
  .brand-wrap {
    width: 100%;
    justify-content: space-between;
  }

  .brand-mark {
    width: 39px;
    height: 39px;
    border-radius: 12px;
  }

  .brand-text {
    max-width: 210px;
  }

  .menu-toggle {
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
  }
}
</style>
