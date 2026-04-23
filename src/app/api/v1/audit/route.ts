import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (entity) where.entity = entity
    if (userId) where.userId = userId

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { logs, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Audit GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan log audit' }, { status: 500 })
  }
}
