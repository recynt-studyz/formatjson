'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import ToolHeader from './ToolHeader'
import AdBanner from './AdBanner'

type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

function getType(val: unknown): JsonValueType {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val as JsonValueType
}

const typeColors: Record<JsonValueType, string> = {
  string: '#16a34a',
  number: '#ea580c',
  boolean: '#7c3aed',
  null: '#dc2626',
  object: '#2563EB',
  array: '#2563EB',
}

const typeBadgeStyle: Record<JsonValueType, string> = {
  string: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  number: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  boolean: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  null: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  object: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  array: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
}

function collectAllPaths(value: unknown, path: string, depth: number, maxDepth: number): string[] {
  if (typeof value !== 'object' || value === null) return []
  const paths: string[] = [path]
  if (depth >= maxDepth) return paths
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      paths.push(...collectAllPaths(item, `${path}[${i}]`, depth + 1, maxDepth))
    })
  } else {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      paths.push(...collectAllPaths(v, path ? `${path}.${k}` : k, depth + 1, maxDepth))
    })
  }
  return paths
}

function formatPrimitiveValue(val: unknown): string {
  if (typeof val === 'string') return `"${val.length > 80 ? val.slice(0, 80) + '…' : val}"`
  return JSON.stringify(val)
}

interface TreeNodeProps {
  nodeKey: string
  value: unknown
  path: string
  depth: number
  expanded: Set<string>
  onToggle: (path: string) => void
}

const TreeNode = memo(function TreeNode({ nodeKey, value, path, depth, expanded, onToggle }: TreeNodeProps) {
  const type = getType(value)
  const isExpandable = type === 'object' || type === 'array'
  const isExpanded = expanded.has(path)
  const indent = depth * 16

  const keyLabel = nodeKey !== '' ? (
    <span className="text-[#2563EB] dark:text-blue-400 font-medium">{nodeKey}</span>
  ) : null

  const typeBadge = (
    <span className={`ml-1.5 text-[10px] font-medium px-1 py-0.5 rounded ${typeBadgeStyle[type]}`}>
      {type}
    </span>
  )

  if (!isExpandable) {
    return (
      <div className="flex items-center gap-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-1 -mx-1" style={{ paddingLeft: indent + 4 }}>
        <span className="w-4 shrink-0" />
        {keyLabel && <>{keyLabel}<span className="text-gray-400 dark:text-gray-600 mx-0.5">:</span></>}
        <span style={{ color: typeColors[type] }} className="font-mono text-xs">
          {formatPrimitiveValue(value)}
        </span>
        {typeBadge}
      </div>
    )
  }

  const isArray = type === 'array'
  const children = isArray
    ? (value as unknown[])
    : Object.entries(value as Record<string, unknown>)
  const count = Array.isArray(children) ? (isArray ? children.length : (children as [string, unknown][]).length) : 0
  const summary = isArray ? `[${count} item${count !== 1 ? 's' : ''}]` : `{${count} key${count !== 1 ? 's' : ''}}`

  return (
    <div>
      <button
        onClick={() => onToggle(path)}
        className="flex items-center gap-1 py-0.5 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-1 -mx-1"
        style={{ paddingLeft: indent + 4 }}
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {keyLabel && <>{keyLabel}<span className="text-gray-400 dark:text-gray-600 mx-0.5">:</span></>}
        <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">{summary}</span>
        {typeBadge}
      </button>

      {isExpanded && (
        <div>
          {isArray
            ? (value as unknown[]).map((item, i) => (
                <TreeNode
                  key={i}
                  nodeKey={String(i)}
                  value={item}
                  path={`${path}[${i}]`}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                />
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <TreeNode
                  key={k}
                  nodeKey={k}
                  value={v}
                  path={path ? `${path}.${k}` : k}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                />
              ))
          }
        </div>
      )}
    </div>
  )
})

export default function JsonTreeTool() {
  const [input, setInput] = useState('')
  const [debouncedInput, setDebouncedInput] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [parsed, setParsed] = useState<{ value: unknown; error: string | null }>({ value: null, error: null })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedInput(input), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setParsed({ value: null, error: null })
      setExpanded(new Set())
      return
    }
    try {
      const value = JSON.parse(debouncedInput)
      setParsed({ value, error: null })
      // Auto-expand up to depth 3
      const paths = collectAllPaths(value, '', 0, 3)
      setExpanded(new Set(paths))
    } catch (e) {
      setParsed({ value: null, error: e instanceof Error ? e.message : String(e) })
      setExpanded(new Set())
    }
  }, [debouncedInput])

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
    setParsed({ value: null, error: null })
    setExpanded(new Set())
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

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const expandAll = () => {
    if (parsed.value !== null) {
      const paths = collectAllPaths(parsed.value, '', 0, Infinity)
      setExpanded(new Set(paths))
    }
  }

  const collapseAll = () => setExpanded(new Set())

  const inputLines = input ? input.split('\n') : ['']

  return (
    <div className="w-full">
      <ToolHeader />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">JSON Tree Viewer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Visualize JSON as a collapsible tree. Click any node to expand or collapse it.
          </p>
        </div>

        <AdBanner slot="8899001122" />

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 mt-4">
          {/* Left: Input */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input</span>
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
                placeholder="Paste your JSON here..."
                style={{ minHeight: 400, overflow: 'hidden' }}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="hidden lg:block w-px bg-gray-200 dark:bg-gray-700 self-stretch" />

          {/* Right: Tree */}
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-4 lg:mt-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tree View</span>
              {parsed.value !== null && (
                <div className="flex items-center gap-2">
                  <button onClick={expandAll} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition">Expand all</button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button onClick={collapseAll} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition">Collapse all</button>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-[#1e293b] overflow-auto p-3 font-mono text-xs" style={{ minHeight: 400 }}>
              {parsed.error ? (
                <p className="text-red-600 dark:text-red-400 font-mono text-xs">{parsed.error}</p>
              ) : parsed.value === null ? (
                <p style={{ color: '#9ca3af' }}>Tree view will appear here...</p>
              ) : (
                <TreeNode
                  nodeKey=""
                  value={parsed.value}
                  path=""
                  depth={0}
                  expanded={expanded}
                  onToggle={handleToggle}
                />
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        {debouncedInput.trim() && !parsed.error && parsed.value !== null && (
          <div className="mt-3 flex items-center gap-4 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs">
            <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Valid JSON
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Type: <span className="font-medium">{getType(parsed.value)}</span>
              {' · '}
              {expanded.size} node{expanded.size !== 1 ? 's' : ''} expanded
            </span>
          </div>
        )}

        <AdBanner slot="9900112233" />
      </div>
    </div>
  )
}
