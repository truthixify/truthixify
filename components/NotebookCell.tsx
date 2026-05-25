'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'

type Output =
  | { type: 'stream'; name: 'stdout' | 'stderr'; text: string }
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'svg'; svg: string }
  | { type: 'image'; mime: string; data: string }
  | { type: 'error'; name: string; value: string; traceback: string }

interface NotebookCellProps {
  language?: string
  code: string
  outputs?: Output[]
}

const PYODIDE_VERSION = '0.27.2'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<PyodideInterface>
    __pyodidePromise?: Promise<PyodideInterface>
  }
}

interface PyodideInterface {
  loadPackagesFromImports: (code: string) => Promise<void>
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (opts: { batched: (s: string) => void }) => void
  setStderr: (opts: { batched: (s: string) => void }) => void
  globals: { get: (name: string) => unknown; set: (name: string, val: unknown) => void }
  FS: unknown
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

async function getPyodide(): Promise<PyodideInterface> {
  if (typeof window === 'undefined') throw new Error('Pyodide only runs in browser')
  if (window.__pyodidePromise) return window.__pyodidePromise
  window.__pyodidePromise = (async () => {
    await loadScript(PYODIDE_URL)
    if (!window.loadPyodide) throw new Error('Pyodide failed to load')
    const py = await window.loadPyodide({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
    })
    return py
  })()
  return window.__pyodidePromise
}

const MPL_SHIM = `
import sys as _sys
def _install_mpl_shim():
    try:
        import matplotlib
        matplotlib.use("AGG")
        import matplotlib.pyplot as _plt
        import io as _io, base64 as _b64
        _orig_show = _plt.show
        def _show(*a, **kw):
            for num in _plt.get_fignums():
                fig = _plt.figure(num)
                buf = _io.BytesIO()
                fig.savefig(buf, format="png", bbox_inches="tight")
                buf.seek(0)
                print("__NBIMG__" + _b64.b64encode(buf.read()).decode("ascii") + "__ENDNBIMG__")
            _plt.close("all")
        _plt.show = _show
    except Exception:
        pass
_install_mpl_shim()
`

function highlight(code: string, language: string): string {
  const grammar = Prism.languages[language] ?? Prism.languages.python
  if (!grammar) return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return Prism.highlight(code, grammar, language)
}

export default function NotebookCell({
  code,
  outputs = [],
  language = 'python',
}: NotebookCellProps) {
  const [liveOutputs, setLiveOutputs] = useState<Output[] | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const stdoutBufRef = useRef<string>('')
  const stderrBufRef = useRef<string>('')

  const hasSaved = outputs.length > 0
  const shown = liveOutputs ?? (showSaved ? outputs : null)
  const [outputCollapsed, setOutputCollapsed] = useState(false)
  const highlighted = useMemo(() => highlight(code, language), [code, language])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // no-op
    }
  }, [code])

  const run = useCallback(async () => {
    if (language !== 'python') return
    const startedAt = performance.now()
    const MIN_RUNNING_MS = 500
    setRunning(true)
    setStatus(window.__pyodidePromise ? 'Running…' : 'Loading Python runtime…')
    setLiveOutputs([])
    stdoutBufRef.current = ''
    stderrBufRef.current = ''
    try {
      const py = await getPyodide()
      setStatus('Installing packages…')
      const flush = () => {
        const live: Output[] = []
        // Parse stdout for inline image markers
        const stdout = stdoutBufRef.current
        const parts = stdout.split(/__NBIMG__([A-Za-z0-9+/=]+)__ENDNBIMG__/g)
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            if (parts[i]) live.push({ type: 'stream', name: 'stdout', text: parts[i] })
          } else {
            live.push({ type: 'image', mime: 'image/png', data: parts[i] })
          }
        }
        if (stderrBufRef.current) {
          live.push({ type: 'stream', name: 'stderr', text: stderrBufRef.current })
        }
        setLiveOutputs(live)
      }
      py.setStdout({
        batched: (s: string) => {
          stdoutBufRef.current += s + '\n'
          flush()
        },
      })
      py.setStderr({
        batched: (s: string) => {
          stderrBufRef.current += s + '\n'
          flush()
        },
      })
      await py.loadPackagesFromImports(code)
      // Install matplotlib shim if matplotlib is imported
      if (/\bimport\s+matplotlib|\bfrom\s+matplotlib\b/.test(code)) {
        await py.runPythonAsync(MPL_SHIM)
      }
      setStatus('Running…')
      const result = await py.runPythonAsync(code)
      if (result !== undefined && result !== null) {
        const repr = String(result)
        stdoutBufRef.current += repr
        flush()
      }
      const elapsed = performance.now() - startedAt
      if (elapsed < MIN_RUNNING_MS) {
        await new Promise((r) => setTimeout(r, MIN_RUNNING_MS - elapsed))
      }
      const totalMs = performance.now() - startedAt
      const seconds = totalMs >= 1000 ? (totalMs / 1000).toFixed(1) : (totalMs / 1000).toFixed(2)
      setStatus(`✓ Done in ${seconds}s`)
      setTimeout(() => setStatus((s) => (s.startsWith('✓ Done') ? '' : s)), 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setLiveOutputs((prev) => [
        ...(prev ?? []),
        { type: 'error', name: 'RuntimeError', value: msg, traceback: msg },
      ])
      setStatus('')
    } finally {
      setRunning(false)
    }
  }, [code, language])

  const reset = useCallback(() => {
    setLiveOutputs(null)
    setStatus('')
  }, [])

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800">
        <span className="font-mono text-gray-500 dark:text-gray-400">{language}</span>
        <div className="flex items-center gap-2">
          {status && (
            <span
              className={`inline-flex items-center gap-1.5 ${
                status.startsWith('✓')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {running && !status.startsWith('✓') && (
                <span
                  aria-hidden="true"
                  className="border-primary-500 inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
                />
              )}
              {status}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded px-2 py-0.5 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          {hasSaved && !liveOutputs && (
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className="rounded px-2 py-0.5 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {showSaved ? 'Hide output' : 'Show saved output'}
            </button>
          )}
          {language === 'python' && (
            <>
              {liveOutputs && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded px-2 py-0.5 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-white disabled:opacity-70"
              >
                {running ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Running
                  </>
                ) : (
                  <>▶ Run</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <pre
        className="overflow-x-auto p-3 text-sm leading-relaxed"
        style={{ background: 'transparent', margin: 0, border: 0, borderRadius: 0 }}
      >
        <code
          className={`language-${language}`}
          style={{ background: 'transparent', padding: 0, display: 'block', width: '100%' }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
      {shown && shown.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setOutputCollapsed((v) => !v)}
            className="flex w-full items-center justify-between bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-expanded={!outputCollapsed}
          >
            <span>
              Output{shown.length > 1 ? ` · ${shown.length} items` : ''}
              {liveOutputs ? '' : ' (saved)'}
            </span>
            <span
              aria-hidden="true"
              className={`inline-block transition-transform ${outputCollapsed ? '' : 'rotate-180'}`}
            >
              ▾
            </span>
          </button>
          {!outputCollapsed && (
            <div className="bg-white px-3 py-2 text-sm dark:bg-gray-950">
              {shown.map((o, i) => (
                <OutputView key={i} output={o} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OutputView({ output }: { output: Output }) {
  if (output.type === 'stream') {
    return (
      <pre
        className={`m-0 bg-transparent p-0 whitespace-pre-wrap ${
          output.name === 'stderr'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-800 dark:text-gray-200'
        }`}
      >
        {output.text}
      </pre>
    )
  }
  if (output.type === 'text') {
    return (
      <pre className="m-0 bg-transparent p-0 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {output.text}
      </pre>
    )
  }
  if (output.type === 'html') {
    return <div className="notebook-html" dangerouslySetInnerHTML={{ __html: output.html }} />
  }
  if (output.type === 'svg') {
    return <div className="notebook-svg" dangerouslySetInnerHTML={{ __html: output.svg }} />
  }
  if (output.type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt="output"
        src={`data:${output.mime};base64,${output.data}`}
        className="my-1 max-w-full"
      />
    )
  }
  if (output.type === 'error') {
    return (
      <pre className="m-0 bg-transparent p-0 whitespace-pre-wrap text-red-600 dark:text-red-400">
        {output.name}: {output.value}
        {output.traceback ? '\n' + output.traceback : ''}
      </pre>
    )
  }
  return null
}
