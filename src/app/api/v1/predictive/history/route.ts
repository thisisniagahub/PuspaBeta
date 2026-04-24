import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelType = searchParams.get('modelType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (modelType) where.modelType = modelType

    const [predictions, total] = await Promise.all([
      db.predictionData.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.predictionData.count({ where }),
    ])

    return Response.json({
      success: true,
      data: predictions.map((p) => ({
        ...p,
        inputSnapshot: JSON.parse(p.inputSnapshot),
        prediction: JSON.parse(p.prediction),
        actualValue: p.actualValue ? JSON.parse(p.actualValue) : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Prediction history error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat sejarah ramalan' },
      { status: 500 }
    )
  }
}
