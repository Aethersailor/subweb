<template>
  <header class="site-header">
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
  background: var(--surface-strong);
  border-bottom: 1px solid var(--inner-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.topbar {
  display: flex;
  width: min(var(--content-width), calc(100% - 40px));
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 auto;
  padding: 10px 0;
}

@media (max-width: 720px) {
  .topbar {
    width: calc(100% - 20px);
    min-height: 58px;
    padding: 8px 0;
  }
}
</style>
