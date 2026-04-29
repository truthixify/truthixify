import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allBlogs } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { getArticle, getSeriesArticles, getSeries } from '@/lib/content'
import { fmtDateLong } from '@/lib/date'
import { Metadata } from 'next'

export async function generateStaticParams() {
  return allBlogs.filter((b) => !b.draft).map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) return {}
  return {
    title: a.title,
    description: a.summary,
    openGraph: {
      title: a.title,
      description: a.summary,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) notFound()

  const blog = allBlogs.find((b) => b.slug === slug)
  if (!blog) notFound()

  const s = a.series ? getSeries(a.series) : undefined
  const seriesParts = a.series ? getSeriesArticles(a.series) : []
  const idx = seriesParts.findIndex((p) => p.slug === a.slug)
  const prev = idx > 0 ? seriesParts[idx - 1] : undefined
  const next = idx >= 0 && idx < seriesParts.length - 1 ? seriesParts[idx + 1] : undefined

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/articles"
        className="text-muted-foreground hover:text-accent font-mono text-xs tracking-wider uppercase"
      >
        &larr; Articles
      </Link>

      <header className="mt-6">
        {s && (
          <Link
            href={`/series/${s.slug}`}
            className="text-accent font-mono text-xs tracking-wider uppercase hover:underline"
          >
            {s.title}
            {a.part && (
              <span className="text-muted-foreground">
                {' '}
                · Part {String(a.part).padStart(2, '0')}
              </span>
            )}
          </Link>
        )}
        <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
          {a.title}
        </h1>
        <div className="text-muted-foreground mt-5 flex items-center gap-4 font-mono text-xs">
          <span>{fmtDateLong(a.date)}</span>
          <span>·</span>
          <span>{a.readMinutes} min read</span>
        </div>
      </header>

      <div className="prose-reading mt-10">
        <MDXLayoutRenderer code={blog.body.code} components={components} />
      </div>

      {a.tags.length > 0 && (
        <div className="border-border mt-12 flex flex-wrap gap-2 border-t pt-6">
          {a.tags.map((t) => (
            <Link
              key={t}
              href={`/tags/${t.toLowerCase()}`}
              className="text-muted-foreground border-border hover:text-accent hover:border-accent/60 rounded-sm border px-2 py-1 font-mono text-xs tracking-wider uppercase"
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {(prev || next) && (
        <nav className="border-border mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/articles/${prev.slug}`}
              className="group border-border hover:border-accent/60 block rounded-md border p-4"
            >
              <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                &larr; Previous
              </p>
              <p className="group-hover:text-accent mt-2 font-serif text-base transition-colors">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/articles/${next.slug}`}
              className="group border-border hover:border-accent/60 block rounded-md border p-4 sm:text-right"
            >
              <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                Next &rarr;
              </p>
              <p className="group-hover:text-accent mt-2 font-serif text-base transition-colors">
                {next.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: a.title,
            datePublished: a.date,
            description: a.summary,
            url: `https://truthixify.vercel.app/articles/${a.slug}`,
          }),
        }}
      />
    </article>
  )
}
