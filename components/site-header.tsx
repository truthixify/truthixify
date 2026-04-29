'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Monitor, Search, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { SearchPalette, useSearchHotkey } from '@/components/search-palette'
import type { Journal, Project } from '@/lib/types'

const nav = [
  { href: '/', label: 'Index', exact: true },
  { href: '/series', label: 'Series' },
  { href: '/articles', label: 'Articles' },
  { href: '/journals', label: 'Journals' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
]

type SearchArticle = {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  series?: string
  seriesTitle?: string
}

type SearchSeries = {
  slug: string
  title: string
  summary: string
}

export function SiteHeader({
  articles,
  seriesList,
  journals,
  projects,
}: {
  articles: SearchArticle[]
  seriesList: SearchSeries[]
  journals: Journal[]
  projects: Project[]
}) {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  useSearchHotkey(() => setSearchOpen(true))

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor
  const themeLabel = `Theme: ${theme} (click to cycle)`

  return (
    <>
      <a
        href="#main"
        className="focus:bg-background focus:border-border sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:border focus:px-3 focus:py-1.5"
      >
        Skip to content
      </a>
      <header className="border-border/60 border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
          <Link href="/" className="shrink-0 font-serif text-xl tracking-tight">
            truthxify
          </Link>
          <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
            <div className="hidden items-center gap-1 sm:flex">
              {nav.map((n) => {
                const isActive = n.exact ? pathname === n.href : pathname.startsWith(n.href)
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      'rounded-sm px-2 py-1 whitespace-nowrap transition-colors',
                      'text-muted-foreground hover:text-foreground',
                      isActive &&
                        'text-foreground decoration-accent underline decoration-2 underline-offset-[6px]'
                    )}
                  >
                    {n.label}
                  </Link>
                )
              })}
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (⌘K)"
              title="Search (⌘K)"
              className="hover:bg-muted text-muted-foreground hover:text-foreground ml-1 rounded-sm p-2 transition-colors sm:ml-2"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={cycleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-sm p-2 transition-colors"
            >
              <ThemeIcon className="h-4 w-4" />
            </button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-sm p-2 transition-colors sm:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="font-serif text-xl">Menu</SheetTitle>
                <nav className="mt-8 flex flex-col gap-1 text-base">
                  {nav.map((n) => {
                    const isActive = n.exact ? pathname === n.href : pathname.startsWith(n.href)
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'rounded-sm px-2 py-2 transition-colors',
                          'text-muted-foreground hover:text-foreground hover:bg-muted',
                          isActive && 'text-foreground bg-muted'
                        )}
                      >
                        {n.label}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </header>

      <SearchPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        articles={articles}
        series={seriesList}
        journals={journals}
        projects={projects}
      />
    </>
  )
}
