"""Check the built site: charset placement, SEO tags, link preview card,
structured data, local links and fragments, and that the sitemap matches the
indexable pages. Run after bun run build: bun run check:pages
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'dist'
ORIGIN = 'juanrcifuentes.com'


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links = path, set(), []
        self.meta, self.jsonld, self.script = {}, [], None
        self.h1, self.canonical = 0, None
        html = path.read_text()
        assert '<meta charset' in html[:1024], f'{path}: charset not in the first 1024 bytes'
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'{self.path}: duplicate ID {attrs["id"]}'
            self.ids.add(attrs['id'])
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name'))] = attrs.get('content')
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.script = ''
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'h1':
            self.h1 += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')

    def handle_data(self, data):
        if self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.jsonld.append(json.loads(self.script))
            self.script = None


# Routes end in a slash, as Cloudflare serves directory pages; 404.html is not a route.
route_of = lambda file: '/' + ''.join(f'{part}/' for part in file.parent.relative_to(ROOT).parts)
pages = {route_of(file): Page(file) for file in ROOT.rglob('index.html')}
indexable = {route for route, page in pages.items() if page.meta.get('robots') != 'noindex'}

for route, page in pages.items():
    assert page.h1 == 1, f'{route}: expected one h1, got {page.h1}'
    assert page.meta.get('description'), f'{route}: missing description'
    image = urlsplit(page.meta.get('og:image', ''))
    assert image.scheme == 'https', f'{route}: link preview card must be absolute HTTPS'
    assert (ROOT / image.path.lstrip('/')).is_file(), f'{route}: missing link preview card {image.path}'
    if route in indexable:
        assert page.canonical and urlsplit(page.canonical).path == route, f'{route}: wrong canonical {page.canonical}'
        assert page.meta.get('og:url') == page.canonical, f'{route}: og:url differs from canonical'
        assert page.jsonld, f'{route}: missing structured data'
    for href in page.links:
        url = urlsplit(urljoin(f'https://{ORIGIN}{route}', href))
        # Placeholder "#" links are template content still waiting for real URLs.
        if url.netloc != ORIGIN or href == '#':
            continue
        path = unquote(url.path)
        target = pages.get(path)
        if target is None:
            assert (ROOT / path.lstrip('/')).is_file(), f'{route}: broken or redirecting link {href}'
        elif url.fragment:
            assert unquote(url.fragment) in target.ids, f'{route}: missing fragment {href}'
    for block in page.jsonld:
        for node in block.get('@graph', [block]):
            if node.get('@type') == 'BlogPosting':
                assert node['url'] == page.canonical, f'{route}: BlogPosting URL differs from canonical'

sitemap = {urlsplit(node.text).path for node in ET.parse(ROOT / 'sitemap-0.xml').findall('{*}url/{*}loc')}
assert sitemap == indexable, f'Sitemap mismatch: {sitemap ^ indexable}'
assert (ROOT / 'llms.txt').is_file(), 'missing llms.txt'
print(f'PASS: {len(pages)} pages; charset, SEO tags, card, structured data, links, fragments, sitemap and llms.txt')
