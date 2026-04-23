import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const primarySchema = z.object({
  deviceId: z.string().min(1, 'ID peranti diperlukan'),
  userId: z.string().min(1, 'ID pengguna diperlukan'),
})

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = primarySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { deviceId, userId } = parsed.data

    const device = await db.deviceBinding.findFirst({ where: { id: deviceId, userId, isActive: true } })
    if (!device) return NextResponse.json({ success: false, error: 'Peranti tidak dijumpai' }, { status: 404 })

    // Unset all primary devices for this user
    await db.deviceBinding.updateMany({
      where: { userId, isActive: true },
      data: { isPrimary: false },
    })

    // Set the selected device as primary
    const updated = await db.deviceBinding.update({
      where: { id: deviceId },
      data: { isPrimary: true },
    })

    // Create security log
    await db.securityLog.create({
      data: {
        userId,
        action: 'device_primary_change',
        method: 'device_bind',
        deviceFingerprint: device.deviceFingerprint,
        status: 'success',
        details: JSON.stringify({ deviceId, deviceName: device.deviceName }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('TapSecure primary device error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menetapkan peranti utama' }, { status: 500 })
  }
}
