import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const rejectSchema = z.object({
  id: z.string().min(1, 'ID pengesahan diperlukan'),
  rejectionReason: z.string().min(1, 'Sebab penolakan diperlukan'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = rejectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { id, rejectionReason } = parsed.data

    const existing = await db.eKYCVerification.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Pengesahan eKYC tidak dijumpai' }, { status: 404 })
    if (existing.status === 'verified') return NextResponse.json({ success: false, error: 'Pengesahan sudah disahkan, tidak boleh ditolak' }, { status: 400 })

    let defaultUser = await db.user.findFirst()
    if (!defaultUser) {
      defaultUser = await db.user.create({ data: { email: 'admin@puspa.org', password: 'default', name: 'Admin PUSPA', role: 'admin' } })
    }

    const verification = await db.eKYCVerification.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason,
        verifiedBy: defaultUser.id,
        verifiedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: verification })
  } catch (error) {
    console.error('eKYC reject error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menolak eKYC' }, { status: 500 })
  }
}
