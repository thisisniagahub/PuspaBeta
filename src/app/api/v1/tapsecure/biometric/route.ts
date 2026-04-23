import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const biometricSchema = z.object({
  userId: z.string().min(1, 'ID pengguna diperlukan'),
  method: z.enum(['fingerprint', 'face', 'webauthn']),
  deviceFingerprint: z.string().optional(),
  challenge: z.string().optional(),
  response: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = biometricSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { userId, method, deviceFingerprint } = parsed.data

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ success: false, error: 'Pengguna tidak dijumpai' }, { status: 404 })

    // Simulated biometric verification
    const verified = true // In production, verify against stored biometric data
    const score = 0.95

    // Create security log
    await db.securityLog.create({
      data: {
        userId,
        action: 'biometric_verify',
        method,
        deviceFingerprint,
        status: verified ? 'success' : 'failed',
        details: JSON.stringify({ method, score }),
      },
    })

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Pengesahan biometrik gagal' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: { verified: true, method, score, verifiedAt: new Date().toISOString() },
    })
  } catch (error) {
    console.error('TapSecure biometric error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengesahkan biometrik' }, { status: 500 })
  }
}
