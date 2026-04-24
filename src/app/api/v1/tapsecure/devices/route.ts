import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const deviceSchema = z.object({
  userId: z.string().min(1, 'ID pengguna diperlukan'),
  deviceName: z.string().optional(),
  deviceType: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  isPrimary: z.boolean().optional(),
  isTrusted: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = { isActive: true }
    if (userId) where.userId = userId

    const devices = await db.deviceBinding.findMany({
      where,
      orderBy: [{ isPrimary: 'desc' }, { lastUsedAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data: devices })
  } catch (error) {
    console.error('TapSecure devices GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan peranti' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = deviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const user = await db.user.findUnique({ where: { id: data.userId } })
    if (!user) return NextResponse.json({ success: false, error: 'Pengguna tidak dijumpai' }, { status: 404 })

    // Check existing device count
    const existingCount = await db.deviceBinding.count({
      where: { userId: data.userId, isActive: true },
    })
    if (existingCount >= 5) return NextResponse.json({ success: false, error: 'Had maksimum 5 peranti dicapai' }, { status: 400 })

    const isFirst = existingCount === 0

    const device = await db.deviceBinding.create({
      data: {
        userId: data.userId,
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        deviceFingerprint: data.deviceFingerprint,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        location: data.location,
        isPrimary: data.isPrimary ?? isFirst,
        isTrusted: data.isTrusted ?? false,
      },
    })

    // Create security log
    await db.securityLog.create({
      data: {
        userId: data.userId,
        action: 'device_bind',
        method: 'device_bind',
        deviceFingerprint: data.deviceFingerprint,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: 'success',
        details: JSON.stringify({ deviceName: data.deviceName, deviceType: data.deviceType }),
      },
    })

    return NextResponse.json({ success: true, data: device }, { status: 201 })
  } catch (error) {
    console.error('TapSecure devices POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mendaftar peranti' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.deviceBinding.findFirst({ where: { id, isActive: true } })
    if (!existing) return NextResponse.json({ success: false, error: 'Peranti tidak dijumpai' }, { status: 404 })

    const device = await db.deviceBinding.update({ where: { id }, data: { isActive: false } })

    // Create security log
    await db.securityLog.create({
      data: {
        userId: existing.userId,
        action: 'device_unbind',
        method: 'device_bind',
        deviceFingerprint: existing.deviceFingerprint,
        status: 'success',
        details: JSON.stringify({ deviceName: existing.deviceName }),
      },
    })

    return NextResponse.json({ success: true, data: device })
  } catch (error) {
    console.error('TapSecure devices DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menyahdaftar peranti' }, { status: 500 })
  }
}
