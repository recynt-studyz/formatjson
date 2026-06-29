import type { Metadata } from 'next'
import AdBanner from '@/components/AdBanner'
import JsonDiffWrapper from '@/components/JsonDiffWrapper'
import FAQ, { type FaqItem } from '@/components/FAQ'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'JSON Diff — Compare Two JSON Objects Online | formatjson.app',
  description: 'Compare two JSON objects and see added, removed, and changed values highlighted. Free, instant, runs entirely in your browser.',
  alternates: { canonical: 'https://formatjson.app/json-diff' },
  robots: { index: true, follow: true },
}

const faqItems: FaqItem[] = [
  {
    q: 'How do I compare two JSON objects?',
    a: 'Paste the first JSON into the "JSON A" panel and the second into "JSON B". The diff runs automatically and shows all differences below: added keys in green, removed keys in red, and changed values in amber. A summary counts each type of change.',
  },
  {
    q: 'What does JSON diff show?',
    a: 'The diff shows four categories: added (keys present in B but not A), removed (keys present in A but not B), changed (keys present in both but with different values), and unchanged (identical in both). You can toggle unchanged entries on or off. For changed values, both the old and new values are shown side by side.',
  },
  {
    q: 'Can I diff nested JSON objects?',
    a: 'Yes. The diff recursively traverses nested objects and arrays. Paths to nested keys use dot notation (e.g. user.address.city) and array indices use bracket notation (e.g. items[0].price). Every leaf-level difference is reported with its full path.',
  },
  {
    q: 'Is my JSON sent to a server for comparison?',
    a: 'No. The entire diff algorithm runs in your browser using plain JavaScript. No data is transmitted. You can disconnect from the internet after the page loads and the diff tool will continue to work.',
  },
  {
    q: 'What is the difference between JSON diff and merge?',
    a: 'A JSON diff shows what changed between two objects — it is read-only and non-destructive. A merge combines two objects into one, resolving conflicts. formatjson.app\'s diff tool is purely for comparison: it highlights differences but does not produce a merged output.',
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
  name: 'How to Compare Two JSON Objects Online',
  step: [
    { '@type': 'HowToStep', name: 'Paste JSON A', text: 'Paste the first JSON object or array into the JSON A panel.' },
    { '@type': 'HowToStep', name: 'Paste JSON B', text: 'Paste the second JSON object or array into the JSON B panel.' },
    { '@type': 'HowToStep', name: 'Review the diff', text: 'The diff result shows added, removed, and changed values with color coding and full key paths.' },
  ],
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON Diff Tool',
  url: 'https://formatjson.app/json-diff',
  description: 'Free online JSON diff tool. Compare two JSON objects and highlight added, removed, and changed values. Recursive diff with full path notation.',
  applicationCategory: 'DeveloperApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function JsonDiffPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, '\\u003c') }} />

      <JsonDiffWrapper />

      <section className="bg-white dark:bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
          <FAQ questions={faqItems} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
          <AdBanner slot="3456721098" />
        </div>
      </section>

      <Footer />
    </>
  )
}
