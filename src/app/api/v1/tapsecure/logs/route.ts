import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (action) where.action = action

    const [logs, total] = await Promise.all([
      db.securityLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.securityLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { logs, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('TapSecure logs GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan log keselamatan' }, { status: 500 })
  }
}
