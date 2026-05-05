'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import type { Journal } from '@/lib/types'

export const JournalHeatmap = ({ journals }: { journals: Journal[] }) => {
  const { weeks, total, lastDate } = useMemo(() => {
    const set = new Set(journals.map((j) => j.date))
    const days: { date: string; has: boolean }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalDays = 364
    const start = new Date(today)
    start.setDate(start.getDate() - (totalDays - 1))
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      days.push({ date: iso, has: set.has(iso) })
    }
    const startDay = new Date(days[0].date + 'T00:00:00').getDay()
    const padded: ({ date: string; has: boolean } | null)[] = [
      ...Array.from({ length: startDay }, () => null),
      ...days,
    ]
    const weeks: ({ date: string; has: boolean } | null)[][] = []
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))
    return {
      weeks,
      total: journals.length,
      lastDate: journals.length
        ? [...journals].sort((a, b) => b.date.localeCompare(a.date))[0].date
        : null,
    }
  }, [journals])

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [weeks])

  return (
    <div className="border-border bg-card rounded-md border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          Last 52 weeks
        </p>
        <p className="text-muted-foreground font-mono text-xs">
          {total} {total === 1 ? 'entry' : 'entries'}
          {lastDate && ` · last ${lastDate}`}
        </p>
      </div>
      <div ref={scrollRef} className="mt-4 overflow-x-auto pb-1">
        <div
          className="grid min-w-full gap-1"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(10px, 1fr))` }}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((d, di) => {
                if (!d) return <span key={di} className="aspect-square w-full" aria-hidden />
                const cls = d.has
                  ? 'bg-accent hover:ring-1 hover:ring-accent'
                  : 'bg-muted hover:bg-muted-foreground/20'
                const cell = (
                  <span
                    className={`block aspect-square w-full rounded-[2px] ${cls}`}
                    title={`${d.date}${d.has ? ' · entry' : ''}`}
                  />
                )
                return d.has ? (
                  <Link
                    key={di}
                    href={`/journals/${d.date}`}
                    aria-label={`Journal ${d.date}`}
                    className="block w-full"
                  >
                    {cell}
                  </Link>
                ) : (
                  <span key={di} className="block w-full">
                    {cell}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="text-muted-foreground mt-3 flex items-center gap-2 font-mono text-[10px]">
        <span>less</span>
        <span className="bg-muted h-3 w-3 rounded-[2px]" />
        <span className="bg-accent/40 h-3 w-3 rounded-[2px]" />
        <span className="bg-accent/70 h-3 w-3 rounded-[2px]" />
        <span className="bg-accent h-3 w-3 rounded-[2px]" />
        <span>more</span>
      </div>
    </div>
  )
}
