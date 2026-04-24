import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const type = searchParams.get('type')
    const channel = searchParams.get('channel')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (channel) where.channel = channel
    if (status) where.status = status

    const [logs, total] = await Promise.all([
      db.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notificationLog.count({ where }),
    ])

    return Response.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Notification logs error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat log notifikasi' },
      { status: 500 }
    )
  }
}
