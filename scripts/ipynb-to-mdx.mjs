#!/usr/bin/env node
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const NOTEBOOK_DIR = path.join(ROOT, 'data', 'blog', 'notebooks')
const OUT_DIR = path.join(ROOT, 'data', 'blog')
const PUBLIC_COPY_DIR = path.join(ROOT, 'public', 'notebooks')

const GENERATED_MARKER = '_generatedFromNotebook'

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

function escapeTemplateLiteral(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function joinCellSource(src) {
  return Array.isArray(src) ? src.join('') : String(src ?? '')
}

function normalizeOutputs(outputs = []) {
  const out = []
  for (const o of outputs) {
    if (o.output_type === 'stream') {
      out.push({ type: 'stream', name: o.name || 'stdout', text: joinCellSource(o.text) })
    } else if (o.output_type === 'execute_result' || o.output_type === 'display_data') {
      const data = o.data || {}
      if (data['image/png']) {
        out.push({
          type: 'image',
          mime: 'image/png',
          data: joinCellSource(data['image/png']).replace(/\s+/g, ''),
        })
      } else if (data['image/jpeg']) {
        out.push({
          type: 'image',
          mime: 'image/jpeg',
          data: joinCellSource(data['image/jpeg']).replace(/\s+/g, ''),
        })
      } else if (data['image/svg+xml']) {
        out.push({ type: 'svg', svg: joinCellSource(data['image/svg+xml']) })
      } else if (data['text/html']) {
        out.push({ type: 'html', html: joinCellSource(data['text/html']) })
      } else if (data['text/plain']) {
        out.push({ type: 'text', text: joinCellSource(data['text/plain']) })
      }
    } else if (o.output_type === 'error') {
      out.push({
        type: 'error',
        name: o.ename || 'Error',
        value: o.evalue || '',
        traceback: Array.isArray(o.traceback) ? o.traceback.join('\n') : String(o.traceback || ''),
      })
    }
  }
  return out
}

function renderCell(cell) {
  if (cell.cell_type === 'markdown') {
    const text = joinCellSource(cell.source).trim()
    if (!text) return ''
    return `\n${text}\n`
  }
  if (cell.cell_type === 'code') {
    const code = joinCellSource(cell.source)
    if (!code.trim()) return ''
    const outputs = normalizeOutputs(cell.outputs || [])
    const escapedCode = escapeTemplateLiteral(code)
    const outputsJson = JSON.stringify(outputs)
    return `\n<NotebookCell language="python" code={\`${escapedCode}\`} outputs={${outputsJson}} />\n`
  }
  return ''
}

function renderCellsBlock(notebook) {
  return notebook.cells.map(renderCell).join('\n').trim()
}

function parseFrontmatterBlock(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { fm: null, body: text }
  const parsed = {}
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!mm) continue
    const key = mm[1]
    const raw = mm[2].trim()
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1).trim()
      parsed[key] = inner ? inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : []
    } else if (raw === 'true' || raw === 'false') {
      parsed[key] = raw === 'true'
    } else if (/^-?\d+(\.\d+)?$/.test(raw)) {
      parsed[key] = Number(raw)
    } else {
      parsed[key] = raw.replace(/^['"]|['"]$/g, '')
    }
  }
  return { fm: parsed, body: text.slice(m[0].length) }
}

function deriveFallbackFrontmatter(notebook, basename) {
  const metaFm = notebook.metadata?.frontmatter
  if (metaFm && typeof metaFm === 'object') return metaFm
  const firstMd = notebook.cells.find((c) => c.cell_type === 'markdown')
  if (firstMd) {
    const { fm, body } = parseFrontmatterBlock(joinCellSource(firstMd.source))
    if (fm) {
      firstMd.source = body
      return fm
    }
  }
  return {
    title: basename.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    date: new Date().toISOString().slice(0, 10),
    tags: ['notebook'],
    summary: '',
  }
}

function serializeFrontmatter(fm, extra) {
  const merged = { ...fm, ...extra }
  const lines = ['---']
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => JSON.stringify(String(x))).join(', ')}]`)
    } else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      lines.push(`${k}: '${v}'`)
    } else if (typeof v === 'boolean' || typeof v === 'number') {
      lines.push(`${k}: ${v}`)
    } else {
      lines.push(`${k}: '${String(v).replace(/'/g, "''")}'`)
    }
  }
  lines.push('---', '')
  return lines.join('\n')
}

// Process one companion .mdx. The companion's basename drives the output filename
// (and therefore the URL slug). The companion points at its notebook via `source:`
// in frontmatter, or falls back to a matching <companion-basename>.ipynb.
async function convertCompanion(companionPath) {
  const slug = path.basename(companionPath, '.mdx')
  const companionRaw = await fs.readFile(companionPath, 'utf8')
  const { fm: rawFm, body: wrapperBody } = parseFrontmatterBlock(companionRaw)
  const fm = { ...(rawFm || {}) }

  // Resolve the source notebook
  let ipynbName = fm.source
  if (ipynbName) {
    if (!ipynbName.endsWith('.ipynb')) ipynbName += '.ipynb'
    delete fm.source
  } else {
    ipynbName = `${slug}.ipynb`
  }
  const ipynbPath = path.join(NOTEBOOK_DIR, ipynbName)
  if (!(await exists(ipynbPath))) {
    console.warn(
      `[ipynb-to-mdx] SKIP ${slug}.mdx — source notebook ${ipynbName} not found in data/blog/notebooks/`
    )
    return
  }

  const notebook = JSON.parse(await fs.readFile(ipynbPath, 'utf8'))
  const cellsBlock = renderCellsBlock(notebook)

  let body
  if (wrapperBody && wrapperBody.includes('<NotebookContent />')) {
    body = wrapperBody.replace(/<NotebookContent\s*\/>/g, cellsBlock)
  } else if (wrapperBody && wrapperBody.trim().length) {
    body = `${wrapperBody.trim()}\n\n${cellsBlock}`
  } else {
    body = cellsBlock
  }

  const outPath = path.join(OUT_DIR, `${slug}.mdx`)
  if (await exists(outPath)) {
    const existing = await fs.readFile(outPath, 'utf8')
    if (!existing.includes(GENERATED_MARKER)) {
      console.warn(
        `[ipynb-to-mdx] SKIP ${slug} — data/blog/${slug}.mdx exists and was not generated. Rename one of them.`
      )
      return
    }
  }

  // Public copy uses the slug so the download URL matches the post URL.
  const publicIpynb = `${slug}.ipynb`
  const ipynbPublicPath = `/notebooks/${publicIpynb}`
  const frontmatter = serializeFrontmatter(fm, {
    notebook: ipynbPublicPath,
    [GENERATED_MARKER]: true,
  })

  await fs.writeFile(outPath, `${frontmatter}\n${body}\n`)

  await fs.mkdir(PUBLIC_COPY_DIR, { recursive: true })
  await fs.copyFile(ipynbPath, path.join(PUBLIC_COPY_DIR, publicIpynb))

  console.log(
    `[ipynb-to-mdx] notebooks/${path.basename(companionPath)} (+ ${ipynbName}) → data/blog/${slug}.mdx`
  )
}

async function convertAll() {
  if (!(await exists(NOTEBOOK_DIR))) return false
  const entries = await fs.readdir(NOTEBOOK_DIR)
  const companions = entries.filter((f) => f.endsWith('.mdx'))
  if (!companions.length) return false
  for (const f of companions) {
    try {
      await convertCompanion(path.join(NOTEBOOK_DIR, f))
    } catch (err) {
      console.error(`[ipynb-to-mdx] failed to convert ${f}:`, err)
      process.exitCode = 1
    }
  }
  return true
}

async function watch() {
  await fs.mkdir(NOTEBOOK_DIR, { recursive: true })
  await convertAll()
  console.log(`[ipynb-to-mdx] watching ${path.relative(ROOT, NOTEBOOK_DIR)}/ for changes…`)

  const { default: chokidar } = await import('chokidar')
  const watcher = chokidar.watch(NOTEBOOK_DIR, {
    ignoreInitial: true,
    depth: 0,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
  })

  let timer = null
  let pending = new Set()
  const queue = (file) => {
    if (!file.endsWith('.ipynb') && !file.endsWith('.mdx')) return
    pending.add(path.basename(file))
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const changed = [...pending]
      pending = new Set()
      console.log(`[ipynb-to-mdx] changed: ${changed.join(', ')} — regenerating`)
      await convertAll()
    }, 100)
  }

  watcher
    .on('add', queue)
    .on('change', queue)
    .on('unlink', queue)
    .on('error', (err) => console.error('[ipynb-to-mdx] watcher error:', err))
    .on('ready', () => {
      // ready fires after initial scan
    })

  // Keep alive
  process.stdin.resume()
}

async function main() {
  const isWatch = process.argv.includes('--watch')
  if (isWatch) {
    await watch()
    return
  }
  const did = await convertAll()
  if (!did) console.log(`[ipynb-to-mdx] no notebooks found in data/blog/notebooks/`)
}

main()
