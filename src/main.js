import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import DialogView from '@/components/dialog/DialogView.vue';
import { showDialog, closeDialog } from 'components/dialog';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.component('DialogView', DialogView);
app.use(router).use(store);

app.config.globalProperties.$showDialog = showDialog;
app.config.globalProperties.$closeDialog = closeDialog;
app.mount('#app');
