import React from 'react'
import katex from 'katex'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-toml'
import 'prismjs/components/prism-markdown'

// Renders a journal text string with code blocks, math, images, links, and plain text.
export function JournalText({ text }: { text: string }) {
  // Code fence: ```lang\n...\n```
  if (/^\s*```/.test(text)) {
    const match = text.match(/^\s*```(\w*)\s*\n([\s\S]*?)\n\s*```\s*$/)
    if (match) {
      const lang = match[1] || 'plaintext'
      const code = match[2]
      const grammar = Prism.languages[lang] || Prism.languages.plaintext
      const html = grammar ? Prism.highlight(code, grammar, lang) : escapeHtml(code)
      return (
        <pre
          className={`language-${lang} border-border bg-muted/60 my-3 overflow-x-auto rounded-md border p-4 text-sm`}
        >
          <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      )
    }
  }

  // Block math: $$...$$
  const blockMathRegex = /\$\$([\s\S]+?)\$\$/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = blockMathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderInline(text.slice(lastIndex, match.index), key))
      key += 100
    }
    try {
      const html = katex.renderToString(match[1].trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })
      parts.push(
        <div
          key={`block-${key++}`}
          className="my-4 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    } catch {
      parts.push(<code key={`block-${key++}`}>{match[0]}</code>)
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(...renderInline(text.slice(lastIndex), key))
  }

  return <>{parts}</>
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderInline(text: string, baseKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Match inline code, inline math, images, and links — in order
  const regex = /(`[^`\n]+`)|(\$[^$\n]+?\$)|(!?\[[^\]]*\]\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = baseKey

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('`') && token.endsWith('`')) {
      // Inline code
      parts.push(
        <code
          key={`code-${key++}`}
          className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.9em]"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('$') && token.endsWith('$')) {
      // Inline math
      try {
        const html = katex.renderToString(token.slice(1, -1), {
          displayMode: false,
          throwOnError: false,
          output: 'html',
        })
        parts.push(<span key={`inline-${key++}`} dangerouslySetInnerHTML={{ __html: html }} />)
      } catch {
        parts.push(<code key={`inline-${key++}`}>{token}</code>)
      }
    } else {
      // Image or link
      const linkMatch = token.match(/^(!?)\[([^\]]*)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const [, bang, label, url] = linkMatch
        const isImage = /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(url)
        if (bang === '!' && isImage) {
          parts.push(
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`img-${key++}`}
              src={url}
              alt={label}
              className="my-3 max-w-full rounded-md"
              loading="lazy"
            />
          )
        } else {
          parts.push(
            <a
              key={`a-${key++}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-accent decoration-accent/30 hover:decoration-accent underline underline-offset-4"
            >
              {label || url}
            </a>
          )
        }
      } else {
        parts.push(token)
      }
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
