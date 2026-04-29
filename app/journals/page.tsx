import Link from 'next/link'
import { fetchGithubJournals } from '@/lib/github-journals'
import { fmtDate } from '@/lib/date'
import { JournalHeatmap } from '@/components/journal-heatmap'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'A daily, structured log of what truthxify is building, breaking, and learning. Synced from the learning-journal repo.',
}

export default async function JournalsPage() {
  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  let fetchError = false
  try {
    journals = await fetchGithubJournals()
  } catch {
    fetchError = true
  }

  const sorted = [...journals].sort((a, b) => b.date.localeCompare(a.date))
  const lastSync = sorted[0]?.date

  const groups = sorted.reduce<Record<string, typeof sorted>>((acc, j) => {
    const key = new Date(j.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    ;(acc[key] ??= []).push(j)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-2xl">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          Daily Log
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Journal</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          A daily, structured log of what I&apos;m building, breaking, and learning. Synced from{' '}
          <a
            href="https://github.com/truthixify/learning-journal"
            target="_blank"
            rel="noreferrer"
            className="text-accent decoration-accent/30 hover:decoration-accent underline underline-offset-4"
          >
            learning-journal
          </a>
          {lastSync && (
            <>
              {' '}
              · last entry{' '}
              <span className="text-foreground/80 font-mono text-xs">{fmtDate(lastSync)}</span>
            </>
          )}
          .
        </p>
        {fetchError && (
          <p className="text-muted-foreground mt-2 font-mono text-[0.7rem] tracking-wider uppercase">
            GitHub sync unavailable · showing cached entries
          </p>
        )}
      </header>

      <div className="mt-10">
        <JournalHeatmap journals={journals} />
      </div>

      <div className="mt-14 space-y-14">
        {sorted.length === 0 && (
          <p className="text-muted-foreground font-mono text-sm">
            No entries synced yet. Check back after the next daily sync.
          </p>
        )}
        {Object.entries(groups).map(([month, entries]) => (
          <section key={month}>
            <h2 className="text-muted-foreground border-border border-b pb-3 font-mono text-xs tracking-[0.18em] uppercase">
              {month}
            </h2>
            <ul className="divide-border/60 mt-3 divide-y">
              {entries.map((j) => {
                const summary = j.sections['What I Learned']?.[0] ?? j.goal
                return (
                  <li key={j.date}>
                    <Link
                      href={`/journals/${j.date}`}
                      className="group grid gap-2 py-5 sm:grid-cols-[8rem_12rem_1fr] sm:gap-6"
                    >
                      <span className="text-muted-foreground self-start font-mono text-xs tracking-wider uppercase sm:pt-1">
                        {fmtDate(j.date)}
                      </span>
                      <span className="text-rail self-start truncate font-mono text-xs sm:pt-1">
                        {j.phase}
                      </span>
                      <div>
                        <p className="text-foreground/90 group-hover:text-accent leading-relaxed transition-colors">
                          {summary}
                        </p>
                        {j.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {j.tags.map((t) => (
                              <Link
                                key={t}
                                href={`/tags/${t}`}
                                className="text-muted-foreground hover:text-accent font-mono text-[0.65rem] tracking-wider uppercase"
                              >
                                #{t}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
