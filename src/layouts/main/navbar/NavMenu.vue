<template>
  <div
    id="mobile-navigation"
    ref="panel"
    class="nav-menu"
    :class="{ open }"
    :aria-hidden="!open && isMobile ? 'true' : null"
    @keydown.tab="trapFocus"
  >
    <div class="mobile-menu-head">
      <span>导航</span>
      <button ref="closeButton" type="button" aria-label="关闭导航菜单" @click="$emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
    <ul>
      <li v-for="item in navBarItem" :key="`${item.title}-${item.link}`">
        <a
          :href="item.link"
          :target="item.target"
          :rel="item.target === '_blank' ? 'noopener noreferrer' : null"
          @click="$emit('close')"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </div>
  <button
    v-if="open"
    class="menu-overlay"
    type="button"
    tabindex="-1"
    aria-hidden="true"
    @click="$emit('close')"
  ></button>
</template>

<script>
import { getRuntimeConfig } from '@/config/runtime.js';

export default {
  name: 'NavMenu',
  emits: ['close'],
  props: {
    open: { type: Boolean, default: false },
  },
  data() {
    return {
      navBarItem: getRuntimeConfig().menuItem,
      mediaQuery: null,
      isMobile: false,
    };
  },
  mounted() {
    this.mediaQuery = window.matchMedia('(max-width: 720px)');
    this.updateMedia(this.mediaQuery);
    this.mediaQuery.addEventListener?.('change', this.updateMedia);
  },
  beforeUnmount() {
    this.mediaQuery?.removeEventListener?.('change', this.updateMedia);
  },
  methods: {
    updateMedia(event) {
      this.isMobile = event.matches;
      if (!event.matches && this.open) {
        this.$emit('close');
      }
    },
    focusClose() {
      this.$refs.closeButton?.focus();
    },
    trapFocus(event) {
      if (!this.open || !this.isMobile) {
        return;
      }
      const focusable = [...this.$refs.panel.querySelectorAll('button, a[href]')];
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
  },
};
</script>

<style scoped>
.nav-menu ul {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-menu a {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  padding: 9px 13px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.nav-menu a:hover {
  color: var(--text-primary);
  background: var(--control-hover);
  transform: translateY(-1px);
}

.mobile-menu-head,
.menu-overlay {
  display: none;
}

@media (max-width: 720px) {
  .nav-menu {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 120;
    display: none;
    width: min(320px, calc(100vw - 42px));
    height: 100vh;
    height: 100svh;
    padding: 18px;
    background: var(--surface-strong);
    border-left: 1px solid var(--surface-border);
    box-shadow: -24px 0 60px rgba(15, 23, 42, 0.24);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }

  .nav-menu.open {
    display: block;
  }

  .mobile-menu-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 2px 16px;
    color: var(--text-primary);
    font-weight: 700;
    border-bottom: 1px solid var(--inner-border);
  }

  .mobile-menu-head button {
    display: grid;
    width: 40px;
    height: 40px;
    padding: 9px;
    color: var(--text-primary);
    cursor: pointer;
    background: var(--control-bg);
    border: 1px solid var(--control-border);
    border-radius: 999px;
    place-items: center;
  }

  .mobile-menu-head svg {
    width: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
  }

  .nav-menu ul {
    align-items: stretch;
    flex-direction: column;
    gap: 7px;
    padding-top: 16px;
  }

  .nav-menu a {
    width: 100%;
    min-height: 46px;
    padding-inline: 15px;
    background: var(--surface-soft);
    border: 1px solid var(--inner-border);
  }

  .menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 110;
    display: block;
    padding: 0;
    cursor: default;
    background: rgba(2, 6, 23, 0.46);
    border: 0;
  }
}
</style>
