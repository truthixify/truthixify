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
  // Track the current top-level Logseq bullet block (raw lines, indent preserved).
  let blockLines: string[] = []
  let baseIndent: number | null = null

  const detectBullet = (line: string): { indent: number; content: string } | null => {
    const expanded = line.replace(/\t/g, '  ')
    const m = expanded.match(/^(\s*)-\s?(.*)$/)
    if (!m) return null
    return { indent: m[1].length, content: m[2].trimEnd() }
  }

  // Convert the collected block lines (raw, with bullets/indent) into clean markdown.
  // Strips the bullet prefix from the first line and the continuation indent from the rest,
  // then applies wikilink + asset-path transforms.
  const flushItem = () => {
    if (!currentSection || blockLines.length === 0) {
      blockLines = []
      return
    }
    const indent = baseIndent ?? 0
    const contIndent = indent + 2
    const processed: string[] = []
    for (let i = 0; i < blockLines.length; i++) {
      const expanded = blockLines[i].replace(/\t/g, '  ')
      let line: string
      if (i === 0) {
        // Strip the leading "<indent spaces>- " from the first line
        line = expanded.replace(new RegExp(`^\\s{0,${indent}}-\\s?`), '')
      } else {
        // Strip up to contIndent leading spaces from continuation lines
        line = expanded.replace(new RegExp(`^\\s{0,${contIndent}}`), '')
      }
      processed.push(line.trimEnd())
    }
    let md = processed.join('\n')
    md = cleanWikilinks(md)
    md = resolveAssetPaths(md)
    // Normalize $$...$$ math blocks: ensure $$ markers are on their own lines
    // so remark-math recognizes them as block (display) math, not inline.
    md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_match, inner: string) => {
      return '\n\n$$\n' + inner.trim() + '\n$$\n\n'
    })
    md = md.replace(/\n{3,}/g, '\n\n').trim()
    if (md) sections[currentSection]!.push(md)
    blockLines = []
  }

  for (const rawLine of lines) {
    const stripped = stripBullet(rawLine)

    // Headings reset the section (always flush)
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

    // Skip Logseq-specific metadata lines
    if (/^\s*(collapsed|background-color|id)::/.test(rawLine)) continue

    // Top-level `---` separator (at the section's base bullet indent, not continuation)
    const expanded = rawLine.replace(/\t/g, '  ')
    if (
      /^---+$/.test(stripped) &&
      (baseIndent === null ||
        expanded.search(/\S/) === baseIndent ||
        expanded.search(/\S/) === -1 ||
        expanded.trim() === '---')
    ) {
      // Only treat as separator if it's at indent <= continuation
      const ind = expanded.search(/\S/)
      if (ind === -1 || baseIndent === null || ind <= (baseIndent ?? 0)) {
        flushItem()
        continue
      }
    }

    const bullet = detectBullet(rawLine)
    if (bullet) {
      if (baseIndent === null || bullet.indent === baseIndent) {
        // New top-level item
        flushItem()
        baseIndent = bullet.indent
        blockLines.push(rawLine)
      } else {
        // Nested or deeper bullet — continuation of current block
        blockLines.push(rawLine)
      }
      continue
    }

    // Non-bullet line — append to current block (if any)
    if (blockLines.length > 0) blockLines.push(rawLine)
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
