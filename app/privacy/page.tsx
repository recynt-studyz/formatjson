import type { Metadata } from 'next'
import ToolHeader from '@/components/ToolHeader'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — formatjson.app',
  description: 'Privacy policy for formatjson.app. JSON is processed entirely in your browser. Nothing is transmitted to any server.',
  alternates: { canonical: 'https://formatjson.app/privacy' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <>
      <ToolHeader />

      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 bg-white dark:bg-[#0f172a]">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data processing</h2>
            <p>
              All JSON formatting, validation, and minification is performed entirely in your browser
              using native JavaScript (<code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">JSON.parse</code> and{' '}
              <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">JSON.stringify</code>).
              Nothing you type or paste is transmitted to any server. Your JSON never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cookies and advertising</h2>
            <p>
              formatjson.app uses Google AdSense to display advertisements. Google may use cookies to
              serve ads based on your prior visits to this website or other websites. You can opt out of
              personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                className="text-[#2563EB] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ads Settings
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics</h2>
            <p>
              We may use anonymous analytics to understand general usage patterns (page views, browser
              types). No personally identifiable information is collected.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Local storage</h2>
            <p>
              Your dark mode preference is stored in your browser&apos;s{' '}
              <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">localStorage</code> under
              the key <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">formatjson-theme</code>.
              This data never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p>
              If you have questions about this privacy policy, please use the Contact link in the footer.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
