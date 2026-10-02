// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // Preserve Astro 6 spacing between inline elements.
  compressHTML: true,
  integrations: [mdx()],

  vite: {
      plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});