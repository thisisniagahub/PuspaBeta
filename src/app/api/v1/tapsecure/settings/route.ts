import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const settingsSchema = z.object({
  userId: z.string().min(1, 'ID pengguna diperlukan'),
  biometricTransactions: z.boolean().optional(),
  boundDeviceOnly: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(120).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ success: false, error: 'ID pengguna diperlukan' }, { status: 400 })

    let settings = await db.securitySettings.findUnique({ where: { userId } })
    if (!settings) {
      settings = await db.securitySettings.create({
        data: { userId },
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('TapSecure settings GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan tetapan keselamatan' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { userId, ...updateData } = parsed.data

    let settings = await db.securitySettings.findUnique({ where: { userId } })
    if (!settings) {
      settings = await db.securitySettings.create({
        data: { userId, ...updateData },
      })
    } else {
      settings = await db.securitySettings.update({
        where: { userId },
        data: updateData,
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('TapSecure settings PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini tetapan keselamatan' }, { status: 500 })
  }
}
