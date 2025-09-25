import { NextResponse } from 'next/server'
import path from 'path'
import { stat, readFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Resuelve el directorio "public" del proyecto en producción/desarrollo
async function resolvePublicDir(): Promise<string> {
  // 1) Intento ascendiendo desde el archivo compilado (.next/server/...)
  try {
    const __filename = fileURLToPath(import.meta.url)
    let dir = path.dirname(__filename)
    for (let i = 0; i < 10; i++) {
      const publicDir = path.join(dir, 'public')
      try {
        const st = await stat(publicDir)
        if (st.isDirectory()) {
          return publicDir
        }
      } catch {}
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  } catch {}

  // 2) Intento con process.cwd()
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const st = await stat(publicDir)
    if (st.isDirectory()) return publicDir
  } catch {}

  // 3) Fallback: crearla si no existe (no debería ocurrir)
  const fallback = path.join(process.cwd(), 'public')
  await mkdir(fallback, { recursive: true })
  return fallback
}

// Seguridad básica: impedir path traversal
function isSafeRelativePath(relPath: string) {
  if (!relPath) return false
  if (relPath.includes('..')) return false
  // Limitar al prefijo permitido
  return relPath.startsWith('uploads/loan-docs/')
}

function contentTypeByExt(ext: string): string {
  switch (ext.toLowerCase()) {
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

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const url = new URL(request.url)
    const download = url.searchParams.get('download')

    const params = await context.params
    const parts = Array.isArray(params.path) ? params.path : [params.path as any]
    const relPath = parts.join('/')

    if (!isSafeRelativePath(relPath)) {
      return NextResponse.json({ error: 'Ruta no permitida' }, { status: 403 })
    }

    const publicDir = await resolvePublicDir()
    const fullPath = path.join(publicDir, relPath)

    let st
    try {
      st = await stat(fullPath)
    } catch {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    if (!st.isFile()) {
      return NextResponse.json({ error: 'Recurso inválido' }, { status: 400 })
    }

    const ext = path.extname(fullPath)
    const ct = contentTypeByExt(ext)
    const buf = await readFile(fullPath)

    const headers = new Headers()
    headers.set('Content-Type', ct)
    headers.set('Content-Length', String(buf.length))
    headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')

    const filenameStored = path.basename(fullPath)

    // Permitir sugerir nombre original via ?name=...
    const requestedName = url.searchParams.get('name') || url.searchParams.get('filename') || ''

    function stripPath(input: string) {
      return input.replace(/[\\/]/g, '')
    }
    function ensureExt(name: string, ext: string) {
      const lower = name.toLowerCase()
      const lowerExt = ext.toLowerCase()
      if (lower.endsWith(lowerExt)) return name
      // quita extensión existente breve para evitar duplicados
      const base = name.replace(/\.[^.\s]{1,10}$/,'')
      return base + ext
    }
    function sanitizeAscii(name: string) {
      const ascii = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return ascii.replace(/[^A-Za-z0-9._\-\s]/g,'-').replace(/\s+/g,' ').trim() || 'archivo'
    }

    let downloadName = filenameStored
    if (requestedName) {
      const unicodeName = ensureExt(stripPath(requestedName), ext)
      const asciiName = sanitizeAscii(unicodeName)
      // RFC 5987 con fallback ASCII
      headers.set('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(unicodeName)}`)
    } else {
      headers.set('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${downloadName}"`)
    }

    // Usar Uint8Array (ArrayBufferView) compatible con BodyInit
    const body = new Uint8Array(buf)
    return new Response(body, { status: 200, headers })
  } catch (err) {
    console.error('❌ Error sirviendo archivo:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
