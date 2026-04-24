import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txType = searchParams.get('txType')
    const fundType = searchParams.get('fundType')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (txType) where.txType = txType
    if (fundType) where.fundType = fundType
    if (status) where.status = status

    const [entries, total] = await Promise.all([
      db.auditTrail.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.auditTrail.count({ where }),
    ])

    return Response.json({
      success: true,
      data: entries.map((e) => ({
        ...e,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Audit trail list error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat jejak audit' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txType, fromEntity, toEntity, amount, currency, fundType, metadata } = body

    if (!txType || !fromEntity || !toEntity || amount === undefined) {
      return Response.json(
        { success: false, error: 'Jenis transaksi, entiti asal, entiti tujuan dan jumlah diperlukan' },
        { status: 400 }
      )
    }

    const validTxTypes = ['donation', 'disbursement', 'transfer', 'refund']
    if (!validTxTypes.includes(txType)) {
      return Response.json(
        { success: false, error: `Jenis transaksi tidak sah: ${txType}` },
        { status: 400 }
      )
    }

    // Generate a unique txHash
    const crypto = await import('crypto')
    const timestamp = Date.now().toString(36)
    const randomStr = crypto.randomBytes(8).toString('hex')
    const txHash = `TX-${timestamp}-${randomStr}`

    // Get next block number
    const lastBlock = await db.auditTrail.findFirst({
      orderBy: { blockNumber: 'desc' },
      select: { blockNumber: true },
    })
    const blockNumber = (lastBlock?.blockNumber || 0) + 1

    const entry = await db.auditTrail.create({
      data: {
        txHash,
        txType,
        fromEntity,
        toEntity,
        amount: Number(amount),
        currency: currency || 'MYR',
        fundType: fundType || 'general',
        status: 'pending',
        blockNumber,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return Response.json({
      success: true,
      data: {
        ...entry,
        metadata: entry.metadata ? JSON.parse(entry.metadata) : null,
      },
    })
  } catch (error) {
    console.error('Create audit trail error:', error)
    return Response.json(
      { success: false, error: 'Ralat mencipta jejak audit' },
      { status: 500 }
    )
  }
}
