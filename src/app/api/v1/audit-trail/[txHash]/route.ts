import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  try {
    const { txHash } = await params

    const entry = await db.auditTrail.findUnique({
      where: { txHash },
    })

    if (!entry) {
      return Response.json(
        { success: false, error: 'Transaksi tidak dijumpai' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: {
        ...entry,
        metadata: entry.metadata ? JSON.parse(entry.metadata) : null,
      },
    })
  } catch (error) {
    console.error('Get audit trail by hash error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat transaksi' },
      { status: 500 }
    )
  }
}
