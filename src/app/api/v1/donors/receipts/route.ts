import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const receiptSchema = z.object({
  donorId: z.string().min(1, 'ID penderma diperlukan'),
  donationId: z.string().optional(),
  amount: z.number().min(0.01, 'Jumlah mesti lebih daripada 0'),
  donationDate: z.string().min(1, 'Tarikh sumbangan diperlukan'),
  purpose: z.string().optional(),
  lhdnRef: z.string().optional(),
  issuedBy: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const donorId = searchParams.get('donorId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (donorId) where.donorId = donorId

    const [receipts, total] = await Promise.all([
      db.taxReceipt.findMany({
        where,
        include: { donor: { select: { id: true, name: true, donorNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { issuedAt: 'desc' },
      }),
      db.taxReceipt.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { receipts, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Tax receipts GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan resit cukai' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = receiptSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const donor = await db.donor.findFirst({ where: { id: data.donorId, isDeleted: false } })
    if (!donor) return NextResponse.json({ success: false, error: 'Penderma tidak dijumpai' }, { status: 404 })

    const year = new Date().getFullYear()
    const existingCount = await db.taxReceipt.count({
      where: { receiptNumber: { startsWith: `TR-${year}-` } },
    })
    const receiptNumber = `TR-${year}-${String(existingCount + 1).padStart(4, '0')}`

    const receipt = await db.taxReceipt.create({
      data: {
        receiptNumber,
        donorId: data.donorId,
        donationId: data.donationId,
        amount: data.amount,
        donationDate: new Date(data.donationDate),
        purpose: data.purpose ?? 'Sumbangan amal kepada PUSPA',
        lhdnRef: data.lhdnRef,
        issuedBy: data.issuedBy,
      },
    })

    return NextResponse.json({ success: true, data: receipt }, { status: 201 })
  } catch (error) {
    console.error('Tax receipts POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta resit cukai' }, { status: 500 })
  }
}
