import Link from 'next/link'
import { notFound } from 'next/navigation'
import { series, getSeries, getSeriesArticles } from '@/lib/content'
import { StatusPill } from '@/components/status-pill'
import { fmtDate } from '@/lib/date'
import { Metadata } from 'next'

export async function generateStaticParams() {
  return series.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const s = getSeries(slug)
  if (!s) return {}
  return {
    title: s.title,
    description: s.summary,
  }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getSeries(slug)
  if (!s) notFound()

  const parts = getSeriesArticles(s.slug)
  const totalMin = parts.reduce((sum, p) => sum + p.readMinutes, 0)
  const published = parts.length
  const planned = s.articleSlugs.length
  const progress = planned > 0 ? Math.round((published / planned) * 100) : 0

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/series"
        className="text-muted-foreground hover:text-accent font-mono text-xs tracking-wider uppercase"
      >
        &larr; All series
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-foreground font-mono text-xs">
            {published} / {planned} {planned === 1 ? 'Part' : 'Parts'}
          </span>
          <StatusPill status={s.status} />
          {totalMin > 0 && (
            <span className="text-muted-foreground font-mono text-xs">· {totalMin} min total</span>
          )}
        </div>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{s.title}</h1>
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed">{s.summary}</p>

        {planned > 0 && (
          <div className="mt-6">
            <div className="bg-muted h-1 overflow-hidden rounded-full">
              <div
                className="bg-accent h-full transition-all"
                style={{ width: `${progress}%` }}
                aria-label={`Series progress: ${progress}%`}
              />
            </div>
            <p className="text-muted-foreground mt-2 font-mono text-[0.65rem] tracking-wider uppercase">
              {progress}% complete
            </p>
          </div>
        )}
      </header>

      <ol className="mt-12 space-y-1">
        {parts.map((a, i) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="group border-border hover:bg-muted/40 -mx-3 grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 rounded border-t px-3 py-5 transition-colors sm:grid-cols-[3rem_1fr_auto] sm:gap-4"
            >
              <span className="text-muted-foreground font-mono text-sm">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h2 className="group-hover:text-accent font-serif text-lg transition-colors sm:text-xl">
                  {a.title}
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{a.summary}</p>
              </div>
              <span className="text-muted-foreground text-right font-mono text-xs whitespace-nowrap">
                {a.readMinutes} min · {fmtDate(a.date)}
              </span>
            </Link>
          </li>
        ))}
        {parts.length === 0 && (
          <li className="border-border text-muted-foreground border-t pt-8 font-mono text-sm">
            Coming soon — the first installment is in the journal.
          </li>
        )}
      </ol>
    </article>
  )
}
