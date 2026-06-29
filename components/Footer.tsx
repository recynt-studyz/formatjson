'use client'

export default function Footer() {
  function handleContact() {
    const parts = ['recyntstudyz', 'gmail', 'com']
    window.location.href = `mailto:${parts[0]}@${parts[1]}.${parts[2]}`
  }

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 py-6 mt-12">
      <p className="text-center text-xs text-gray-400 mb-3 px-4">
        Free online JSON formatter, validator and beautifier. No signup, no upload, no limits.
      </p>
      <div className="max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
        <span className="font-mono">formatjson.app</span>
        <span>·</span>
        <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition">
          Privacy Policy
        </a>
        <span>·</span>
        <a href="/about" className="hover:text-gray-600 dark:hover:text-gray-300 transition">
          About
        </a>
        <span>·</span>
        <button onClick={handleContact} className="hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer">
          Contact
        </button>
      </div>
    </footer>
  )
}
