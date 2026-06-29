const faqs = [
  {
    q: 'What is a JSON formatter?',
    a: 'A JSON formatter (also called a JSON beautifier or JSON pretty printer) takes raw, compact JSON text and adds indentation and line breaks to make it human-readable. formatjson.app formats your JSON instantly in the browser using native JavaScript — no server required.',
  },
  {
    q: 'How do I format JSON online?',
    a: 'Paste your JSON into the left panel on formatjson.app. The json formatter validates and formats it automatically as you type, with 2-space indentation by default. You can also switch to 4-space or tab indentation, then copy or download the result.',
  },
  {
    q: 'How do I validate JSON?',
    a: 'Switch to Validate mode using the toolbar above the panels. The json validator will tell you immediately whether your JSON is valid or invalid. If invalid, it shows a plain-English description of the error including the line and position where the problem was found.',
  },
  {
    q: 'Is my JSON sent to a server?',
    a: 'No. formatjson.app is a fully client-side tool. JSON never leaves your browser — all formatting, validation, and minification is performed using native JavaScript (JSON.parse and JSON.stringify) directly in your browser tab. You can disconnect from the internet after the page loads and the tool will still work.',
  },
  {
    q: 'What is JSON minification?',
    a: 'JSON minification removes all unnecessary whitespace and line breaks, producing the smallest possible valid JSON string. This is useful when transmitting JSON over a network to reduce payload size. Use the Minify mode to minify your JSON instantly.',
  },
  {
    q: 'How do I fix a JSON error?',
    a: 'Switch to Validate mode to see a plain-English description of the error. Common issues include: trailing commas after the last item in an object or array (not allowed in JSON), single quotes instead of double quotes for strings, unquoted property names, and missing or mismatched brackets and braces.',
  },
  {
    q: 'What causes "Unexpected token" errors in JSON?',
    a: '"Unexpected token" errors usually mean the parser encountered a character it did not expect. Common causes: a trailing comma after the last element, a JavaScript-style comment (JSON does not support comments), an unquoted string, a single-quoted string, or a missing comma between elements.',
  },
  {
    q: 'Can I format a JSON file by uploading it?',
    a: 'Yes. Drag and drop any .json file onto the left input panel. The file is read locally by your browser — it is not uploaded anywhere. The contents are loaded into the formatter immediately and formatted according to your current mode and indent settings.',
  },
  {
    q: 'What is the difference between JSON formatter and JSON validator?',
    a: 'A json formatter adds indentation and line breaks to make JSON readable, while a json validator checks whether the JSON syntax is correct. formatjson.app does both: formatting automatically validates, and the dedicated Validate mode gives a focused pass/fail result with detailed error messages.',
  },
  {
    q: 'Is formatjson.app completely free?',
    a: 'Yes, completely free. No account, no signup, no file size limits, no watermarks. The tool is ad-supported to remain free for everyone.',
  },
  {
    q: 'Does formatjson.app work offline?',
    a: 'After the page loads, yes. All JSON processing uses native browser APIs (JSON.parse and JSON.stringify) with no network calls. You can disconnect from the internet and continue formatting and validating JSON without interruption.',
  },
]

export default function FAQ() {
  return (
    <section className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium text-gray-800 dark:text-[#e2e8f0] hover:text-[#2563EB] dark:hover:text-blue-400 transition">
              {faq.q}
              <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </summary>
            <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
