// Who the site is about, shared by the meta tags, structured data and llms.txt.
export const site = {
  name: 'Juan R. Cifuentes',
  jobTitle: 'Software developer',
  title: 'Juan R. Cifuentes - Software designer, founder, and amateur astronaut',
  description:
    "I'm Juan, a software designer and entrepreneur based in New York City. I'm the founder and CEO of Planetaria, where we develop technologies that empower regular people to explore space on their own terms.",
  // Link preview card, 1200 × 630.
  image: '/og.jpg',
  // The secondary pages, linked from the footer and listed in llms.txt.
  pages: [
    { href: '/about/', label: 'About' },
    { href: '/projects/', label: 'Projects' },
    { href: '/speaking/', label: 'Speaking' },
    { href: '/uses/', label: 'Uses' },
  ],
}

/** The @id other structured data uses to point at the Person. */
export const personId = (origin: URL) => new URL('/#person', origin).href

export const person = (origin: URL) => ({
  '@type': 'Person',
  '@id': personId(origin),
  name: site.name,
  jobTitle: site.jobTitle,
  url: origin.href,
})
