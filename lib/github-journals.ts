import type { Journal, JournalSection } from './types'

const REPO = 'truthixify/learning-journal'
const BRANCH = 'main'
const DIR = 'journals'

const KNOWN_SECTIONS: JournalSection[] = [
  'What I Did',
  'What I Learned',
  'Bugs & Blockers',
  'Concepts That Need More Time',
  'Tomorrow',
  'Wins',
  'Notes',
]

type GhFile = { name: string; type: 'file' | 'dir'; download_url: string | null }

const isoFromName = (name: string): string | null => {
  const m = name.match(/^(\d{4})[_-](\d{2})[_-](\d{2})\.md$/i)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}`
}

const stripBullet = (line: string) => line.replace(/^\s*-\s?/, '').trimEnd()

const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`

const cleanWikilinks = (s: string) => s.replace(/\[\[(.+?)\]\]/g, '$1').trim()

const resolveAssetPaths = (s: string) =>
  s.replace(
    /(!?)\[([^\]]*)\]\((\.\.\/)?(assets\/[^)]+)\)/g,
    (_match, bang, text, _prefix, path) => `${bang}[${text}](${RAW_BASE}/${path})`
  )

const phaseAlias = (raw: string): string => {
  const cleaned = cleanWikilinks(raw).trim()
  return cleaned.replace(/\s-\s/g, ' — ')
}

export const parseJournalMarkdown = (date: string, md: string): Journal | null => {
  const lines = md.split(/\r?\n/)
  let phase = ''
  let goal = ''
  const sections: Partial<Record<JournalSection, string[]>> = {}
  let currentSection: JournalSection | null = null

  for (const rawLine of lines) {
    const line = stripBullet(rawLine)
    if (!line) continue
    if (/^---+$/.test(line)) continue

    const h = line.match(/^#{1,6}\s+(.+?)\s*$/)
    if (h) {
      const heading = h[1].trim()
      const matched = KNOWN_SECTIONS.find((s) => s.toLowerCase() === heading.toLowerCase())
      if (matched) {
        currentSection = matched
        sections[matched] ??= []
        continue
      }
      currentSection = null
      continue
    }

    const phaseMatch = line.match(/^\*\*Phase:\*\*\s*(.+)$/i)
    if (phaseMatch) {
      phase = phaseAlias(phaseMatch[1])
      continue
    }
    const goalMatch = line.match(/^\*\*Goal(?:\s+for\s+today)?:\*\*\s*(.+)$/i)
    if (goalMatch) {
      goal = cleanWikilinks(goalMatch[1])
      continue
    }

    if (currentSection) {
      const text = resolveAssetPaths(cleanWikilinks(line))
      if (!text || text === '---') continue
      sections[currentSection]!.push(text)
    }
  }

  for (const key of Object.keys(sections) as JournalSection[]) {
    if (!sections[key] || sections[key]!.length === 0) delete sections[key]
  }

  if (!phase && !goal && Object.keys(sections).length === 0) return null

  const tags: string[] = []
  const phaseLower = phase.toLowerCase()
  if (phaseLower.includes('python')) tags.push('python')
  if (phaseLower.includes('math')) tags.push('math')
  if (phaseLower.includes('ml') || phaseLower.includes('machine learning')) tags.push('ml')
  if (phaseLower.includes('deep')) tags.push('deep-learning')

  return {
    date,
    phase: phase || 'Journal',
    goal: goal || '',
    tags,
    sections,
  }
}

export const fetchGithubJournals = async (): Promise<Journal[]> => {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  const listUrl = `https://api.github.com/repos/${REPO}/contents/${DIR}?ref=${BRANCH}`
  const res = await fetch(listUrl, {
    headers,
    next: { revalidate: 86400, tags: ['journals'] },
  })
  if (!res.ok) throw new Error(`GitHub list failed: ${res.status}`)
  const files = (await res.json()) as GhFile[]

  const targets = files
    .filter((f) => f.type === 'file' && f.name.toLowerCase().endsWith('.md'))
    .map((f) => ({ date: isoFromName(f.name), url: f.download_url }))
    .filter((t): t is { date: string; url: string } => Boolean(t.date && t.url))

  const entries = await Promise.all(
    targets.map(async ({ date, url }) => {
      try {
        const r = await fetch(url, {
          headers,
          next: { revalidate: 86400, tags: ['journals'] },
        })
        if (!r.ok) return null
        const md = await r.text()
        return parseJournalMarkdown(date, md)
      } catch {
        return null
      }
    })
  )

  return entries
    .filter((j): j is Journal => Boolean(j))
    .sort((a, b) => b.date.localeCompare(a.date))
}
