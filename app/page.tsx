import type { Metadata } from 'next'
import AdBanner from '@/components/AdBanner'
import FormatterWrapper from '@/components/FormatterWrapper'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator — Free, Instant, Private',
  description:
    'Format, validate and beautify JSON instantly in your browser. Free JSON formatter with syntax highlighting, error detection, and minifier. No signup required.',
  alternates: { canonical: 'https://formatjson.app' },
  robots: { index: true, follow: true },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a JSON formatter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A JSON formatter (also called a JSON beautifier or JSON pretty printer) takes raw, compact JSON text and adds indentation and line breaks to make it human-readable. formatjson.app formats your JSON instantly in the browser using native JavaScript — no server required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I format JSON online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Paste your JSON into the left panel on formatjson.app. The json formatter validates and formats it automatically as you type, with 2-space indentation by default. You can also switch to 4-space or tab indentation, then copy or download the result.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I validate JSON?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Switch to Validate mode using the toolbar above the panels. The json validator will tell you immediately whether your JSON is valid or invalid. If invalid, it shows a plain-English description of the error including the line and position where the problem was found.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my JSON sent to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. formatjson.app is a fully client-side tool. JSON never leaves your browser — all processing uses native JavaScript (JSON.parse and JSON.stringify) directly in your browser tab. You can disconnect from the internet after the page loads and the tool will still work.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is JSON minification?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JSON minification removes all unnecessary whitespace and line breaks, producing the smallest possible valid JSON string. This is useful when transmitting JSON over a network to reduce payload size. Use the Minify mode to minify your JSON instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I fix a JSON error?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Switch to Validate mode to see a plain-English description of the error. Common issues include trailing commas after the last item, single quotes instead of double quotes, unquoted property names, and missing or mismatched brackets and braces.',
      },
    },
    {
      '@type': 'Question',
      name: 'What causes "Unexpected token" errors in JSON?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '"Unexpected token" errors mean the parser encountered a character it did not expect. Common causes: a trailing comma after the last element, a JavaScript-style comment (JSON does not support comments), an unquoted string, a single-quoted string, or a missing comma between elements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I format a JSON file by uploading it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Drag and drop any .json file onto the left input panel. The file is read locally by your browser — it is not uploaded anywhere. The contents are loaded into the formatter immediately.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between JSON formatter and JSON validator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A json formatter adds indentation and line breaks to make JSON readable, while a json validator checks whether the JSON syntax is correct. formatjson.app does both: formatting automatically validates, and the dedicated Validate mode gives a focused pass/fail result with detailed error messages.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is formatjson.app completely free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No account, no signup, no file size limits, no watermarks. The tool is ad-supported to remain free for everyone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does formatjson.app work offline?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After the page loads, yes. All JSON processing uses native browser APIs with no network calls. You can disconnect from the internet and continue formatting and validating JSON without interruption.',
      },
    },
  ],
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON Formatter & Validator',
  url: 'https://formatjson.app',
  description:
    'Free online JSON formatter, validator and beautifier. Format JSON instantly in your browser with syntax highlighting. JSON never leaves your browser.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Format JSON Online',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Paste your JSON',
      text: 'Paste your JSON into the left panel. The json formatter validates and highlights it instantly as you type.',
    },
    {
      '@type': 'HowToStep',
      name: 'The formatter validates and highlights instantly',
      text: 'The formatter automatically validates your JSON and applies syntax highlighting — keys in blue, strings in green, numbers in orange, booleans in purple.',
    },
    {
      '@type': 'HowToStep',
      name: 'Copy the formatted result or download as .json file',
      text: 'Click Copy to copy the formatted JSON to your clipboard, or click Download to save it as a .json file.',
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema).replace(/</g, '\\u003c') }}
      />

      {/* Server-rendered H1 for crawlers — visually hidden */}
      <h1 className="sr-only">JSON Formatter &amp; Validator — Free, Instant, Private</h1>

      {/* Formatter — includes its own header */}
      <FormatterWrapper />

      {/* Below formatter */}
      <section className="bg-white dark:bg-[#0f172a]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Ad below formatter */}
          <div className="pb-2">
            <AdBanner slot="0987654321" />
          </div>

          {/* Trust signals */}
          <div className="py-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: '⚡', label: 'Instant', sub: 'Results as you type' },
                { icon: '🔒', label: 'Private', sub: 'JSON never leaves your browser' },
                { icon: '∞', label: 'Unlimited', sub: 'No file size limits' },
                { icon: '✓', label: 'Free', sub: 'No signup needed' },
              ].map((t) => (
                <div
                  key={t.label}
                  className="flex flex-col items-center rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e293b] p-4 text-center shadow-sm"
                >
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-[#e2e8f0]">{t.label}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{t.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEO copy */}
          <div className="max-w-3xl mx-auto pb-8">
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-6 py-5">
              <h2 className="text-base font-bold text-blue-900 dark:text-blue-300 mb-2">
                Why &ldquo;JSON never leaves your browser&rdquo; actually matters
              </h2>
              <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                Most online json formatter tools send your data to a remote server. That means your API
                responses, config files, and internal data pass through someone else&apos;s infrastructure.
                formatjson.app is different: every json formatter and json validator operation runs
                entirely in your browser using native <code className="font-mono text-xs">JSON.parse</code> and{' '}
                <code className="font-mono text-xs">JSON.stringify</code>. No data is transmitted. You can
                verify this by opening DevTools &rarr; Network tab &mdash; zero outbound requests when
                you format json.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto pb-10">
            <FAQ />
          </div>

          {/* Ad below FAQ */}
          <div className="max-w-3xl mx-auto pb-6">
            <AdBanner slot="1122334455" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
