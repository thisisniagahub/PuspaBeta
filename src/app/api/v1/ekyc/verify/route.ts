import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const verifySchema = z.object({
  id: z.string().min(1, 'ID pengesahan diperlukan'),
  icName: z.string().optional(),
  icNumber: z.string().optional(),
  icAddress: z.string().optional(),
  icDateOfBirth: z.string().optional(),
  icGender: z.string().optional(),
  livenessScore: z.number().optional(),
  livenessMethod: z.string().optional(),
  faceMatchScore: z.number().optional(),
  bnmCompliant: z.boolean().optional(),
  amlaScreening: z.string().optional(),
  riskLevel: z.string().optional(),
  screeningNotes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const { id, ...updateFields } = data

    const existing = await db.eKYCVerification.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Pengesahan eKYC tidak dijumpai' }, { status: 404 })
    if (existing.status === 'verified') return NextResponse.json({ success: false, error: 'Pengesahan sudah disahkan' }, { status: 400 })

    let defaultUser = await db.user.findFirst()
    if (!defaultUser) {
      defaultUser = await db.user.create({ data: { email: 'admin@puspa.org', password: 'default', name: 'Admin PUSPA', role: 'admin' } })
    }

    const verifiedData: Record<string, unknown> = {
      ...updateFields,
      status: 'verified',
      verifiedBy: defaultUser.id,
      verifiedAt: new Date(),
    }

    if (updateFields.icDateOfBirth) {
      verifiedData.icDateOfBirth = new Date(updateFields.icDateOfBirth)
    }

    const verification = await db.eKYCVerification.update({
      where: { id },
      data: verifiedData,
    })

    return NextResponse.json({ success: true, data: verification })
  } catch (error) {
    console.error('eKYC verify error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengesahkan eKYC' }, { status: 500 })
  }
}
