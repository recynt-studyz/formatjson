import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator — Free, Instant, Private',
  description:
    'Format, validate and beautify JSON instantly in your browser. Free JSON formatter with syntax highlighting, error detection, and minifier. No signup required.',
  keywords: [
    'json formatter',
    'json validator',
    'json beautifier',
    'json pretty print',
    'format json online',
    'json lint',
    'json minify',
    'json parser online',
    'json format checker',
  ],
  metadataBase: new URL('https://formatjson.app'),
  alternates: { canonical: 'https://formatjson.app' },
  openGraph: {
    title: 'JSON Formatter & Validator — Free, Instant, Private',
    description:
      'Format, validate and beautify JSON instantly in your browser. Free JSON formatter with syntax highlighting, error detection, and minifier. No signup required.',
    url: 'https://formatjson.app',
    siteName: 'formatjson.app',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Format & Validate JSON Instantly' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatter & Validator — Free, Instant, Private',
    description: 'Format, validate and beautify JSON instantly in your browser. No signup required.',
    images: ['/twitter-image.png'],
  },
  robots: { index: true, follow: true },
  verification: { google: 'PLACEHOLDER_GOOGLE_SITE_VERIFICATION' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5035661017594256" />
        {/* Prevent dark-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('formatjson-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0f172a] text-gray-900 dark:text-[#e2e8f0]">
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5035661017594256"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
