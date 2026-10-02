// Keep static section HTML ready for this browsing session, independently of HTTP expiry.
// Other routes and forms continue through Astro's default loader.
const pages = new Map<string, Promise<{ html: string; url: string }>>()
const key = (url: URL) => `${url.origin}${url.pathname.replace(/\/$/, '') || '/'}`

function load(url: URL) {
  const id = key(url)
  let page = pages.get(id)
  if (!page) {
    page = fetch(id).then(async (response) => {
      if (new URL(response.url).origin !== location.origin || !response.ok || !response.headers.get('content-type')?.includes('text/html')) {
        throw new Error('Section prefetch failed')
      }
      return { html: await response.text(), url: response.url }
    }).catch((error) => {
      pages.delete(id)
      throw error
    })
    pages.set(id, page)
  }
  return page
}

const sectionUrls = () => [...document.querySelectorAll<HTMLAnchorElement>('#desktop-nav a')]
  .map((link) => new URL(link.href))

// Start after page load when the browser is idle. Failures fall back to normal routing.
document.addEventListener('astro:page-load', () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (connection?.saveData || connection?.effectiveType?.includes('2g')) return
  const prefetch = () => sectionUrls().forEach((url) => { void load(url).catch(() => {}) })
  if ('requestIdleCallback' in window) window.requestIdleCallback(prefetch, { timeout: 1000 })
  else setTimeout(prefetch, 0)
})

document.addEventListener('astro:before-preparation', (event) => {
  if (event.formData || event.to.search || !sectionUrls().some((url) => key(url) === key(event.to))) return
  const defaultLoader = event.loader
  event.loader = async () => {
    try {
      const page = await load(event.to)
      if (event.signal.aborted) return
      const next = new DOMParser().parseFromString(page.html, 'text/html')
      if (!next.querySelector('[name="astro-view-transitions-enabled"]')) throw new Error('Router unavailable')
      // Let Astro prepare any newly required styles rather than skip its loading safeguards.
      const styles = [...next.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
      if (styles.some((link) => ![...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
        .some((current) => current.href === new URL(link.getAttribute('href')!, page.url).href))) {
        await defaultLoader()
        return
      }
      next.querySelectorAll('noscript').forEach((element) => element.remove())
      const destination = new URL(page.url)
      destination.hash = event.to.hash
      event.to = destination
      event.newDocument = next
    } catch {
      if (!event.signal.aborted) await defaultLoader()
    }
  }
})
