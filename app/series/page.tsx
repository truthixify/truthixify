import Link from 'next/link'
import { getSortedSeries, getSeriesArticles } from '@/lib/content'
import { StatusPill } from '@/components/status-pill'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Series',
  description:
    'Multi-part collections — tutorials, deep dives, essays, or whatever else is worth reading in order.',
}

export default function SeriesPage() {
  const allSeries = getSortedSeries()
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-2xl">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          All Series
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Series</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Multi-part collections — tutorials, deep dives, essays, or whatever else is worth reading
          in order.
        </p>
      </header>

      <div className="mt-14 space-y-12">
        {allSeries.map((s) => {
          const parts = getSeriesArticles(s.slug)
          return (
            <section key={s.slug} className="border-border border-t pt-8">
              <div className="grid gap-8 sm:grid-cols-[14rem_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono text-xs">
                      {s.articleSlugs.length} {s.articleSlugs.length === 1 ? 'Part' : 'Parts'}
                    </span>
                    <StatusPill status={s.status} />
                  </div>
                  <h2 className="mt-3 font-serif text-2xl">
                    <Link href={`/series/${s.slug}`} className="hover:text-accent">
                      {s.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mt-3 text-[0.95rem] leading-relaxed">
                    {s.summary}
                  </p>
                </div>

                {parts.length > 0 ? (
                  <ol className="space-y-3">
                    {parts.map((a, i) => (
                      <li key={a.slug}>
                        <Link
                          href={`/articles/${a.slug}`}
                          className="group hover:bg-muted/50 -mx-3 grid grid-cols-[2.5rem_1fr] gap-4 rounded p-3 transition-colors"
                        >
                          <span className="text-muted-foreground pt-0.5 font-mono text-sm">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <h3 className="group-hover:text-accent font-serif text-lg transition-colors">
                              {a.title}
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {a.readMinutes} min read
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground self-center font-mono text-sm">Coming soon</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
