import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`
    const ok = Array.isArray(rows) && rows.length > 0 && rows[0]?.ok === 1
    return NextResponse.json({ ok: true, db: ok }, { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
