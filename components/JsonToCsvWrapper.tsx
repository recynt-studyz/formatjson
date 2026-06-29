'use client'

import dynamic from 'next/dynamic'

const JsonToCsvTool = dynamic(() => import('./JsonToCsvTool'), { ssr: false })

export default function JsonToCsvWrapper() {
  return <JsonToCsvTool />
}
