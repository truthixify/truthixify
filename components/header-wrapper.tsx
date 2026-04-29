import { SiteHeader } from '@/components/site-header'
import { getArticles, series, getSeriesTitle } from '@/lib/content'
import { fetchGithubJournals } from '@/lib/github-journals'
import projectsData from '@/data/projectsData'

export async function HeaderWrapper() {
  const articles = getArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    date: a.date,
    summary: a.summary,
    tags: a.tags,
    series: a.series,
    seriesTitle: getSeriesTitle(a.series),
  }))

  const seriesList = series.map((s) => ({
    slug: s.slug,
    title: s.title,
    summary: s.summary,
  }))

  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // fallback to empty if GitHub is unavailable
  }

  return (
    <SiteHeader
      articles={articles}
      seriesList={seriesList}
      journals={journals}
      projects={projectsData}
    />
  )
}
