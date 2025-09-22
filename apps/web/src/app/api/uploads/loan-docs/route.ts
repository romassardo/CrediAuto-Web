import { NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

// Aseguramos Node.js runtime para usar fs
export const runtime = 'nodejs'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '')
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '')

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 10

function sanitizeFileName(name: string) {
  const parts = name.split('.')
  const ext = parts.length > 1 ? '.' + parts.pop()!.toLowerCase() : ''
  const base = parts.join('.')
  const safeBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${safeBase}${ext}`
}

// En runtime Node.js, el objeto global File puede no existir.
// Usamos una verificación basada en la presencia de arrayBuffer() para detectar blobs/archivos compatibles.
function isLikeFile(input: unknown): input is { arrayBuffer: () => Promise<ArrayBuffer> } {
  const anyVal = input as any
  return !!anyVal && typeof anyVal === 'object' && typeof anyVal.arrayBuffer === 'function'
}

// Resuelve la carpeta apps/web/public/uploads/loan-docs de forma robusta
// subiendo desde el archivo compilado (.next/server/app/...) hasta encontrar "public"
async function resolveUploadsDir(): Promise<string> {
  // 1) Intento directo con process.cwd() si ya apunta al proyecto de Next
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const stat = await fs.stat(publicDir)
    if (stat.isDirectory()) {
      const target = path.join(publicDir, 'uploads', 'loan-docs')
      await fs.mkdir(target, { recursive: true })
      return target
    }
  } catch {}

  // 2) Buscar directorio que contenga "public" ascendiendo desde el archivo actual
  try {
    const __filename = fileURLToPath(import.meta.url)
    let dir = path.dirname(__filename)
    // subir hasta 10 niveles como máximo
    for (let i = 0; i < 10; i++) {
      const publicDir = path.join(dir, 'public')
      try {
        const st = await fs.stat(publicDir)
        if (st.isDirectory()) {
          const target = path.join(publicDir, 'uploads', 'loan-docs')
          await fs.mkdir(target, { recursive: true })
          return target
        }
      } catch {}
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  } catch {}

  // 3) Fallback: crear en process.cwd()/public/uploads/loan-docs
  const fallback = path.join(process.cwd(), 'public', 'uploads', 'loan-docs')
  await fs.mkdir(fallback, { recursive: true })
  return fallback
}

async function ensureAuth() {
  const hdrs = await headers()
  const userId = hdrs.get('x-user-id')
  if (userId) return { userId }
  try {
    const cookieStore = await cookies()
    const access = cookieStore.get('access_token')?.value
    if (access) {
      const { payload } = await jwtVerify(access, JWT_SECRET)
      const pUserId = (payload as any).userId
      if (pUserId) return { userId: String(pUserId) }
    }
    const refresh = cookieStore.get('refresh_token')?.value
    if (refresh) {
      const { payload } = await jwtVerify(refresh, JWT_REFRESH_SECRET)
      const pUserId = (payload as any).userId
      if (pUserId) return { userId: String(pUserId) }
    }
  } catch (e) {
    console.error('❌ Auth error in upload route:', e)
  }
  return { userId: null }
}

export async function POST(request: Request) {
  try {
    const { userId } = await ensureAuth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let form: FormData
    try {
      form = await request.formData()
    } catch (e) {
      console.error('❌ Error parseando FormData:', e)
      return NextResponse.json({ error: 'Formulario inválido: no se pudo leer los datos' }, { status: 400 })
    }

    const all = form.getAll('files')
    const files = all.filter(isLikeFile) as Array<{
      arrayBuffer: () => Promise<ArrayBuffer>
      type?: string
      size?: number
      name?: string
    }>

    if (all.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos (campo files ausente)' }, { status: 400 })
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos válidos', details: 'Los elementos enviados no son archivos' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Máximo ${MAX_FILES} archivos` }, { status: 400 })
    }

    let baseDir: string
    try {
      baseDir = await resolveUploadsDir()
    } catch (e) {
      console.error('❌ Error resolviendo directorio de destino:', e)
      return NextResponse.json({ error: 'No se pudo preparar el almacenamiento de archivos' }, { status: 500 })
    }

    const saved: Array<{ name: string; size: number; type: string; url: string; storagePath: string } > = []

    for (const file of files) {
      const mime = typeof (file as any).type === 'string' ? (file as any).type : 'application/octet-stream'
      if (!ALLOWED_MIME.has(mime)) {
        return NextResponse.json({ error: `Tipo no permitido: ${mime}`, allowed: Array.from(ALLOWED_MIME) }, { status: 415 })
      }
      const size = typeof (file as any).size === 'number' ? (file as any).size : 0
      const originalName = typeof (file as any).name === 'string' ? (file as any).name : 'archivo.bin'
      if (size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: `El archivo ${originalName} excede el máximo permitido (10MB)`, maxBytes: MAX_FILE_SIZE_BYTES }, { status: 413 })
      }

      const unique = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizeFileName(originalName)}`
      const destPath = path.join(baseDir, unique)
      const arrayBuf = await file.arrayBuffer()
      try {
        await fs.writeFile(destPath, Buffer.from(arrayBuf))
      } catch (e: any) {
        console.error('❌ Error escribiendo archivo en disco:', e)
        return NextResponse.json({ error: 'No se pudo guardar el archivo', code: (e && e.code) || 'FS_ERROR' }, { status: 500 })
      }

      const publicUrl = `/uploads/loan-docs/${unique}`
      saved.push({
        name: originalName,
        size,
        type: mime,
        url: publicUrl,
        storagePath: `uploads/loan-docs/${unique}`,
      })
    }

    return NextResponse.json({ success: true, files: saved }, { status: 201 })
  } catch (error) {
    console.error('❌ Error en subida de archivos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
