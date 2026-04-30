import React from 'react'

// Parses a journal text string and renders markdown images and links as real elements.
// Handles: ![alt](url) → <img>, [text](url) → <a>, plain text → <span>
export function JournalText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  // Match both ![alt](url) and [text](url)
  const regex = /(!?)\[([^\]]*)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [, bang, label, url] = match
    if (bang === '!') {
      // Image
      parts.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={match.index}
          src={url}
          alt={label}
          className="my-3 max-w-full rounded-md"
          loading="lazy"
        />
      )
    } else {
      // Link (PDF, file, or any URL)
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-accent decoration-accent/30 hover:decoration-accent underline underline-offset-4"
        >
          {label || url}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}
