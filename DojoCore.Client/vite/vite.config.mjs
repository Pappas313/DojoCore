import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // depending on your application, base can also be "/"
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_APP_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1600
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    resolve: {
      extensions: ['.jsx', '.tsx', '.mjs', '.js', '.ts', '.json'],
      alias: {
        'api':          path.resolve(__dirname, 'src/api'),
        'views':        path.resolve(__dirname, 'src/views'),
        'layout':       path.resolve(__dirname, 'src/layout'),
        'ui-component': path.resolve(__dirname, 'src/ui-component'),
        'contexts':     path.resolve(__dirname, 'src/contexts'),
        'hooks':        path.resolve(__dirname, 'src/hooks'),
        'store':        path.resolve(__dirname, 'src/store'),
        'themes':       path.resolve(__dirname, 'src/themes'),
        'utils':        path.resolve(__dirname, 'src/utils'),
        'assets':       path.resolve(__dirname, 'src/assets'),
        'menu-items':   path.resolve(__dirname, 'src/menu-items'),
        'routes':       path.resolve(__dirname, 'src/routes'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
      }
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()]
  };
});
