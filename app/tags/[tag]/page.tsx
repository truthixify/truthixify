import Link from 'next/link'
import { getArticles, getSeriesTitle } from '@/lib/content'
import { fetchGithubJournals } from '@/lib/github-journals'
import { fmtDate } from '@/lib/date'
import { Metadata } from 'next'
import tagData from 'app/tag-data.json'

export async function generateStaticParams() {
  const tagCounts = tagData as Record<string, number>
  return Object.keys(tagCounts).map((tag) => ({ tag: encodeURI(tag) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decoded = decodeURI(tag)
  return {
    title: `#${decoded}`,
    description: `Articles and journal entries tagged #${decoded}.`,
  }
}

export default async function TagDetailPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params
  const tag = decodeURI(rawTag)
  const t = tag.toLowerCase()

  const articles = getArticles()
  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // GitHub unavailable
  }

  const matchingArticles = articles.filter((a) => a.tags.map((x) => x.toLowerCase()).includes(t))
  const matchingJournals = journals.filter((j) => j.tags.map((x) => x.toLowerCase()).includes(t))

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
        <Link href="/tags" className="hover:text-accent">
          All tags
        </Link>{' '}
        · Tag
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">#{tag}</h1>

      <section className="mt-12">
        <h2 className="text-muted-foreground border-border border-b pb-3 font-mono text-xs tracking-[0.18em] uppercase">
          Articles ({matchingArticles.length})
        </h2>
        {matchingArticles.length === 0 ? (
          <p className="text-muted-foreground mt-4">No articles tagged with this yet.</p>
        ) : (
          <ul className="divide-border/60 mt-3 divide-y">
            {matchingArticles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
                >
                  <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase sm:pt-1.5">
                    {fmtDate(a.date)}
                  </span>
                  <div>
                    <h3 className="group-hover:text-accent font-serif text-lg">{a.title}</h3>
                    {a.series && (
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        From series · {getSeriesTitle(a.series)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-muted-foreground border-border border-b pb-3 font-mono text-xs tracking-[0.18em] uppercase">
          Journals ({matchingJournals.length})
        </h2>
        {matchingJournals.length === 0 ? (
          <p className="text-muted-foreground mt-4">No journal entries tagged with this yet.</p>
        ) : (
          <ul className="divide-border/60 mt-3 divide-y">
            {matchingJournals.map((j) => (
              <li key={j.date}>
                <Link
                  href={`/journals/${j.date}`}
                  className="group grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
                >
                  <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase sm:pt-1.5">
                    {fmtDate(j.date)}
                  </span>
                  <p className="text-foreground/90 group-hover:text-accent">
                    {j.sections['What I Learned']?.[0] ?? j.goal}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
