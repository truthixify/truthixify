'use client'

import { cn } from '@/lib/utils'
import type { Status } from '@/lib/types'

const map: Record<Status, { label: string; cls: string }> = {
  'in-progress': {
    label: 'In Progress',
    cls: 'text-status-progress border-status-progress/40 bg-status-progress/10',
  },
  completed: {
    label: 'Completed',
    cls: 'text-status-complete border-status-complete/40 bg-status-complete/10',
  },
  planned: {
    label: 'Planned',
    cls: 'text-status-planned border-status-planned/40 bg-status-planned/10',
  },
}

export const StatusPill = ({ status, className }: { status: Status; className?: string }) => {
  const m = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.65rem] tracking-wider uppercase',
        m.cls,
        className
      )}
    >
      {m.label}
    </span>
  )
}
