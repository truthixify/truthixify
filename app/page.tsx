import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getArticles, series, getSeriesTitle } from '@/lib/content'
import { StatusPill } from '@/components/status-pill'
import { fmtDate } from '@/lib/date'
import { fetchGithubJournals } from '@/lib/github-journals'

function SectionHeader({ title, link }: { title: string; link: { href: string; label: string } }) {
  return (
    <div className="border-border flex items-end justify-between border-b pb-3">
      <h2 className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
        {title}
      </h2>
      <Link
        href={link.href}
        className="text-muted-foreground hover:text-accent flex items-center gap-1 text-sm"
      >
        {link.label} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const allArticles = getArticles()
  const featured = series.filter((s) => s.status !== 'planned').slice(0, 2)
  const lead = allArticles[0]
  const rest = allArticles.slice(1, 5)

  let journals: Awaited<ReturnType<typeof fetchGithubJournals>> = []
  try {
    journals = await fetchGithubJournals()
  } catch {
    // GitHub unavailable
  }
  const recentJournals = journals.slice(0, 5)

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="animate-fade-up max-w-3xl">
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          Writing on <em className="font-normal italic">AI</em>,{' '}
          <em className="font-normal italic">cryptography</em>,{' '}
          <em className="font-normal italic">distributed systems</em>, and whatever else has my
          attention.
        </h1>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          Articles, series, and a daily journal by truthxify — on what I&apos;m building, exploring,
          teaching, or just thinking about out loud.
        </p>
      </section>

      {/* Featured Series */}
      <section className="mt-20">
        <SectionHeader
          title="Featured Series"
          link={{ href: '/series', label: 'View all series' }}
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {featured.map((s) => (
            <Link
              key={s.slug}
              href={`/series/${s.slug}`}
              className="group border-border hover:border-accent/60 bg-card block rounded-md border p-6 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-mono text-xs">
                  {s.articleSlugs.length} {s.articleSlugs.length === 1 ? 'Part' : 'Parts'}
                </span>
                <StatusPill status={s.status} />
              </div>
              <h3 className="group-hover:text-accent mt-4 font-serif text-2xl transition-colors">
                {s.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-[0.95rem] leading-relaxed">
                {s.summary}
              </p>
              <span className="text-accent mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                Start reading{' '}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="mt-20">
        <SectionHeader title="Latest Articles" link={{ href: '/articles', label: 'Archive' }} />

        {lead && (
          <Link
            href={`/articles/${lead.slug}`}
            className="group border-border mt-6 grid gap-6 border-b pb-10 md:grid-cols-[1.1fr_1fr] md:gap-10"
          >
            {lead.cover ? (
              <div className="bg-muted border-border relative aspect-[16/10] overflow-hidden rounded-md border">
                <Image
                  src={lead.cover}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ) : (
              <div className="from-accent/20 to-muted border-border aspect-[16/10] rounded-md border bg-gradient-to-br" />
            )}
            <div className="flex flex-col justify-center">
              <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                {fmtDate(lead.date)} · {lead.readMinutes} min
              </p>
              <h3 className="group-hover:text-accent mt-3 font-serif text-2xl leading-tight transition-colors sm:text-3xl">
                {lead.title}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">{lead.summary}</p>
              {lead.series && (
                <p className="text-muted-foreground mt-3 font-mono text-xs">
                  <span className="text-rail">From series · </span>
                  <span className="text-foreground/80">{getSeriesTitle(lead.series)}</span>
                </p>
              )}
            </div>
          </Link>
        )}

        <ul className="divide-border/60 mt-2 divide-y">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="group grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
              >
                <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase sm:pt-1.5">
                  {fmtDate(a.date)}
                </span>
                <div>
                  <h3 className="group-hover:text-accent font-serif text-xl transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-[0.95rem] leading-relaxed">
                    {a.summary}
                  </p>
                  {a.series && (
                    <p className="text-muted-foreground mt-2 font-mono text-xs">
                      <span className="text-rail">From series · </span>
                      <span className="text-foreground/80">{getSeriesTitle(a.series)}</span>
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Journals */}
      {recentJournals.length > 0 && (
        <section className="mt-20">
          <SectionHeader
            title="From the Journal"
            link={{ href: '/journals', label: 'Open journal' }}
          />
          <ul className="border-border divide-border bg-card mt-6 divide-y rounded-md border">
            {recentJournals.map((j) => {
              const firstLearn = j.sections['What I Learned']?.[0]
              return (
                <li key={j.date}>
                  <Link
                    href={`/journals/${j.date}`}
                    className="group hover:bg-muted/40 grid grid-cols-[7rem_1fr] gap-3 px-5 py-4 transition-colors sm:grid-cols-[8rem_12rem_1fr] sm:gap-6"
                  >
                    <span className="text-muted-foreground self-center font-mono text-xs">
                      {fmtDate(j.date)}
                    </span>
                    <span className="text-rail hidden self-center truncate font-mono text-xs sm:block">
                      {j.phase}
                    </span>
                    <span className="text-foreground/90 group-hover:text-accent line-clamp-1 text-sm transition-colors">
                      {firstLearn ?? j.goal}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
