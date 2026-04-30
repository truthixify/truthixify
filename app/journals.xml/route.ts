import { fetchGithubJournals } from '@/lib/github-journals'

const SITE_URL = 'https://truthixify.vercel.app'

const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // GitHub unavailable
  }

  const items = journals
    .map(
      (j) => `    <item>
      <title>Journal · ${j.date}</title>
      <link>${SITE_URL}/journals/${j.date}</link>
      <guid isPermaLink="true">${SITE_URL}/journals/${j.date}</guid>
      <pubDate>${new Date(j.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(j.goal || `Daily learning log for ${j.date}`)}</description>
    </item>`
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>truthxify — Journal</title>
    <link>${SITE_URL}/journals</link>
    <description>Daily learning journal by truthxify.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/journals.xml" rel="self" type="application/rss+xml" />
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
