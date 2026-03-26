import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function copyManifest(): Plugin {
  return {
    name: 'copy-manifest',
    writeBundle({ dir }) {
      if (!dir) return;
      const src = path.resolve(__dirname, 'manifest.json');
      const dest = path.resolve(dir, 'manifest.json');
      fs.copyFileSync(src, dest);
    },
  };
}

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), copyManifest()],
    define: {
      'process.env': '{}',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  };
});
