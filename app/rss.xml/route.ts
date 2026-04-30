import { getArticles } from '@/lib/content'
import { fetchGithubJournals } from '@/lib/github-journals'

const SITE_URL = 'https://truthixify.vercel.app'
const SITE_NAME = 'truthxify'
const SITE_DESC =
  'Articles, series, and a daily journal on AI, cryptography, and distributed systems.'

const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  const articles = getArticles()
  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // GitHub unavailable
  }

  const allItems = [
    ...articles.map((a) => ({
      title: a.title,
      link: `${SITE_URL}/articles/${a.slug}`,
      date: a.date,
      description: a.summary,
    })),
    ...journals.map((j) => ({
      title: `Journal · ${j.date}`,
      link: `${SITE_URL}/journals/${j.date}`,
      date: j.date,
      description: j.goal || `Daily learning log for ${j.date}`,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const items = allItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${new Date(item.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  })
}
