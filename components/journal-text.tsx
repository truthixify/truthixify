import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
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

function highlightCode(code: string, lang: string): string {
  const grammar = Prism.languages[lang]
  if (!grammar) return escapeHtml(code)
  try {
    return Prism.highlight(code, grammar, lang)
  } catch {
    return escapeHtml(code)
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function JournalText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Override code to apply Prism highlighting
        code(props) {
          const { className, children, ...rest } = props as {
            className?: string
            children?: React.ReactNode
          }
          const match = /language-(\w+)/.exec(className || '')
          const codeText = String(children).replace(/\n$/, '')
          if (match) {
            const lang = match[1]
            const html = highlightCode(codeText, lang)
            return (
              <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
            )
          }
          return (
            <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.9em]" {...rest}>
              {children}
            </code>
          )
        },
        pre(props) {
          return (
            <pre className="border-border bg-muted/60 my-3 overflow-x-auto rounded-md border p-4 text-sm">
              {props.children}
            </pre>
          )
        },
        a(props) {
          const { href, children } = props
          return (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent decoration-accent/30 hover:decoration-accent underline underline-offset-4"
            >
              {children}
            </a>
          )
        },
        img(props) {
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          return <img {...props} className="my-3 max-w-full rounded-md" loading="lazy" />
        },
        ul(props) {
          return <ul className="journal-list my-2 space-y-1 pl-5">{props.children}</ul>
        },
        ol(props) {
          return <ol className="my-2 list-decimal space-y-1 pl-6">{props.children}</ol>
        },
        li(props) {
          return <li className="relative pl-4">{props.children}</li>
        },
        p(props) {
          return <p className="my-1">{props.children}</p>
        },
        strong(props) {
          return <strong className="font-semibold">{props.children}</strong>
        },
        em(props) {
          return <em className="italic">{props.children}</em>
        },
      }}
    >
      {text}
    </ReactMarkdown>
  )
}
