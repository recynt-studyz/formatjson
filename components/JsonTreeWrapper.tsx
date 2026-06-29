'use client'

import dynamic from 'next/dynamic'

const JsonTreeTool = dynamic(() => import('./JsonTreeTool'), { ssr: false })

export default function JsonTreeWrapper() {
  return <JsonTreeTool />
}
