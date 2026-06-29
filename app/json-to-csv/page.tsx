import type { Metadata } from 'next'
import AdBanner from '@/components/AdBanner'
import JsonToCsvWrapper from '@/components/JsonToCsvWrapper'
import FAQ, { type FaqItem } from '@/components/FAQ'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'JSON to CSV Converter — Free, Instant, No Upload | formatjson.app',
  description: 'Convert JSON arrays to CSV format instantly in your browser. Handles nested objects with dot notation. Free, no signup, no upload.',
  alternates: { canonical: 'https://formatjson.app/json-to-csv' },
  robots: { index: true, follow: true },
}

const faqItems: FaqItem[] = [
  {
    q: 'How do I convert JSON to CSV?',
    a: 'Paste a JSON array of objects into the left panel. The converter extracts all unique keys as CSV column headers and maps each object to a row. Click Download .csv to save the result, or Copy to copy it to your clipboard.',
  },
  {
    q: 'What JSON structure works with this converter?',
    a: 'The input must be a JSON array of objects: [{...}, {...}, ...]. Each object becomes one row in the CSV. Keys across all objects are merged into a unified set of column headers — if an object is missing a key, that cell is left empty.',
  },
  {
    q: 'How are nested JSON objects handled in CSV?',
    a: 'Nested objects are flattened using dot notation. For example, {"user": {"name": "Alice", "age": 30}} becomes two columns: user.name and user.age. Arrays within objects are joined with semicolons: {"tags": ["a","b"]} becomes tags = "a;b".',
  },
  {
    q: 'Can I open the CSV in Excel?',
    a: 'Yes. The output is standard RFC 4180 CSV with comma delimiters and double-quote escaping. You can open it directly in Excel, Google Sheets, or any spreadsheet application. Values that contain commas or quotes are properly enclosed in double quotes.',
  },
  {
    q: 'Is there a size limit for JSON to CSV conversion?',
    a: 'No hard limit — conversion happens entirely in your browser with no upload. Very large arrays (hundreds of thousands of rows) may be slow depending on your device. For typical API responses and data exports, conversion is instantaneous.',
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
  name: 'How to Convert JSON to CSV Online',
  step: [
    { '@type': 'HowToStep', name: 'Paste your JSON array', text: 'Paste a JSON array of objects into the left panel.' },
    { '@type': 'HowToStep', name: 'Review the CSV output', text: 'The converter extracts headers and rows automatically. Nested objects are flattened with dot notation.' },
    { '@type': 'HowToStep', name: 'Download or copy', text: 'Click Download .csv to save the file, or Copy to copy the CSV text to your clipboard.' },
  ],
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON to CSV Converter',
  url: 'https://formatjson.app/json-to-csv',
  description: 'Free online JSON to CSV converter. Convert JSON arrays to CSV with dot-notation flattening of nested objects. Runs entirely in your browser.',
  applicationCategory: 'DeveloperApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function JsonToCsvPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, '\\u003c') }} />

      <JsonToCsvWrapper />

      <section className="bg-white dark:bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
          <FAQ questions={faqItems} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
          <AdBanner slot="2345610987" />
        </div>
      </section>

      <Footer />
    </>
  )
}
