<template>
  <header class="site-header" :class="{ 'navbar-active': active }">
    <div class="topbar">
      <AppBrand ref="brand" :menu-open="menuOpen" @toggle-menu="setMenuOpen(!menuOpen)" />
      <NavMenu ref="menu" :open="menuOpen" @close="setMenuOpen(false)" />
    </div>
  </header>
</template>

<script>
import AppBrand from './AppBrand.vue';
import NavMenu from './NavMenu.vue';

export default {
  name: 'NavBar',
  components: { AppBrand, NavMenu },
  props: {
    active: { type: Boolean, default: false },
  },
  data() {
    return { menuOpen: false };
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
    this.unlockBodyScroll();
  },
  methods: {
    onKeydown(event) {
      if (event.key === 'Escape' && this.menuOpen) {
        this.setMenuOpen(false);
      }
    },
    setMenuOpen(open) {
      if (this.menuOpen === open) {
        return;
      }
      this.menuOpen = open;
      if (open) {
        document.body.classList.add('menu-open');
        this.$nextTick(() => this.$refs.menu?.focusClose());
      } else {
        this.unlockBodyScroll();
        this.$nextTick(() => this.$refs.brand?.focusToggle());
      }
    },
    unlockBodyScroll() {
      document.body.classList.remove('menu-open');
    },
  },
};
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  padding: 16px 20px 0;
  transition: padding 0.2s ease;
}

.topbar {
  display: flex;
  width: min(var(--content-width), 100%);
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 auto;
  padding: 10px 12px 10px 18px;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: 22px;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.navbar-active {
  padding-top: 10px;
}

@media (max-width: 720px) {
  .site-header {
    padding: 10px 10px 0;
  }

  .topbar {
    min-height: 58px;
    padding: 8px 10px 8px 14px;
    border-radius: 18px;
  }
}
</style>
