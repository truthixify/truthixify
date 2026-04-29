import Link from 'next/link'
import { getArticles, getSeriesTitle } from '@/lib/content'
import { fmtDate } from '@/lib/date'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Long-form essays, tutorials, monthly roll-ups, and one-off pieces by truthxify.',
}

export default function ArticlesPage() {
  const sorted = getArticles()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-2xl">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          All Articles
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Articles</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Long-form writing — essays, tutorials, monthly roll-ups, or one-off pieces on whatever I
          felt like writing about. Some stand alone; others are part of a series.
        </p>
      </header>

      <ul className="divide-border border-border mt-14 divide-y border-t">
        {sorted.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="group grid gap-2 py-6 sm:grid-cols-[10rem_1fr_auto] sm:gap-8"
            >
              <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase sm:pt-2">
                {fmtDate(a.date)}
              </span>
              <div className="min-w-0">
                <h2 className="group-hover:text-accent font-serif text-xl transition-colors sm:text-2xl">
                  {a.title}
                </h2>
                <p className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed">
                  {a.summary}
                </p>
                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                  {a.series && (
                    <span>
                      <span className="text-rail">Series · </span>
                      <span className="text-foreground/80">{getSeriesTitle(a.series)}</span>
                    </span>
                  )}
                  <span>{a.readMinutes} min</span>
                </div>
              </div>
              <div className="hidden max-w-[12rem] flex-wrap justify-end gap-1.5 self-start sm:flex sm:pt-2">
                {a.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-muted-foreground border-border rounded-sm border px-1.5 py-0.5 font-mono text-[0.65rem] tracking-wider uppercase"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
