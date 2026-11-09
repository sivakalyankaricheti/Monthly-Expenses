import tailwindcss from '@tailwindcss/postcss';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [cloudflare()],
});
