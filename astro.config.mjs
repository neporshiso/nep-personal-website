// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import icon from 'astro-icon';
import keystatic from '@keystatic/astro';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://neporshiso.com',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    markdoc(),
    icon(),
    ...(isProduction ? [] : [keystatic()]),
  ],
});
