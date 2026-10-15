import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const revision = process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || process.env.APP_REVISION || 'local';

function versionAsset() {
  return {
    name: 'version-asset',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify({ revision })}\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), versionAsset()],
  define: {
    'import.meta.env.APP_REVISION': JSON.stringify(revision),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
  },
});
