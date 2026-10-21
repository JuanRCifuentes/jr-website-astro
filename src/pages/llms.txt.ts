import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { site } from '../lib/site'

const sections = ['About', 'Projects', 'Speaking', 'Uses']

// The site as one Markdown file (llmstxt.org), so an AI assistant can say who
// Juan is and what he writes about without crawling every page.
export const GET: APIRoute = async ({ site: origin }) => {
  const link = (path: string) => new URL(path, origin).href
  const articles = (await getCollection('articles'))
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .map(({ id, data }) => `- [${data.title}](${link(`/articles/${id}/`)}): ${data.description}`)
  const body = [
    `# ${site.name}`,
    '',
    `> ${site.jobTitle}. ${site.description}`,
    '',
    '## Pages',
    '',
    ...sections.map((label) => `- [${label}](${link(`/${label.toLowerCase()}/`)})`),
    '',
    '## Articles',
    '',
    ...articles,
    '',
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
