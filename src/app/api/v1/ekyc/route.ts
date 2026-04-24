import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const ekycSchema = z.object({
  memberId: z.string().min(1, 'ID ahli diperlukan'),
  icFrontUrl: z.string().optional(),
  icBackUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [verifications, total] = await Promise.all([
      db.eKYCVerification.findMany({
        where,
        include: { member: { select: { id: true, name: true, ic: true, memberNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.eKYCVerification.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { verifications, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('eKYC GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan pengesahan eKYC' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ekycSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data

    const member = await db.member.findFirst({ where: { id: data.memberId, isDeleted: false } })
    if (!member) return NextResponse.json({ success: false, error: 'Ahli tidak dijumpai' }, { status: 404 })

    const existing = await db.eKYCVerification.findUnique({ where: { memberId: data.memberId } })
    if (existing) return NextResponse.json({ success: false, error: 'Pengesahan eKYC sudah wujud untuk ahli ini' }, { status: 409 })

    const verification = await db.eKYCVerification.create({
      data: {
        memberId: data.memberId,
        icFrontUrl: data.icFrontUrl,
        icBackUrl: data.icBackUrl,
        selfieUrl: data.selfieUrl,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, data: verification }, { status: 201 })
  } catch (error) {
    console.error('eKYC POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta pengesahan eKYC' }, { status: 500 })
  }
}
