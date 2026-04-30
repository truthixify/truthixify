'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { fmtDate } from '@/lib/date'
import type { Journal, Project } from '@/lib/types'

type ArticleSearchItem = {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  series?: string
  seriesTitle?: string
}

type SeriesSearchItem = {
  slug: string
  title: string
  summary: string
}

type SearchPart = { text: string; weight: number; exact?: boolean }

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const phraseAliases: Record<string, string[]> = {
  'machine learning': ['machine learning', 'ml', 'ai ml'],
}

const scoreItem = (haystackParts: SearchPart[], query: string): number => {
  const q = normalizeSearch(query)
  if (!q) return 1
  const aliases = phraseAliases[q]
  if (aliases) {
    return haystackParts.reduce((best, part) => {
      const text = normalizeSearch(part.text)
      const score = aliases.some((alias) => {
        const normalizedAlias = normalizeSearch(alias)
        return normalizedAlias.length <= 3
          ? text.split(/\s+/).includes(normalizedAlias)
          : text.includes(normalizedAlias)
      })
        ? part.weight
        : 0
      return Math.max(best, score)
    }, 0)
  }
  const tokens = q.split(/\s+/).filter(Boolean)
  let total = 0
  for (const tok of tokens) {
    let bestForToken = 0
    for (const part of haystackParts) {
      const text = normalizeSearch(part.text)
      const matches = part.exact ? text.split(/\s+/).includes(tok) : text.includes(tok)
      if (matches) {
        if (part.weight > bestForToken) bestForToken = part.weight
      }
    }
    if (bestForToken === 0) return 0
    total += bestForToken
  }
  return total
}

export const SearchPalette = ({
  open,
  onOpenChange,
  articles,
  series,
  journals,
  projects,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  articles: ArticleSearchItem[]
  series: SeriesSearchItem[]
  journals: Journal[]
  projects: Project[]
}) => {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const go = (path: string) => {
    onOpenChange(false)
    setQuery('')
    router.push(path)
  }

  const articleIndex = useMemo(
    () =>
      articles.map((a) => ({
        a,
        parts: [
          { text: a.title, weight: 10 },
          { text: a.tags.join(' '), weight: 6 },
          { text: a.summary, weight: 4 },
          { text: a.seriesTitle ?? '', weight: 3, exact: true },
        ],
      })),
    [articles]
  )

  const journalIndex = useMemo(() => {
    const sorted = [...journals].sort((a, b) => b.date.localeCompare(a.date))
    return sorted.map((j) => {
      const sectionsText = Object.values(j.sections).flat().filter(Boolean).join(' ')
      return {
        j,
        parts: [
          { text: j.goal, weight: 8 },
          { text: j.tags.join(' '), weight: 6 },
          { text: j.phase, weight: 4 },
          { text: j.date, weight: 4 },
          { text: sectionsText, weight: 2 },
        ],
      }
    })
  }, [journals])

  const seriesIndex = useMemo(
    () =>
      series.map((s) => ({
        s,
        parts: [
          { text: s.title, weight: 10, exact: true },
          { text: s.summary, weight: 4 },
        ],
      })),
    [series]
  )

  const projectIndex = useMemo(
    () =>
      projects.map((p) => ({
        p,
        parts: [
          { text: p.name, weight: 10, exact: true },
          { text: p.tags.join(' '), weight: 6 },
          { text: p.tagline, weight: 4 },
        ],
      })),
    [projects]
  )

  const matchedArticles = useMemo(() => {
    if (!query.trim()) return articleIndex.map((x) => x.a).slice(0, 8)
    return articleIndex
      .map((x) => ({ a: x.a, score: scoreItem(x.parts, query) }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .map((x) => x.a)
  }, [articleIndex, query])

  const matchedJournals = useMemo(() => {
    if (!query.trim()) return journalIndex.map((x) => x.j).slice(0, 8)
    return journalIndex
      .map((x) => ({ j: x.j, score: scoreItem(x.parts, query) }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .map((x) => x.j)
  }, [journalIndex, query])

  const matchedSeries = useMemo(() => {
    if (!query.trim()) return seriesIndex.map((x) => x.s)
    return seriesIndex
      .map((x) => ({ s: x.s, score: scoreItem(x.parts, query) }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .map((x) => x.s)
  }, [seriesIndex, query])

  const matchedProjects = useMemo(() => {
    if (!query.trim()) return projectIndex.map((x) => x.p)
    return projectIndex
      .map((x) => ({ p: x.p, score: scoreItem(x.parts, query) }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .map((x) => x.p)
  }, [projectIndex, query])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} commandProps={{ shouldFilter: false }}>
      <CommandInput
        placeholder="Search articles, series, journals, projects…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        {matchedArticles.length > 0 && (
          <CommandGroup heading={`Articles${query ? ` (${matchedArticles.length})` : ''}`}>
            {matchedArticles.map((a) => (
              <CommandItem
                key={a.slug}
                value={`a-${a.slug}`}
                onSelect={() => go(`/articles/${a.slug}`)}
              >
                <div className="flex flex-col">
                  <span>{a.title}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {fmtDate(a.date)}
                    {a.seriesTitle && ` · ${a.seriesTitle}`}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchedSeries.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Series${query ? ` (${matchedSeries.length})` : ''}`}>
              {matchedSeries.map((s) => (
                <CommandItem
                  key={s.slug}
                  value={`s-${s.slug}`}
                  onSelect={() => go(`/series/${s.slug}`)}
                >
                  <div className="flex flex-col">
                    <span>{s.title}</span>
                    <span className="text-muted-foreground text-xs">{s.summary}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedJournals.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Journal${query ? ` (${matchedJournals.length})` : ''}`}>
              {matchedJournals.map((j) => (
                <CommandItem
                  key={j.date}
                  value={`j-${j.date}`}
                  onSelect={() => go(`/journals/${j.date}`)}
                >
                  <div className="flex flex-col">
                    <span>{j.goal}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {fmtDate(j.date)} · {j.phase}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Projects${query ? ` (${matchedProjects.length})` : ''}`}>
              {matchedProjects.map((p) => (
                <CommandItem
                  key={p.slug}
                  value={`p-${p.slug}`}
                  onSelect={() => {
                    if (p.href) {
                      window.open(p.href, '_blank', 'noopener,noreferrer')
                      onOpenChange(false)
                    }
                  }}
                >
                  <div className="flex flex-col">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground text-xs">{p.tagline}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!query && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pages">
              <CommandItem value="page-index" onSelect={() => go('/')}>
                Index
              </CommandItem>
              <CommandItem value="page-now" onSelect={() => go('/now')}>
                Now
              </CommandItem>
              <CommandItem value="page-articles" onSelect={() => go('/articles')}>
                Articles
              </CommandItem>
              <CommandItem value="page-series" onSelect={() => go('/series')}>
                Series
              </CommandItem>
              <CommandItem value="page-journals" onSelect={() => go('/journals')}>
                Journals
              </CommandItem>
              <CommandItem value="page-tags" onSelect={() => go('/tags')}>
                Tags
              </CommandItem>
              <CommandItem value="page-projects" onSelect={() => go('/projects')}>
                Projects
              </CommandItem>
              <CommandItem value="page-about" onSelect={() => go('/about')}>
                About
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export const useSearchHotkey = (onOpen: () => void) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpen()
      }
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onOpen])
}
