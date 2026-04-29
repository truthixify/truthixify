import { allBlogs } from 'contentlayer/generated'
import { series, getSeries, getSeriesTitle } from '@/data/seriesData'

export type ArticleItem = {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  series?: string
  part?: number
  readMinutes: number
  cover?: string
  path: string
}

function toArticle(blog: (typeof allBlogs)[number]): ArticleItem {
  return {
    slug: blog.slug,
    title: blog.title,
    date: blog.date,
    summary: blog.summary ?? '',
    tags: blog.tags ?? [],
    series: (blog as any).series ?? undefined,
    part: (blog as any).part ?? undefined,
    readMinutes: Math.ceil(blog.readingTime?.minutes ?? 0),
    cover: blog.images?.[0] ?? undefined,
    path: blog.path,
  }
}

export function getArticles(): ArticleItem[] {
  return allBlogs
    .filter((b) => process.env.NODE_ENV !== 'production' || !b.draft)
    .map(toArticle)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticle(slug: string): ArticleItem | undefined {
  const blog = allBlogs.find((b) => b.slug === slug)
  if (!blog) return undefined
  if (process.env.NODE_ENV === 'production' && blog.draft) return undefined
  return toArticle(blog)
}

export function getSeriesArticles(seriesSlug: string): ArticleItem[] {
  const s = getSeries(seriesSlug)
  if (!s) return []
  return s.articleSlugs.map((slug) => getArticle(slug)).filter(Boolean) as ArticleItem[]
}

export { series, getSeries, getSeriesTitle }
