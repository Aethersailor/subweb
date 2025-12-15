<template>
  <div class="layout-wrapper">
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
  methods: {
    setNavActive() {
      const scrollY = window.scrollY || window.pageYOffset;
      // 设置 MAIN_LAYOUT_NAV_ACTIVE 根据滚动位置
      this.$store.commit('MAIN_LAYOUT_NAV_ACTIVE', scrollY > 0);
    },
  },
  mounted() {
    // 在组件挂载后，添加滚动事件监听器
    window.addEventListener('scroll', this.setNavActive);
  },
  beforeUnmount() {
    // 在组件销毁前，移除滚动事件监听器，以防止内存泄漏
    window.removeEventListener('scroll', this.setNavActive);
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
  background: linear-gradient(338.18deg, #fafaff 0%, #ececec 94.44%); /* Apply global background */
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
