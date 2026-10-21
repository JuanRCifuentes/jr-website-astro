# juanrcifuentes.com

Juan R. Cifuentes's personal site, built with [Astro](https://docs.astro.build) and served as static files by Cloudflare.

| Command | Action |
| :-- | :-- |
| `bun install` | Install dependencies |
| `bun dev` | Start the dev server at `localhost:4321` |
| `bun run build` | Build the site to `./dist/` |
| `bun run check:pages` | After a build, check SEO tags, structured data, links and the sitemap |
| `bun run preview` | Build and serve the site locally with Wrangler |
| `bun run deploy` | Build and deploy to Cloudflare |

Who the site is about (name, job title, default title and description, link preview card) lives in `src/lib/site.ts`.
