import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const channel = searchParams.get('channel')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (channel) where.channel = channel

    const [sessions, total] = await Promise.all([
      db.onboardingSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.onboardingSession.count({ where }),
    ])

    return Response.json({
      success: true,
      data: sessions.map((s) => ({ ...s, data: JSON.parse(s.data) })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('List onboarding sessions error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat sesi onboarding' },
      { status: 500 }
    )
  }
}
