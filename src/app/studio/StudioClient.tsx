'use client'

import dynamic from 'next/dynamic'

const Studio = dynamic(() => import('../../studio/Studio'), { ssr: false })

export default function StudioClient() {
  return <Studio />
}
