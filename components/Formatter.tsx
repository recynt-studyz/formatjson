'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ToolNav from './ToolNav'

type Mode = 'format' | 'minify' | 'validate'
type IndentSize = 2 | 4 | '\t'

const SAMPLE_JSON = `{
  "name": "formatjson.app",
  "version": "2.0.0",
  "description": "Free JSON formatter and validator",
  "features": [
    "formatting",
    "validation",
    "minification",
    "syntax highlighting"
  ],
  "settings": {
    "indent": 2,
    "darkMode": false,
    "autoFormat": true
  },
  "stats": {
    "lines": 400,
    "characters": 12000,
    "uptime": null
  },
  "active": true,
  "price": 0
}`

function parseJsonError(raw: string): string {
  const lineColMatch = raw.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  const posMatch = raw.match(/at\s+position\s+(\d+)/i) || raw.match(/position\s+(\d+)/i)

  let msg = ''

  if (/unexpected end/i.test(raw)) {
    msg = 'Unexpected end of input — missing a closing bracket `]`, brace `}`, or quote `"`.'
  } else if (/unexpected token/i.test(raw)) {
    const tokenMatch = raw.match(/Unexpected token\s+['"]?([^'"]+?)['"]?(?:,|\s|$)/)
    const token = tokenMatch ? tokenMatch[1].trim() : ''
    if (token === '}') {
      msg = 'Unexpected closing brace `}` — trailing comma or missing value before it.'
    } else if (token === ']') {
      msg = 'Unexpected closing bracket `]` — trailing comma or missing value before it.'
    } else if (token === ',') {
      msg = 'Unexpected comma — trailing commas are not valid in JSON.'
    } else if (token === ':') {
      msg = 'Unexpected colon — check for a missing key or misplaced colon.'
    } else if (token) {
      msg = `Unexpected token \`${token}\` — check for missing quotes or misplaced brackets.`
    } else {
      msg = 'Unexpected token — check for missing quotes, trailing commas, or misplaced brackets.'
    }
  } else if (/expected.*property name|expected.*double.quot/i.test(raw)) {
    msg = 'Expected a property name in double quotes — JSON keys must be quoted strings.'
  } else {
    msg = raw.replace(/^JSON\.parse:\s*/i, '').replace(/^SyntaxError:\s*/i, '')
  }

  if (lineColMatch) {
    msg += ` (line ${lineColMatch[1]}, column ${lineColMatch[2]})`
  } else if (posMatch) {
    msg += ` (position ${posMatch[1]})`
  }

  return msg
}

function getErrorLine(input: string, raw: string): number | null {
  const lineMatch = raw.match(/line\s+(\d+)/i)
  if (lineMatch) return parseInt(lineMatch[1])

  const posMatch = raw.match(/at\s+position\s+(\d+)/i) || raw.match(/position\s+(\d+)/i)
  if (posMatch) {
    const pos = parseInt(posMatch[1])
    return input.slice(0, pos).split('\n').length
  }

  return null
}

function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span style="color:#2563EB">${match}</span>`
        }
        return `<span style="color:#16a34a">${match}</span>`
      }
      if (/true|false/.test(match)) {
        return `<span style="color:#7c3aed">${match}</span>`
      }
      if (/null/.test(match)) {
        return `<span style="color:#dc2626">${match}</span>`
      }
      return `<span style="color:#ea580c">${match}</span>`
    }
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function processJson(
  input: string,
  mode: Mode,
  indent: IndentSize
): { output: string; valid: boolean; error: string | null; rawError: string | null } {
  if (!input.trim()) return { output: '', valid: true, error: null, rawError: null }
  try {
    const parsed = JSON.parse(input)
    let output = ''
    if (mode === 'format') output = JSON.stringify(parsed, null, indent)
    else if (mode === 'minify') output = JSON.stringify(parsed)
    return { output, valid: true, error: null, rawError: null }
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e)
    return { output: '', valid: false, error: parseJsonError(raw), rawError: raw }
  }
}

export default function Formatter() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('format')
  const [indent, setIndent] = useState<IndentSize>(2)
  const [darkMode, setDarkMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [debouncedInput, setDebouncedInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync dark state with html class (set by layout script and Header)
  useEffect(() => {
    const sync = () => setDarkMode(document.documentElement.classList.contains('dark'))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('formatjson-theme', next ? 'dark' : 'light') } catch { /* ignore */ }
  }

  // Debounce input → processing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedInput(input), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  // Keyboard shortcut Cmd/Ctrl+Shift+F → format immediately
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setMode('format')
        setDebouncedInput(input)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [input])

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(400, el.scrollHeight) + 'px'
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Resize on next tick so scrollHeight reflects new content
    requestAnimationFrame(resizeTextarea)
  }

  const handleClear = () => {
    setInput('')
    setDebouncedInput('')
    if (textareaRef.current) textareaRef.current.style.height = '400px'
  }

  const handleCopy = async () => {
    if (!result.output) return
    try {
      await navigator.clipboard.writeText(result.output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const handleDownload = () => {
    if (!result.output) return
    const blob = new Blob([result.output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!file.name.endsWith('.json') && file.type !== 'application/json') return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setInput(text)
      requestAnimationFrame(resizeTextarea)
    }
    reader.readAsText(file)
  }

  const loadSample = () => {
    setInput(SAMPLE_JSON)
    requestAnimationFrame(resizeTextarea)
  }

  const result = processJson(debouncedInput, mode, indent)

  // Line count from raw input (immediate, no debounce)
  const inputLines = input ? input.split('\n') : ['']
  const outputLines = result.output ? result.output.split('\n') : []

  const errorLine = result.rawError ? getErrorLine(input, result.rawError) : null

  const stats =
    input.trim()
      ? {
          lines: inputLines.length,
          chars: input.length,
          size: formatBytes(new TextEncoder().encode(input).length),
        }
      : null

  const highlightedOutput = result.output ? syntaxHighlight(result.output) : ''

  return (
    <div className="w-full">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center bg-white dark:bg-[#0f172a]">
        <div className="flex items-baseline gap-3">
          <span className="font-mono font-bold text-xl text-gray-900 dark:text-white tracking-tight">
            formatjson.app
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            Free JSON formatter &amp; validator
          </span>
        </div>
      </header>
      <ToolNav />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* Mode toolbar */}
        <div
          className="inline-flex items-center gap-1 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1.5 mb-4"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
        >
          {(['format', 'minify', 'validate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl px-5 py-2.5 text-sm transition-all duration-150 ${
                mode === m
                  ? 'font-semibold text-white'
                  : 'font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 hover:shadow-md'
              }`}
              style={
                mode === m
                  ? { background: '#2563EB', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', transform: 'scale(1.05)' }
                  : undefined
              }
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="rounded-xl p-2.5 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-150"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Indent selector */}
        {mode !== 'minify' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Indent:</span>
            {(
              [
                { label: '2 spaces', value: 2 as IndentSize },
                { label: '4 spaces', value: 4 as IndentSize },
                { label: 'Tab', value: '\t' as IndentSize },
              ]
            ).map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setIndent(value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  indent === value
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4">
          {/* ── Left panel: Input ── */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Input
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadSample}
                  className="text-xs text-[#2563EB] hover:text-blue-700 dark:hover:text-blue-400 font-medium transition"
                >
                  Sample JSON
                </button>
                {input && (
                  <button
                    onClick={handleClear}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    aria-label="Clear input"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Input area */}
            <div
              className="flex bg-white dark:bg-[#1e293b] overflow-auto"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Line numbers */}
              <div
                className="select-none text-right font-mono text-xs leading-6 pt-3 pb-3 pr-2 pl-2 shrink-0 bg-gray-50 dark:bg-[#162032] border-r border-gray-200 dark:border-gray-700 sticky left-0"
                style={{ minWidth: '3rem' }}
              >
                {inputLines.map((_, i) => (
                  <div
                    key={i}
                    className={
                      errorLine === i + 1
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20 rounded px-1'
                        : 'text-gray-400 dark:text-gray-600'
                    }
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                className="flex-1 p-3 font-mono text-sm bg-transparent outline-none resize-none leading-6 text-gray-900 dark:text-[#e2e8f0] placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
                placeholder="Paste your JSON here..."
                style={{ minHeight: 400, overflow: 'hidden' }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
          </div>

          {/* Divider (desktop only) */}
          <div className="hidden lg:block w-px bg-gray-200 dark:bg-gray-700 self-stretch mx-0" />

          {/* ── Right panel: Output ── */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-4 lg:mt-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {mode === 'validate' ? 'Validation Result' : 'Output'}
              </span>
              {mode !== 'validate' && result.output && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`text-xs font-medium transition flex items-center gap-1 ${
                      copied
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-[#2563EB] hover:text-blue-700 dark:hover:text-blue-400'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Output area */}
            <div
              className="flex bg-white dark:bg-[#1e293b] overflow-auto"
              style={{ minHeight: 400 }}
            >
              {mode === 'validate' ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                  {!debouncedInput.trim() ? (
                    <p className="text-gray-400 dark:text-gray-600 text-sm font-mono">
                      Paste JSON to validate...
                    </p>
                  ) : result.valid ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-400">Valid JSON</p>
                      {stats && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stats.lines} lines &middot; {stats.chars} characters &middot; {stats.size}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 max-w-sm text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">Invalid JSON</p>
                      <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed font-mono">
                        {result.error}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {outputLines.length > 0 && (
                    <div
                      className="select-none text-right font-mono text-xs leading-6 pt-3 pb-3 pr-2 pl-2 shrink-0 bg-gray-50 dark:bg-[#162032] border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 sticky left-0"
                      style={{ minWidth: '3rem' }}
                    >
                      {outputLines.map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                  )}
                  <pre
                    className="flex-1 p-3 font-mono text-sm leading-6 overflow-x-auto"
                    style={{ color: 'var(--bracket-color)', minHeight: 400 }}
                    dangerouslySetInnerHTML={{
                      __html:
                        highlightedOutput ||
                        `<span style="color:#9ca3af">Formatted JSON will appear here...</span>`,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        {input.trim() && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs">
            {result.valid ? (
              <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Valid JSON
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Invalid &mdash; {result.error}
              </span>
            )}
            {stats && (
              <>
                <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">&middot;</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {stats.lines} lines &middot; {stats.chars} chars &middot; {stats.size}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
