'use client'

import dynamic from 'next/dynamic'

const RepairTool = dynamic(() => import('./RepairTool'), { ssr: false })

export default function RepairWrapper() {
  return <RepairTool />
}
