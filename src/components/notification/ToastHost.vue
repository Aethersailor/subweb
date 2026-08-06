<template>
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <div v-if="notification" class="toast" :class="`is-${notification.type}`" role="status">
      <span class="toast-icon" aria-hidden="true">{{ notification.type === 'success' ? '✓' : '!' }}</span>
      <span
        ><strong>{{ notification.title }}</strong
        >{{ notification.message }}</span
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToastHost',
  data() {
    return { notification: null, timer: null };
  },
  mounted() {
    window.addEventListener('subweb:notification', this.show);
  },
  beforeUnmount() {
    window.removeEventListener('subweb:notification', this.show);
    window.clearTimeout(this.timer);
  },
  methods: {
    show(event) {
      this.notification = event.detail;
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.notification = null;
      }, 2600);
    },
  },
};
</script>

<style scoped>
.toast-region {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 4000;
  width: min(360px, calc(100vw - 36px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  color: var(--text-primary);
  background: var(--surface-strong);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  animation: toast-enter 0.2s ease-out;
}

.toast-icon {
  display: grid;
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  color: #fff;
  font-weight: 800;
  background: var(--success);
  border-radius: 50%;
  place-items: center;
}

.toast.is-error .toast-icon {
  background: var(--danger);
}

.toast strong {
  margin-right: 0.45em;
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
