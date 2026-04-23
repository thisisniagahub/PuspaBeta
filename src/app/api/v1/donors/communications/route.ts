import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const communicationSchema = z.object({
  donorId: z.string().min(1, 'ID penderma diperlukan'),
  type: z.string().min(1, 'Jenis komunikasi diperlukan'),
  subject: z.string().min(1, 'Subjek diperlukan'),
  content: z.string().optional(),
  status: z.string().optional(),
  sentBy: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const donorId = searchParams.get('donorId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (donorId) where.donorId = donorId
    if (type) where.type = type

    const [communications, total] = await Promise.all([
      db.donorCommunication.findMany({
        where,
        include: { donor: { select: { id: true, name: true, donorNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.donorCommunication.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { communications, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Donor communications GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan komunikasi penderma' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = communicationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const donor = await db.donor.findFirst({ where: { id: data.donorId, isDeleted: false } })
    if (!donor) return NextResponse.json({ success: false, error: 'Penderma tidak dijumpai' }, { status: 404 })

    const communication = await db.donorCommunication.create({
      data: {
        donorId: data.donorId,
        type: data.type,
        subject: data.subject,
        content: data.content,
        status: data.status ?? 'sent',
        sentAt: new Date(),
        sentBy: data.sentBy,
      },
    })

    return NextResponse.json({ success: true, data: communication }, { status: 201 })
  } catch (error) {
    console.error('Donor communications POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta komunikasi penderma' }, { status: 500 })
  }
}
