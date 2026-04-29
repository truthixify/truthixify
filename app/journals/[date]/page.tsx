import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchGithubJournals } from '@/lib/github-journals'
import { fmtDateLong } from '@/lib/date'
import type { JournalSection } from '@/lib/types'
import { Metadata } from 'next'

const sectionOrder: JournalSection[] = [
  'What I Did',
  'What I Learned',
  'Bugs & Blockers',
  'Concepts That Need More Time',
  'Tomorrow',
  'Wins',
]

export async function generateStaticParams() {
  try {
    const journals = await fetchGithubJournals()
    return journals.map((j) => ({ date: j.date }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>
}): Promise<Metadata> {
  const { date } = await params
  return {
    title: `Journal · ${date}`,
    description: `Daily learning log for ${date}`,
  }
}

export default async function JournalDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    notFound()
  }

  const j = journals.find((x) => x.date === date)
  if (!j) notFound()

  const sorted = [...journals].sort((a, b) => b.date.localeCompare(a.date))
  const idx = sorted.findIndex((x) => x.date === j.date)
  const newer = idx > 0 ? sorted[idx - 1] : undefined
  const older = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/journals"
        className="text-muted-foreground hover:text-accent font-mono text-xs tracking-wider uppercase"
      >
        &larr; Journal
      </Link>

      <header className="mt-6">
        <p className="text-accent font-mono text-xs tracking-wider uppercase">{j.phase}</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          {fmtDateLong(j.date)}
        </h1>
        {j.goal && <p className="text-muted-foreground mt-4 font-serif text-lg italic">{j.goal}</p>}
      </header>

      <div className="mt-12 space-y-10">
        {sectionOrder.map((key) => {
          const items = j.sections[key]
          if (!items || items.length === 0) return null
          return (
            <section key={key}>
              <h2 className="text-muted-foreground border-border border-b pb-2 font-mono text-xs tracking-[0.18em] uppercase">
                {key}
              </h2>
              <ul className="prose-reading mt-4 space-y-2.5">
                {items.map((item, i) => (
                  <li key={i} className="relative pl-5">
                    <span className="bg-accent absolute top-[0.7em] left-0 h-px w-2" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {j.tags.length > 0 && (
        <div className="border-border mt-12 flex flex-wrap gap-2 border-t pt-6">
          {j.tags.map((t) => (
            <Link
              key={t}
              href={`/tags/${t}`}
              className="text-muted-foreground border-border hover:text-accent hover:border-accent/60 rounded-sm border px-2 py-1 font-mono text-xs tracking-wider uppercase"
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {(newer || older) && (
        <nav className="border-border mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {older ? (
            <Link
              href={`/journals/${older.date}`}
              className="group border-border hover:border-accent/60 block rounded-md border p-4"
            >
              <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                &larr; Older
              </p>
              <p className="group-hover:text-accent mt-2 font-serif text-base">
                {fmtDateLong(older.date)}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link
              href={`/journals/${newer.date}`}
              className="group border-border hover:border-accent/60 block rounded-md border p-4 sm:text-right"
            >
              <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                Newer &rarr;
              </p>
              <p className="group-hover:text-accent mt-2 font-serif text-base">
                {fmtDateLong(newer.date)}
              </p>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  )
}
