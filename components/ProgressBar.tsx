'use client'

import React from 'react'
import { useEffect, useState, RefObject } from 'react'

export function useElementScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const totalHeight = el.offsetHeight - window.innerHeight
      const scrolled = -rect.top

      if (totalHeight > 0) {
        const percentage = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100))
        setProgress(percentage)
      } else {
        setProgress(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ref])

  return progress
}

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className="bg-primary-400 fixed top-0 left-0 z-50 h-1 w-full transition-transform duration-100 ease-out will-change-transform"
      style={{ transform: `translateX(${progress - 100}%)` }}
    />
  )
}
