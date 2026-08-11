<template>
  <div class="app-shell" :class="themeClass" dir="ltr">
    <nav-bar />
    <main class="layout-content">
      <router-view />
    </main>
    <div class="layout-footer">
      <footer-bar />
    </div>
  </div>
</template>

<script>
import NavBar from './navbar/NavBar.vue';
import FooterBar from './footer/FooterBar.vue';

export default {
  components: { NavBar, FooterBar },
  name: 'MainLayout',
  data() {
    return {
      themeClass: 'light-style',
      mediaQuery: null,
    };
  },
  methods: {
    updateTheme(e) {
      this.themeClass = e.matches ? 'dark-style' : 'light-style';
      if (e.matches) {
        document.body.classList.add('dark-style');
        document.body.classList.remove('light-style');
      } else {
        document.body.classList.add('light-style');
        document.body.classList.remove('dark-style');
      }
    },
  },
  mounted() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.updateTheme(this.mediaQuery);

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.updateTheme);
    } else {
      this.mediaQuery.addListener(this.updateTheme);
    }
  },
  beforeUnmount() {
    if (this.mediaQuery?.removeEventListener) {
      this.mediaQuery.removeEventListener('change', this.updateTheme);
    } else {
      this.mediaQuery?.removeListener(this.updateTheme);
    }
  },
};
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: var(--text-primary);
}

.layout-content {
  flex: 1;
}

.layout-footer {
  margin-top: auto;
}
</style>
