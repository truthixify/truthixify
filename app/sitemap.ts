import { MetadataRoute } from 'next'
import { getArticles, series } from '@/lib/content'
import { fetchGithubJournals } from '@/lib/github-journals'

const SITE_URL = 'https://truthixify.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString().split('T')[0]
  const articles = getArticles()

  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // GitHub unavailable
  }

  const staticRoutes = ['', 'series', 'articles', 'journals', 'projects', 'about', 'tags']

  const allTags = new Set<string>()
  for (const a of articles) a.tags.forEach((t) => allTags.add(t.toLowerCase()))
  for (const j of journals) j.tags.forEach((t) => allTags.add(t.toLowerCase()))

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}/${route}`,
      lastModified: today,
    })),
    ...articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: a.date,
    })),
    ...series.map((s) => ({
      url: `${SITE_URL}/series/${s.slug}`,
      lastModified: today,
    })),
    ...journals.map((j) => ({
      url: `${SITE_URL}/journals/${j.date}`,
      lastModified: j.date,
    })),
    ...[...allTags].map((tag) => ({
      url: `${SITE_URL}/tags/${tag}`,
      lastModified: today,
    })),
  ]
}
