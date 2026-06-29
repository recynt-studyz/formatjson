import type { Metadata } from 'next'
import AdBanner from '@/components/AdBanner'
import JsonTreeWrapper from '@/components/JsonTreeWrapper'
import FAQ, { type FaqItem } from '@/components/FAQ'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'JSON Tree Viewer — Visualize JSON Structure Online | formatjson.app',
  description: 'Explore JSON as an interactive collapsible tree. Click to expand and collapse nodes. Shows type badges for every value. Free, instant, no upload.',
  alternates: { canonical: 'https://formatjson.app/json-tree' },
  robots: { index: true, follow: true },
}

const faqItems: FaqItem[] = [
  {
    q: 'What is a JSON tree viewer?',
    a: 'A JSON tree viewer renders JSON as a collapsible tree of nodes, making it easy to explore complex or deeply nested structures. Instead of reading raw text, you can click to expand objects and arrays one level at a time and see each key, value, and type at a glance.',
  },
  {
    q: 'How do I visualize JSON structure?',
    a: 'Paste your JSON into the left panel. The tree viewer parses it and renders the structure on the right. Objects show their key count, arrays show their item count. Click any node to expand it and see its contents. All nodes up to depth 3 are expanded automatically.',
  },
  {
    q: 'Can I collapse and expand JSON nodes?',
    a: 'Yes. Click any object or array node to toggle it open or closed. Use "Expand all" to open every node in the tree at once, or "Collapse all" to close everything back to the root. The state is tracked per-node so you can explore selectively.',
  },
  {
    q: 'How deep does the tree viewer go?',
    a: 'There is no depth limit — the tree viewer recursively renders the entire JSON structure. On initial load, nodes up to depth 3 are expanded automatically. Deeper nodes start collapsed to keep the view manageable. Use "Expand all" to open the full tree.',
  },
  {
    q: 'Is this useful for exploring API responses?',
    a: 'Yes — this is one of the primary use cases. Paste a raw API response and immediately see its structure without counting braces. Type badges (string, number, boolean, null, object, array) make it easy to understand the data model at a glance.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Visualize JSON as a Tree',
  step: [
    { '@type': 'HowToStep', name: 'Paste your JSON', text: 'Paste any valid JSON into the left input panel.' },
    { '@type': 'HowToStep', name: 'Explore the tree', text: 'The tree view renders immediately. Nodes up to depth 3 are expanded automatically. Click any node to expand or collapse it.' },
    { '@type': 'HowToStep', name: 'Expand or collapse', text: 'Use "Expand all" to open the full tree or "Collapse all" to reset. Type badges show the data type of each value.' },
  ],
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON Tree Viewer',
  url: 'https://formatjson.app/json-tree',
  description: 'Free online JSON tree viewer. Visualize JSON as an interactive collapsible tree with type badges. Explore complex API responses and nested structures.',
  applicationCategory: 'DeveloperApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function JsonTreePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, '\\u003c') }} />

      <JsonTreeWrapper />

      <section className="bg-white dark:bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
          <FAQ questions={faqItems} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
          <AdBanner slot="4567832109" />
        </div>
      </section>

      <Footer />
    </>
  )
}
