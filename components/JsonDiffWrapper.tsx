'use client'

import dynamic from 'next/dynamic'

const JsonDiffTool = dynamic(() => import('./JsonDiffTool'), { ssr: false })

export default function JsonDiffWrapper() {
  return <JsonDiffTool />
}
