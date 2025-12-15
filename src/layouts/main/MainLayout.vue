<template>
  <div
    class="layout-wrapper layout-navbar-fixed layout-wide"
    :class="themeClass"
    dir="ltr"
    data-theme="theme-default"
    data-assets-path="assets/"
    data-template="front-pages"
  >
    <nav-bar />
    <div class="layout-content">
      <router-view />
    </div>
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
      themeClass: 'light-style', // Default to light
    };
  },
  methods: {
    setNavActive() {
      const scrollY = window.scrollY || window.pageYOffset;
      // 设置 MAIN_LAYOUT_NAV_ACTIVE 根据滚动位置
      this.$store.commit('MAIN_LAYOUT_NAV_ACTIVE', scrollY > 0);
    },
    updateTheme(e) {
      this.themeClass = e.matches ? 'dark-style' : 'light-style';
    },
  },
  mounted() {
    // 在组件挂载后，添加滚动事件监听器
    window.addEventListener('scroll', this.setNavActive);

    // Initialize theme based on system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.updateTheme(mediaQuery);
    
    // Listen for theme changes
    // Use addEventListener if supported (modern browsers), else addListener (older Safari)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', this.updateTheme);
    } else {
      mediaQuery.addListener(this.updateTheme);
    }
  },
  beforeUnmount() {
    // 在组件销毁前，移除滚动事件监听器，以防止内存泄漏
    window.removeEventListener('scroll', this.setNavActive);
    
    // Remove theme listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', this.updateTheme);
    } else {
      mediaQuery.removeListener(this.updateTheme);
    }
  },
};
</script>

<style scoped>
@import '@/assets/vendor/css/pages/front-page.css';
@import '@/assets/vendor/css/pages/front-page-landing.css';

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-wrapper.light-style {
  background: linear-gradient(338.18deg, #fafaff 0%, #ececec 94.44%);
}

.layout-wrapper.dark-style {
  background-color: #25293c;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-footer {
  margin-top: auto;
}
</style>
