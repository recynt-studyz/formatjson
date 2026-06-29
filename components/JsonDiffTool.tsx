'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ToolHeader from './ToolHeader'
import AdBanner from './AdBanner'

type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

interface DiffEntry {
  path: string
  type: DiffType
  leftValue: unknown
  rightValue: unknown
}

function getValueType(val: unknown): string {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

function displayValue(val: unknown): string {
  if (val === undefined) return '(none)'
  return JSON.stringify(val, null, 0)
}

function collectDiff(left: unknown, right: unknown, path: string, results: DiffEntry[]): void {
  if (left === undefined) {
    results.push({ path, type: 'added', leftValue: undefined, rightValue: right })
    return
  }
  if (right === undefined) {
    results.push({ path, type: 'removed', leftValue: left, rightValue: undefined })
    return
  }

  const lt = getValueType(left)
  const rt = getValueType(right)

  if (lt !== rt) {
    results.push({ path, type: 'changed', leftValue: left, rightValue: right })
    return
  }

  if (lt === 'object') {
    const lo = left as Record<string, unknown>
    const ro = right as Record<string, unknown>
    const keys = new Set([...Object.keys(lo), ...Object.keys(ro)])
    keys.forEach((k) => collectDiff(lo[k], ro[k], path ? `${path}.${k}` : k, results))
    return
  }

  if (lt === 'array') {
    const la = left as unknown[]
    const ra = right as unknown[]
    const len = Math.max(la.length, ra.length)
    for (let i = 0; i < len; i++) {
      collectDiff(la[i], ra[i], `${path}[${i}]`, results)
    }
    return
  }

  // Primitive
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    results.push({ path, type: 'changed', leftValue: left, rightValue: right })
  } else {
    results.push({ path, type: 'unchanged', leftValue: left, rightValue: right })
  }
}

function diffJson(leftInput: string, rightInput: string): {
  entries: DiffEntry[]
  summary: { added: number; removed: number; changed: number; unchanged: number }
  error: string | null
} {
  if (!leftInput.trim() && !rightInput.trim()) {
    return { entries: [], summary: { added: 0, removed: 0, changed: 0, unchanged: 0 }, error: null }
  }

  let left: unknown, right: unknown
  try {
    left = leftInput.trim() ? JSON.parse(leftInput) : null
  } catch (e) {
    return { entries: [], summary: { added: 0, removed: 0, changed: 0, unchanged: 0 }, error: `JSON A: ${e instanceof Error ? e.message : String(e)}` }
  }
  try {
    right = rightInput.trim() ? JSON.parse(rightInput) : null
  } catch (e) {
    return { entries: [], summary: { added: 0, removed: 0, changed: 0, unchanged: 0 }, error: `JSON B: ${e instanceof Error ? e.message : String(e)}` }
  }

  const entries: DiffEntry[] = []
  collectDiff(left, right, '', entries)

  const summary = { added: 0, removed: 0, changed: 0, unchanged: 0 }
  entries.forEach((e) => summary[e.type]++)

  return { entries, summary, error: null }
}

const typeColors: Record<DiffType, string> = {
  added: 'bg-green-50 dark:bg-green-950/20 border-l-2 border-green-500 text-green-800 dark:text-green-300',
  removed: 'bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-800 dark:text-red-300',
  changed: 'bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-500 text-amber-800 dark:text-amber-300',
  unchanged: 'bg-transparent text-gray-500 dark:text-gray-500',
}
const typeIcons: Record<DiffType, string> = { added: '+', removed: '−', changed: '~', unchanged: ' ' }

function InputPanel({
  label, value, onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(300, el.scrollHeight) + 'px'
  }
  const lines = value ? value.split('\n') : ['']
  return (
    <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-0">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex bg-white dark:bg-[#1e293b] overflow-auto">
        <div className="select-none text-right font-mono text-xs leading-6 pt-3 pb-3 pr-2 pl-2 shrink-0 bg-gray-50 dark:bg-[#162032] border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 sticky left-0" style={{ minWidth: '3rem' }}>
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); requestAnimationFrame(resize) }}
          className="flex-1 p-3 font-mono text-sm bg-transparent outline-none resize-none leading-6 text-gray-900 dark:text-[#e2e8f0] placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
          placeholder="Paste JSON here..."
          style={{ minHeight: 300, overflow: 'hidden' }}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}

export default function JsonDiffTool() {
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [debouncedLeft, setDebouncedLeft] = useState('')
  const [debouncedRight, setDebouncedRight] = useState('')
  const [showUnchanged, setShowUnchanged] = useState(false)
  const [copiedDiff, setCopiedDiff] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedLeft(leftInput)
      setDebouncedRight(rightInput)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [leftInput, rightInput])

  const { entries, summary, error } = diffJson(debouncedLeft, debouncedRight)
  const visibleEntries = showUnchanged ? entries : entries.filter((e) => e.type !== 'unchanged')
  const hasContent = debouncedLeft.trim() || debouncedRight.trim()

  const handleCopyDiff = async () => {
    const text = visibleEntries
      .map((e) => `${typeIcons[e.type]} ${e.path || '(root)'}: ${displayValue(e.leftValue)} → ${displayValue(e.rightValue)}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedDiff(true)
      setTimeout(() => setCopiedDiff(false), 2000)
    } catch { /* ignore */ }
  }

  const totalChanges = summary.added + summary.removed + summary.changed

  return (
    <div className="w-full">
      <ToolHeader />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">JSON Diff</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Compare two JSON objects and highlight added, removed, and changed values.
          </p>
        </div>

        <AdBanner slot="6677889900" />

        {/* Top two input panels */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <InputPanel label="JSON A" value={leftInput} onChange={setLeftInput} />
          <InputPanel label="JSON B" value={rightInput} onChange={setRightInput} />
        </div>

        {/* Diff result */}
        <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Diff Result</span>
              {hasContent && !error && (
                <div className="flex items-center gap-2 text-xs">
                  {summary.added > 0 && <span className="text-green-700 dark:text-green-400 font-medium">{summary.added} added</span>}
                  {summary.removed > 0 && <span className="text-red-600 dark:text-red-400 font-medium">{summary.removed} removed</span>}
                  {summary.changed > 0 && <span className="text-amber-600 dark:text-amber-400 font-medium">{summary.changed} changed</span>}
                  {totalChanges === 0 && entries.length > 0 && <span className="text-gray-500 dark:text-gray-400">Identical</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {entries.some(e => e.type === 'unchanged') && (
                <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={showUnchanged} onChange={(e) => setShowUnchanged(e.target.checked)} className="accent-[#2563EB]" />
                  Show unchanged
                </label>
              )}
              {visibleEntries.length > 0 && (
                <button onClick={handleCopyDiff} className={`text-xs font-medium transition flex items-center gap-1 ${copiedDiff ? 'text-green-600 dark:text-green-400' : 'text-[#2563EB] hover:text-blue-700 dark:hover:text-blue-400'}`}>
                  {copiedDiff ? 'Copied!' : 'Copy diff'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] overflow-auto" style={{ minHeight: 200, maxHeight: 500 }}>
            {error ? (
              <p className="p-4 text-sm text-red-600 dark:text-red-400 font-mono">{error}</p>
            ) : !hasContent ? (
              <p className="p-6 text-sm text-gray-400 dark:text-gray-600 font-mono text-center">Paste JSON in both panels above to see the diff...</p>
            ) : visibleEntries.length === 0 ? (
              <p className="p-6 text-sm text-green-700 dark:text-green-400 font-mono text-center">✓ The two JSON objects are identical</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {visibleEntries.map((entry, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-1.5 font-mono text-xs ${typeColors[entry.type]}`}>
                    <span className="shrink-0 font-bold w-3">{typeIcons[entry.type]}</span>
                    <span className="shrink-0 text-gray-700 dark:text-gray-300 break-all">{entry.path || '(root)'}</span>
                    <span className="flex-1 text-right break-all">
                      {entry.type === 'changed' ? (
                        <>
                          <span className="line-through opacity-60 mr-2">{displayValue(entry.leftValue)}</span>
                          <span>{displayValue(entry.rightValue)}</span>
                        </>
                      ) : entry.type === 'added' ? (
                        displayValue(entry.rightValue)
                      ) : entry.type === 'removed' ? (
                        displayValue(entry.leftValue)
                      ) : (
                        displayValue(entry.leftValue)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AdBanner slot="7788990011" />
      </div>
    </div>
  )
}
