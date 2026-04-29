import Link from 'next/link'
import { getArticles } from '@/lib/content'
import { fetchGithubJournals } from '@/lib/github-journals'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Cross-cuts across articles and journal entries.',
}

export default async function TagsPage() {
  const articles = getArticles()
  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // GitHub unavailable
  }

  const counts = new Map<string, { articles: number; journals: number }>()
  for (const a of articles) {
    for (const t of a.tags) {
      const k = t.toLowerCase()
      const c = counts.get(k) ?? { articles: 0, journals: 0 }
      c.articles += 1
      counts.set(k, c)
    }
  }
  for (const j of journals) {
    for (const t of j.tags) {
      const k = t.toLowerCase()
      const c = counts.get(k) ?? { articles: 0, journals: 0 }
      c.journals += 1
      counts.set(k, c)
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => {
    const ta = a[1].articles + a[1].journals
    const tb = b[1].articles + b[1].journals
    if (tb !== ta) return tb - ta
    return a[0].localeCompare(b[0])
  })

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="max-w-2xl">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          All Tags
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Tags</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Cross-cuts across articles and journal entries. {sorted.length} tags total.
        </p>
      </header>

      <ul className="mt-12 flex flex-wrap gap-2">
        {sorted.map(([tag, c]) => {
          const total = c.articles + c.journals
          return (
            <li key={tag}>
              <Link
                href={`/tags/${tag}`}
                className="group border-border hover:border-accent/60 hover:text-accent inline-flex items-baseline gap-2 rounded-sm border px-3 py-1.5 transition-colors"
              >
                <span className="font-mono text-sm">#{tag}</span>
                <span className="text-muted-foreground font-mono text-xs">{total}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
