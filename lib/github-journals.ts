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

// Parses a raw line into its indent depth and bullet content.
// Tabs are treated as 2 spaces. Returns null if the line isn't a bullet.
const parseBulletLine = (rawLine: string): { indent: number; content: string } | null => {
  const expanded = rawLine.replace(/\t/g, '  ')
  const m = expanded.match(/^(\s*)-\s?(.*)$/)
  if (!m) return null
  return { indent: m[1].length, content: m[2].trimEnd() }
}

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
  let mathBuffer: string[] | null = null
  let codeBuffer: string[] | null = null
  // Track current top-level item (and its nested content) within a section
  let itemBuffer: string[] = []
  let baseIndent: number | null = null

  const flushItem = () => {
    if (currentSection && itemBuffer.length > 0) {
      sections[currentSection]!.push(itemBuffer.join('\n'))
    }
    itemBuffer = []
  }

  const pushToItem = (s: string) => {
    if (!currentSection) return
    itemBuffer.push(s)
  }

  // Strip Logseq bullets from inside code/math blocks (preserves indentation).
  const stripBlockBullet = (line: string) => line.replace(/^(\s*)-\s/, '$1')

  for (const rawLine of lines) {
    // Multi-line code fence: accumulate cleaned lines until closing ```
    if (codeBuffer !== null) {
      const cleaned = stripBlockBullet(rawLine)
      codeBuffer.push(cleaned)
      if (/^\s*```\s*$/.test(cleaned)) {
        flushItem()
        if (currentSection) sections[currentSection]!.push(codeBuffer.join('\n'))
        codeBuffer = null
      }
      continue
    }

    // Multi-line math block: accumulate cleaned lines until closing $$
    if (mathBuffer !== null) {
      const cleaned = stripBlockBullet(rawLine)
      mathBuffer.push(cleaned)
      if (cleaned.includes('$$')) {
        flushItem()
        if (currentSection) {
          // Normalize so $$ markers are on their own lines for remark-math.
          // Note: in replacement strings, $$ means a literal $, so use a callback.
          let joined = mathBuffer.join('\n')
          joined = joined.replace(/^\$\$/, () => '$$\n').replace(/\$\$$/, () => '\n$$')
          sections[currentSection]!.push(joined)
        }
        mathBuffer = null
      }
      continue
    }

    const stripped = stripBullet(rawLine)

    // Empty line: flush the current item (separator between bullets)
    if (!stripped) {
      flushItem()
      continue
    }

    if (/^---+$/.test(stripped)) {
      flushItem()
      continue
    }

    // Detect start of code fence (```lang or ```)
    if (/^\s*```/.test(stripped)) {
      flushItem()
      codeBuffer = [stripped]
      continue
    }

    // Detect math blocks. dollarCount === 2 means single-line $$...$$,
    // dollarCount === 1 starts a multi-line block until next $$.
    const dollarCount = (stripped.match(/\$\$/g) || []).length
    if (dollarCount === 2 && /^\$\$.*\$\$$/.test(stripped)) {
      flushItem()
      // Reformat single-line $$...$$ to block form so remark-math treats it as block
      const inner = stripped.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '')
      if (currentSection && inner) {
        sections[currentSection]!.push('$$\n' + inner + '\n$$')
      }
      continue
    }
    if (dollarCount === 1) {
      flushItem()
      mathBuffer = [stripped]
      continue
    }

    // Headings reset the section
    const h = stripped.match(/^#{1,6}\s+(.+?)\s*$/)
    if (h) {
      flushItem()
      const heading = h[1].trim()
      const matched = KNOWN_SECTIONS.find((s) => s.toLowerCase() === heading.toLowerCase())
      if (matched) {
        currentSection = matched
        baseIndent = null
        sections[matched] ??= []
        continue
      }
      currentSection = null
      baseIndent = null
      continue
    }

    const phaseMatch = stripped.match(/^\*\*Phase:\*\*\s*(.+)$/i)
    if (phaseMatch) {
      flushItem()
      phase = phaseAlias(phaseMatch[1])
      continue
    }
    const goalMatch = stripped.match(/^\*\*Goal(?:\s+for\s+today)?:\*\*\s*(.+)$/i)
    if (goalMatch) {
      flushItem()
      goal = cleanWikilinks(goalMatch[1])
      continue
    }

    if (!currentSection) continue

    // Determine if this line is a bullet, and at what indent
    const bullet = parseBulletLine(rawLine)
    if (bullet) {
      if (baseIndent === null) baseIndent = bullet.indent

      if (bullet.indent <= baseIndent) {
        // New top-level item
        flushItem()
        const text = resolveAssetPaths(cleanWikilinks(bullet.content))
        if (text && text !== '---') pushToItem(text)
      } else {
        // Nested item: preserve relative indentation as markdown sublist
        const depth = Math.max(1, Math.floor((bullet.indent - baseIndent) / 2))
        const indent = '  '.repeat(depth)
        const text = resolveAssetPaths(cleanWikilinks(bullet.content))
        if (text && text !== '---') pushToItem(`${indent}- ${text}`)
      }
    } else {
      // Non-bullet line (e.g., continuation of an item) — append with indentation
      const text = resolveAssetPaths(cleanWikilinks(stripped))
      if (text && text !== '---') pushToItem(`  ${text}`)
    }
  }
  flushItem()

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
