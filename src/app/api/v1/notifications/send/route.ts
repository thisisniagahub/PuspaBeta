import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, channel, recipient, title, message, priority, data } = body

    if (!type || !channel || !recipient || !title || !message) {
      return Response.json(
        {
          success: false,
          error: 'Jenis, saluran, penerima, tajuk dan mesej diperlukan',
        },
        { status: 400 }
      )
    }

    const validChannels = ['in-app', 'whatsapp', 'telegram', 'email', 'sms']
    if (!validChannels.includes(channel)) {
      return Response.json(
        { success: false, error: `Saluran tidak sah: ${channel}` },
        { status: 400 }
      )
    }

    // For WhatsApp/Telegram, we save the notification (actual sending requires external API)
    const isRealtimeChannel = channel === 'whatsapp' || channel === 'telegram'
    const status = isRealtimeChannel ? 'pending' : 'sent'

    const notification = await db.notificationLog.create({
      data: {
        type,
        channel,
        recipient,
        title,
        message,
        priority: priority || 'medium',
        status,
        data: data ? JSON.stringify(data) : null,
        sentAt: status === 'sent' ? new Date() : null,
      },
    })

    // Also create an in-app notification if it's for a user
    if (channel === 'in-app' || channel === 'email') {
      try {
        await db.notification.create({
          data: {
            title,
            message,
            type: priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'info',
            userId: recipient,
          },
        })
      } catch {
        // Non-critical: in-app notification is optional
      }
    }

    return Response.json({
      success: true,
      data: notification,
      meta: {
        channelSupported: isRealtimeChannel
          ? 'Penghantaran sebenar memerlukan API luaran'
          : 'Notifikasi dihantar',
      },
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return Response.json(
      { success: false, error: 'Ralat menghantar notifikasi' },
      { status: 500 }
    )
  }
}
