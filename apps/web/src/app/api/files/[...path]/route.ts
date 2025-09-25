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

    const filename = path.basename(fullPath)
    if (download) {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    } else {
      headers.set('Content-Disposition', `inline; filename="${filename}"`)
    }

    // Convertir Buffer a ArrayBuffer exacto para BodyInit compatible
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    return new Response(ab, { status: 200, headers })
  } catch (err) {
    console.error('❌ Error sirviendo archivo:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
