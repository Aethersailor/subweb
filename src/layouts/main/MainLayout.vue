<template>
  <div class="app-shell" :class="themeClass" dir="ltr">
    <nav-bar :active="navActive" />
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
      navActive: false,
    };
  },
  methods: {
    setNavActive() {
      const scrollY = window.scrollY || window.pageYOffset;
      this.navActive = scrollY > 0;
    },
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
    window.addEventListener('scroll', this.setNavActive);
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.updateTheme(this.mediaQuery);

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.updateTheme);
    } else {
      this.mediaQuery.addListener(this.updateTheme);
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.setNavActive);

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
