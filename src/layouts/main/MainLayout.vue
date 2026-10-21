<template>
  <div class="app-shell" dir="ltr">
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
