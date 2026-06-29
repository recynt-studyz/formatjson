'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tools = [
  { href: '/', label: 'Formatter' },
  { href: '/repair', label: 'Repair' },
  { href: '/json-to-csv', label: 'JSON→CSV' },
  { href: '/json-diff', label: 'Diff' },
  { href: '/json-tree', label: 'Tree' },
]

export default function ToolNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] px-4 sm:px-6 overflow-x-auto">
      <div className="flex gap-0.5 max-w-[1600px] mx-auto py-1.5 min-w-max">
        {tools.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
