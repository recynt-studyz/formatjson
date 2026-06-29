'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ToolHeader from './ToolHeader'
import AdBanner from './AdBanner'

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey))
    } else if (Array.isArray(value)) {
      result[fullKey] = (value as unknown[]).map((v) => (v === null ? '' : String(v))).join(';')
    } else {
      result[fullKey] = value === null ? '' : String(value)
    }
  }
  return result
}

interface CsvResult {
  csv: string
  rowCount: number
  colCount: number
  error: string | null
}

function jsonToCsv(input: string): CsvResult {
  if (!input.trim()) return { csv: '', rowCount: 0, colCount: 0, error: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (e) {
    return { csv: '', rowCount: 0, colCount: 0, error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}` }
  }

  if (!Array.isArray(parsed)) {
    return { csv: '', rowCount: 0, colCount: 0, error: 'Input must be a JSON array of objects. Example: [{"name": "Alice"}, {"name": "Bob"}]' }
  }

  if (parsed.length === 0) {
    return { csv: '', rowCount: 0, colCount: 0, error: 'Array is empty — nothing to convert.' }
  }

  const rows: Record<string, string>[] = parsed.map((item) => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return { value: item === null ? '' : String(item) }
    }
    return flattenObject(item as Record<string, unknown>)
  })

  // Collect all unique headers preserving insertion order
  const headerSet = new Set<string>()
  rows.forEach((row) => Object.keys(row).forEach((k) => headerSet.add(k)))
  const headers = [...headerSet]

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h] ?? '')).join(',')),
  ]

  return { csv: csvLines.join('\n'), rowCount: rows.length, colCount: headers.length, error: null }
}

export default function JsonToCsvTool() {
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
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setInput(ev.target?.result as string); requestAnimationFrame(resizeTextarea) }
    reader.readAsText(file)
  }

  const result = jsonToCsv(debouncedInput)
  const inputLines = input ? input.split('\n') : ['']
  const outputLines = result.csv ? result.csv.split('\n') : []

  const handleCopy = async () => {
    if (!result.csv) return
    try {
      await navigator.clipboard.writeText(result.csv)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const handleDownload = () => {
    if (!result.csv) return
    const blob = new Blob([result.csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'data.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <ToolHeader />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">JSON to CSV Converter</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Convert a JSON array of objects to CSV. Nested objects are flattened with dot notation.
          </p>
        </div>

        <AdBanner slot="4455667788" />

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 mt-4">
          {/* Left: JSON input */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">JSON Input</span>
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
                placeholder={`Paste a JSON array here...\n\nExample:\n[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]`}
                style={{ minHeight: 400, overflow: 'hidden' }}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="hidden lg:block w-px bg-gray-200 dark:bg-gray-700 self-stretch" />

          {/* Right: CSV output */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-4 lg:mt-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CSV Output</span>
              {result.csv && (
                <div className="flex items-center gap-3">
                  <button onClick={handleDownload} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download .csv
                  </button>
                  <button onClick={handleCopy} className={`text-xs font-medium transition flex items-center gap-1 ${copied ? 'text-green-600 dark:text-green-400' : 'text-[#2563EB] hover:text-blue-700 dark:hover:text-blue-400'}`}>
                    {copied
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Copied!</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
                    }
                  </button>
                </div>
              )}
            </div>
            <div className="flex bg-white dark:bg-[#1e293b] overflow-auto" style={{ minHeight: 400 }}>
              {result.error ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono leading-relaxed">{result.error}</p>
                  </div>
                </div>
              ) : (
                <>
                  {outputLines.length > 0 && (
                    <div className="select-none text-right font-mono text-xs leading-6 pt-3 pb-3 pr-2 pl-2 shrink-0 bg-gray-50 dark:bg-[#162032] border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 sticky left-0" style={{ minWidth: '3rem' }}>
                      {outputLines.map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                  )}
                  <pre
                    className="flex-1 p-3 font-mono text-sm leading-6 overflow-x-auto text-gray-800 dark:text-[#e2e8f0]"
                    style={{ minHeight: 400 }}
                  >
                    {result.csv || <span style={{ color: '#9ca3af' }}>CSV output will appear here...</span>}
                  </pre>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        {debouncedInput.trim() && !result.error && result.csv && (
          <div className="mt-3 flex items-center gap-4 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs">
            <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Converted
            </span>
            <span className="text-gray-500 dark:text-gray-400">{result.rowCount} rows &middot; {result.colCount} columns</span>
          </div>
        )}

        <AdBanner slot="5566778899" />
      </div>
    </div>
  )
}
