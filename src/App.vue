<template>
  <router-view />
  <ToastHost />
</template>

<script>
import ToastHost from '@/components/notification/ToastHost.vue';

export default {
  name: 'App',
  components: { ToastHost },
};
</script>

<style>
@import '@/assets/theme.css';
</style>
