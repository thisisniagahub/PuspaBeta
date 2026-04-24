import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json(
        { success: false, error: 'ID pengguna diperlukan' },
        { status: 400 }
      )
    }

    let preference = await db.notificationPreference.findUnique({
      where: { userId },
    })

    // Create default preferences if none exist
    if (!preference) {
      preference = await db.notificationPreference.create({
        data: {
          userId,
          channels: JSON.stringify({
            'in-app': true,
            whatsapp: false,
            telegram: false,
            email: true,
            sms: false,
          }),
          events: JSON.stringify({
            'case.created': true,
            'donation.received': true,
            'disbursement.approved': true,
            'programme.reminder': true,
            'ekyc.pending': true,
            'compliance.overdue': true,
          }),
          quietStart: '22:00',
          quietEnd: '08:00',
        },
      })
    }

    return Response.json({
      success: true,
      data: {
        ...preference,
        channels: JSON.parse(preference.channels),
        events: JSON.parse(preference.events),
      },
    })
  } catch (error) {
    console.error('Get preferences error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat keutamaan notifikasi' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, channels, events, quietStart, quietEnd } = body

    if (!userId) {
      return Response.json(
        { success: false, error: 'ID pengguna diperlukan' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (channels) updateData.channels = JSON.stringify(channels)
    if (events) updateData.events = JSON.stringify(events)
    if (quietStart !== undefined) updateData.quietStart = quietStart
    if (quietEnd !== undefined) updateData.quietEnd = quietEnd

    const preference = await db.notificationPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        channels: JSON.stringify(channels || { 'in-app': true, email: true }),
        events: JSON.stringify(events || {}),
        quietStart: quietStart || '22:00',
        quietEnd: quietEnd || '08:00',
      },
    })

    return Response.json({
      success: true,
      data: {
        ...preference,
        channels: JSON.parse(preference.channels),
        events: JSON.parse(preference.events),
      },
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return Response.json(
      { success: false, error: 'Ralat mengemaskini keutamaan notifikasi' },
      { status: 500 }
    )
  }
}
