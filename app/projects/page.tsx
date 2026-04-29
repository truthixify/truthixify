import { ExternalLink } from 'lucide-react'
import projectsData from '@/data/projectsData'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects by truthxify — ZK, Polkadot, Starknet, and more.',
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-2xl">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          Projects
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          Things I&apos;ve built
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          A small selection. Most are open source.
        </p>
      </header>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2">
        {projectsData.map((p) => (
          <li key={p.slug} className="border-border bg-card flex flex-col rounded-md border p-6">
            <h2 className="font-serif text-2xl">{p.name}</h2>
            <p className="text-muted-foreground mt-2 flex-1 leading-relaxed">{p.tagline}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-muted-foreground border-border rounded-sm border px-1.5 py-0.5 font-mono text-[0.65rem] tracking-wider uppercase"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 text-sm">
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent inline-flex items-center gap-1 hover:underline"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {p.repo && (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent inline-flex items-center gap-1 hover:underline"
                  >
                    Repo <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
