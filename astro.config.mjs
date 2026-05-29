// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kametora-lab.github.io',
  base: '/kametora_kusabana_sanpo',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), sitemap()]
});
