import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden px-6 py-32">
      <span
        aria-hidden
        className="text-muted-foreground/10 pointer-events-none absolute -top-6 -right-4 font-serif text-[10rem] leading-none italic select-none sm:right-0 sm:text-[14rem]"
      >
        404
      </span>

      <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
        404 · Lost the plot
      </p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">
        Nothing here<span className="text-accent">.</span>
      </h1>
      <p className="text-muted-foreground mt-5 max-w-md leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist — or doesn&apos;t exist <em>yet</em>.
      </p>

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        <Link
          href="/"
          className="group border-border hover:border-accent/60 block rounded-md border p-4 transition-colors"
        >
          <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            Start here
          </p>
          <p className="group-hover:text-accent mt-2 font-serif text-base transition-colors">
            The index
          </p>
        </Link>
        <Link
          href="/articles"
          className="group border-border hover:border-accent/60 block rounded-md border p-4 transition-colors"
        >
          <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">Read</p>
          <p className="group-hover:text-accent mt-2 font-serif text-base transition-colors">
            Latest articles
          </p>
        </Link>
        <Link
          href="/journals"
          className="group border-border hover:border-accent/60 block rounded-md border p-4 transition-colors"
        >
          <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            Daily log
          </p>
          <p className="group-hover:text-accent mt-2 font-serif text-base transition-colors">
            Open the journal
          </p>
        </Link>
      </div>

      <div className="text-muted-foreground mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs">
        <span>
          Tip: hit <kbd className="border-border rounded-sm border px-1.5 py-0.5">⌘K</kbd> to
          search.
        </span>
      </div>
    </div>
  )
}
