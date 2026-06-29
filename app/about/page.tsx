import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About — formatjson.app',
  description: 'About formatjson.app — a free, private JSON formatter and validator that runs entirely in your browser.',
  alternates: { canonical: 'https://formatjson.app/about' },
  robots: { index: true, follow: true },
}

export default function AboutPage() {
  return (
    <>
      <header className="border-b border-gray-100 dark:border-gray-800 px-6 py-3 bg-white dark:bg-[#0f172a]">
        <a href="/" className="font-mono font-bold text-xl text-gray-900 dark:text-white tracking-tight hover:text-[#2563EB] transition">
          formatjson.app
        </a>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 bg-white dark:bg-[#0f172a]">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About formatjson.app</h1>

        <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            formatjson.app is a free json formatter, json validator, and json beautifier that runs
            entirely in your browser. There&apos;s no server, no account, and no upload. Your JSON
            never leaves your device.
          </p>

          <p>
            The tool was built for developers who want a fast, distraction-free way to format json
            and validate json without worrying about where their data goes. Paste your JSON, get
            clean output instantly — syntax highlighted, with error messages in plain English.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">How it works</h2>
          <p>
            All processing uses native browser JavaScript APIs:{' '}
            <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">JSON.parse</code> for
            parsing and validation, and{' '}
            <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">JSON.stringify</code> for
            formatting and minification. There are no external libraries for JSON handling — just the
            same APIs your browser uses internally every day.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">Features</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Real-time json formatter with 300ms debounce</li>
            <li>JSON validator with plain-English error messages</li>
            <li>JSON minifier (single-line output)</li>
            <li>Syntax highlighting (keys, strings, numbers, booleans, null)</li>
            <li>Configurable indent: 2 spaces, 4 spaces, or tab</li>
            <li>File upload by drag and drop</li>
            <li>Download formatted output as .json</li>
            <li>Dark mode with system preference detection</li>
            <li>Keyboard shortcut: Cmd/Ctrl+Shift+F to format</li>
          </ul>

          <p className="pt-2 text-gray-500 dark:text-gray-400">
            Free to use. Ad-supported. No signup required.
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
