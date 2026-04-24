import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (priority) {
      where.priority = priority
    }

    const [results, total] = await Promise.all([
      db.triageResult.findMany({
        where,
        orderBy: { triagedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.triageResult.count({ where }),
    ])

    return Response.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Triage results error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat keputusan triage' },
      { status: 500 }
    )
  }
}
