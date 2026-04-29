import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-border/60 mt-24 border-t">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="max-w-md">
          <p className="font-serif text-lg">Stay in the loop</p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            New articles, series updates, and the daily journal — delivered straight to your reader.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/rss.xml"
              className="border-border hover:border-accent/60 hover:text-accent inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-colors"
            >
              <span className="font-mono text-xs tracking-wider uppercase">RSS</span>
              <span className="text-muted-foreground">/rss.xml</span>
            </a>
            <a
              href="https://x.com/truthixifi"
              target="_blank"
              rel="noreferrer"
              className="border-border hover:border-accent/60 hover:text-accent inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-colors"
            >
              <span className="font-mono text-xs tracking-wider uppercase">X</span>
              <span className="text-muted-foreground">@truthixifi</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:text-right">
          <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            &copy; {new Date().getFullYear()} truthxify
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 sm:justify-end">
            <a
              href="https://github.com/truthixify"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <Link href="/tags" className="hover:text-foreground">
              Tags
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
