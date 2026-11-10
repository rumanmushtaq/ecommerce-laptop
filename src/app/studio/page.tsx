import { notFound } from 'next/navigation'
import StudioClient from './StudioClient'

// Dev-only render studio: renders every product variant and saves the frames to public/renders.
export default function StudioPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <StudioClient />
}
