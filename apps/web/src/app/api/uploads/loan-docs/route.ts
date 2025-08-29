import { NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'

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

async function ensureAuth() {
  const hdrs = await headers()
  let userId = hdrs.get('x-user-id')
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

    const form = await request.formData()
    const all = form.getAll('files')
    const files = all.filter((f): f is File => f instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Máximo ${MAX_FILES} archivos` }, { status: 400 })
    }

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'loan-docs')
    await fs.mkdir(baseDir, { recursive: true })

    const saved: Array<{ name: string; size: number; type: string; url: string; storagePath: string } > = []

    for (const file of files) {
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json({ error: `Tipo no permitido: ${file.type}` }, { status: 400 })
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: `El archivo ${file.name} excede 10MB` }, { status: 400 })
      }

      const unique = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizeFileName(file.name)}`
      const destPath = path.join(baseDir, unique)
      const arrayBuf = await file.arrayBuffer()
      await fs.writeFile(destPath, Buffer.from(arrayBuf))

      const publicUrl = `/uploads/loan-docs/${unique}`
      saved.push({
        name: file.name,
        size: file.size,
        type: file.type,
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
