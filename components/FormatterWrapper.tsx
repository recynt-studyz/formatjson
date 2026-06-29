'use client'

import dynamic from 'next/dynamic'

const Formatter = dynamic(() => import('./Formatter'), { ssr: false })

export default function FormatterWrapper() {
  return <Formatter />
}
