import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

function resolveStoragePath(p: string) {
  // Acepta 'uploads/loan-docs/filename.pdf' o '/uploads/loan-docs/filename.pdf'
  const rel = p.replace(/^\/+/, '')
  // No permitir path traversal
  if (rel.includes('..')) throw new Error('invalid_path')
  // Solo permitir bajo uploads/
  if (!rel.startsWith('uploads/')) throw new Error('forbidden_path')
  const abs = path.join(process.cwd(), 'public', rel)
  return abs
}

function guessContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.pdf':
      return 'application/pdf'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const p = url.searchParams.get('p')
    const download = url.searchParams.get('download') === '1'
    const name = url.searchParams.get('name') || undefined

    if (!p) {
      return NextResponse.json({ error: 'Missing parameter p' }, { status: 400 })
    }

    const abs = resolveStoragePath(p)
    try {
      await stat(abs)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buf = await readFile(abs)
    const contentType = guessContentType(abs)
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', String(buf.length))
    if (download) {
      const filename = name || path.basename(abs)
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    }
    // Convertir Buffer (Node) a Uint8Array (BodyInit aceptado por Response)
    const data = new Uint8Array(buf)
    return new NextResponse(data, { status: 200, headers })
  } catch (e: any) {
    const msg = e?.message || 'Server error'
    const code = msg === 'invalid_path' ? 400 : msg === 'forbidden_path' ? 403 : 500
    return NextResponse.json({ error: msg }, { status: code })
  }
}
