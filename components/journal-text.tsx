import React from 'react'
import katex from 'katex'

// Renders a journal text string with: $$...$$ block math, $...$ inline math,
// ![alt](url) images, [text](url) links, and plain text.
export function JournalText({ text }: { text: string }) {
  // First, split on block math ($$...$$, possibly multi-line)
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

function renderInline(text: string, baseKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Match inline math, images, and links — try each in order
  const regex = /(\$[^$\n]+?\$)|(!?\[[^\]]*\]\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = baseKey

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('$') && token.endsWith('$')) {
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
