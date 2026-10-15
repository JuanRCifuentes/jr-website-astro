// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://juanrcifuentes.com",
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith("/thank-you/") })],

  prefetch: { prefetchAll: true, defaultStrategy: "load" },

  vite: {
      plugins: [tailwindcss()],
  },
});
