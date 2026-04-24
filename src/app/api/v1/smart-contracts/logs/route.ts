import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractType = searchParams.get('contractType')
    const canRelease = searchParams.get('canRelease')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (contractType) where.contractType = contractType
    if (canRelease !== null && canRelease !== undefined) {
      where.canRelease = canRelease === 'true'
    }

    const [logs, total] = await Promise.all([
      db.smartContractLog.findMany({
        where,
        orderBy: { evaluatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.smartContractLog.count({ where }),
    ])

    return Response.json({
      success: true,
      data: logs.map((l) => ({
        ...l,
        conditions: JSON.parse(l.conditions),
        evaluationResult: JSON.parse(l.evaluationResult),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Smart contract logs error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat log kontrak pintar' },
      { status: 500 }
    )
  }
}
