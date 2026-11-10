import fs from 'node:fs'
import path from 'node:path'

// Dev-only: the render studio posts each captured frame here and it lands in public/renders.
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', { status: 404 })
  const { name, data } = (await req.json()) as { name: string; data: string }
  const safe = name.replace(/[^a-z0-9-]/gi, '')
  const dir = path.join(process.cwd(), 'public/renders')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${safe}.webp`), Buffer.from(data.split(',')[1], 'base64'))
  return new Response('ok')
}
