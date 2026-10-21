// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://juanrcifuentes.com",
  scopedStyleStrategy: "class",
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith("/thank-you/") })],

  // Prefetch a link when it is hovered or tapped, not every link on load.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  // Inline the CSS (about 12 KB) so the first paint never waits on a stylesheet request.
  build: { inlineStylesheets: "always" },

  vite: {
      // Without the Cloudflare adapter the CSS isn't lowered for older browsers
      // by default, which drops the -webkit- prefixes Safari < 18 needs
      // (e.g. backdrop-filter). Pin Vite's "baseline widely available" targets.
      build: {
        cssTarget: ["chrome111", "edge111", "firefox114", "safari16.4", "ios16.4"],
      },
  },
});
