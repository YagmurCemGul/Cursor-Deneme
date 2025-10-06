import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveManifest() {
  // Prefer extension/manifest.json; fallback to extension/manifest.config.(ts|js) or public/manifest.json
  const candidates = [
    'extension/manifest.json',
    'extension/manifest.config.ts',
    'extension/manifest.config.js',
    'extension/public/manifest.json',
    'manifest.json',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      return JSON.parse(content);
    }
  }
  throw new Error('manifest not found (expected extension/manifest.json or manifest.config.ts)');
}

export default defineConfig({
  root: 'extension',
  plugins: [
    react(),
    crx({ manifest: resolveManifest() }),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      // Ensure HTML entry points are discovered even if not referenced elsewhere
      input: {
        popup: 'extension/src/popup/index.html',
        options: 'extension/src/options/index.html',
        newtab: 'extension/src/newtab/index.html',
      },
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 5174 },
});
