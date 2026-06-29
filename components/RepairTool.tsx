'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ToolHeader from './ToolHeader'
import AdBanner from './AdBanner'

function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span style="color:#2563EB">${match}</span>`
        return `<span style="color:#16a34a">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span style="color:#7c3aed">${match}</span>`
      if (/null/.test(match)) return `<span style="color:#dc2626">${match}</span>`
      return `<span style="color:#ea580c">${match}</span>`
    }
  )
}

interface RepairResult {
  output: string
  fixes: string[]
  valid: boolean
  error: string | null
}

function repairJson(raw: string): RepairResult {
  if (!raw.trim()) return { output: '', fixes: [], valid: true, error: null }

  // Already valid?
  try {
    const parsed = JSON.parse(raw)
    return {
      output: JSON.stringify(parsed, null, 2),
      fixes: ['No fixes needed — JSON is already valid'],
      valid: true,
      error: null,
    }
  } catch { /* continue to repair */ }

  let text = raw
  const fixes: string[] = []

  // 1. Remove block comments /* ... */
  const blockComments = text.match(/\/\*[\s\S]*?\*\//g) ?? []
  if (blockComments.length) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, '')
    fixes.push(`Removed ${blockComments.length} block comment${blockComments.length > 1 ? 's' : ''}`)
  }

  // 2. Remove line comments // ...
  const lineComments = text.match(/\/\/[^\n\r]*/g) ?? []
  if (lineComments.length) {
    text = text.replace(/\/\/[^\n\r]*/g, '')
    fixes.push(`Removed ${lineComments.length} line comment${lineComments.length > 1 ? 's' : ''}`)
  }

  // 3. Remove trailing commas before } or ]
  const trailingCommas = text.match(/,(\s*[}\]])/g) ?? []
  if (trailingCommas.length) {
    text = text.replace(/,(\s*[}\]])/g, '$1')
    fixes.push(`Removed ${trailingCommas.length} trailing comma${trailingCommas.length > 1 ? 's' : ''}`)
  }

  // 4. Replace single-quoted strings with double quotes
  //    (simplified: matches 'content' where content contains no single quotes)
  const singleQuotes = text.match(/'([^']*)'/g) ?? []
  if (singleQuotes.length) {
    text = text.replace(/'([^']*)'/g, '"$1"')
    fixes.push(`Replaced ${singleQuotes.length} single-quoted string${singleQuotes.length > 1 ? 's' : ''}`)
  }

  // 5. Quote unquoted object keys (e.g. {key: → {"key":)
  const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*):/g
  let unquotedCount = 0
  const fixedKeys = text.replace(unquotedKeyPattern, (match, before, key, space) => {
    // Skip if key is already preceded by a quote (i.e. already quoted)
    const idx = text.indexOf(match)
    const charBefore = idx > 0 ? text[idx + before.length - 1] : ''
    if (charBefore === '"') return match
    unquotedCount++
    return `${before}"${key}"${space}:`
  })
  if (unquotedCount > 0) {
    text = fixedKeys
    fixes.push(`Quoted ${unquotedCount} unquoted key${unquotedCount > 1 ? 's' : ''}`)
  }

  // Try to parse the repaired text
  try {
    const parsed = JSON.parse(text)
    return {
      output: JSON.stringify(parsed, null, 2),
      fixes,
      valid: true,
      error: null,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      output: text,
      fixes: fixes.length ? fixes : ['No automatic fixes found'],
      valid: false,
      error: msg.replace(/^SyntaxError:\s*/i, '').replace(/^JSON\.parse:\s*/i, ''),
    }
  }
}

export default function RepairTool() {
  const [input, setInput] = useState('')
  const [debouncedInput, setDebouncedInput] = useState('')
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedInput(input), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(400, el.scrollHeight) + 'px'
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    requestAnimationFrame(resizeTextarea)
  }

  const handleClear = () => {
    setInput('')
    setDebouncedInput('')
    if (textareaRef.current) textareaRef.current.style.height = '400px'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || (!file.name.endsWith('.json') && file.type !== 'application/json')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setInput(ev.target?.result as string)
      requestAnimationFrame(resizeTextarea)
    }
    reader.readAsText(file)
  }

  const result = repairJson(debouncedInput)
  const highlightedOutput = result.valid && result.output ? syntaxHighlight(result.output) : ''
  const inputLines = input ? input.split('\n') : ['']
  const outputLines = result.output ? result.output.split('\n') : []

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
    a.href = url; a.download = 'repaired.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <ToolHeader />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">JSON Repair</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Auto-fix common JSON errors: trailing commas, single quotes, unquoted keys, and JavaScript comments.
          </p>
        </div>

        <AdBanner slot="2233445566" />

        {/* Two-panel layout */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 mt-4">
          {/* Left: Input */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Broken JSON</span>
              {input && (
                <button onClick={handleClear} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" aria-label="Clear">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex bg-white dark:bg-[#1e293b] overflow-auto" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
              <div className="select-none text-right font-mono text-xs leading-6 pt-3 pb-3 pr-2 pl-2 shrink-0 bg-gray-50 dark:bg-[#162032] border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 sticky left-0" style={{ minWidth: '3rem' }}>
                {inputLines.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                className="flex-1 p-3 font-mono text-sm bg-transparent outline-none resize-none leading-6 text-gray-900 dark:text-[#e2e8f0] placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
                placeholder="Paste broken JSON here..."
                style={{ minHeight: 400, overflow: 'hidden' }}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gray-200 dark:bg-gray-700 self-stretch" />

          {/* Right: Output */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-4 lg:mt-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Repaired JSON</span>
              {result.output && (
                <div className="flex items-center gap-3">
                  <button onClick={handleDownload} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                  <button onClick={handleCopy} className={`text-xs font-medium transition flex items-center gap-1 ${copied ? 'text-green-600 dark:text-green-400' : 'text-[#2563EB] hover:text-blue-700 dark:hover:text-blue-400'}`}>
                    {copied ? (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Copied!</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex bg-white dark:bg-[#1e293b] overflow-auto" style={{ minHeight: 400 }}>
              {outputLines.length > 0 && (
                <div className="select-none text-right font-mono text-xs leading-6 pt-3 pb-3 pr-2 pl-2 shrink-0 bg-gray-50 dark:bg-[#162032] border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 sticky left-0" style={{ minWidth: '3rem' }}>
                  {outputLines.map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
              )}
              <pre
                className="flex-1 p-3 font-mono text-sm leading-6 overflow-x-auto"
                style={{ color: 'var(--bracket-color)', minHeight: 400 }}
                dangerouslySetInnerHTML={{
                  __html: highlightedOutput
                    || (result.output && !result.valid
                      ? `<span style="color:#9ca3af">${result.output.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
                      : '<span style="color:#9ca3af">Repaired JSON will appear here...</span>')
                }}
              />
            </div>
          </div>
        </div>

        {/* Status bar */}
        {debouncedInput.trim() && (
          <div className="mt-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs space-y-1">
            <div className="flex items-center gap-1.5">
              {result.valid ? (
                <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Repair successful
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  Repair incomplete &mdash; {result.error}
                </span>
              )}
            </div>
            {result.fixes.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400">{result.fixes.join(' · ')}</p>
            )}
          </div>
        )}

        <AdBanner slot="3344556677" />
      </div>
    </div>
  )
}
