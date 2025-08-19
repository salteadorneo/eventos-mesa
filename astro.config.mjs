import { defineConfig } from 'astro/config';
import path from 'path';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://eventos.salteadorneo.dev',
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
});