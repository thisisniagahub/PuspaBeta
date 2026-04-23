import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const notificationSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  message: z.string().min(1, 'Mesej diperlukan'),
  type: z.string().optional(),
  userId: z.string().optional(),
  link: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const isRead = searchParams.get('isRead')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true'

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { notifications, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan notifikasi' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.notification.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Notifikasi tidak dijumpai' }, { status: 404 })

    const notification = await db.notification.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Notifications PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini notifikasi' }, { status: 500 })
  }
}
