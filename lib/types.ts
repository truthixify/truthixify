export type Status = 'in-progress' | 'completed' | 'planned'

export type Series = {
  slug: string
  title: string
  summary: string
  status: Status
  articleSlugs: string[]
}

export type JournalSection =
  | 'What I Did'
  | 'What I Learned'
  | 'Bugs & Blockers'
  | 'Concepts That Need More Time'
  | 'Tomorrow'
  | 'Wins'

export type Journal = {
  date: string
  phase: string
  goal: string
  tags: string[]
  sections: Partial<Record<JournalSection, string[]>>
}

export type Project = {
  slug: string
  name: string
  tagline: string
  href?: string
  repo?: string
  tags: string[]
}
