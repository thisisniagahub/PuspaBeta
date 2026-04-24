import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get message counts by channel
    const channels = ['whatsapp', 'telegram', 'web', 'sms']

    const stats = await Promise.all(
      channels.map(async (channel) => {
        const [inbound, outbound, unprocessed] = await Promise.all([
          db.channelMessage.count({
            where: { channel, direction: 'inbound' },
          }),
          db.channelMessage.count({
            where: { channel, direction: 'outbound' },
          }),
          db.channelMessage.count({
            where: { channel, isProcessed: false },
          }),
        ])
        return { channel, inbound, outbound, unprocessed, total: inbound + outbound }
      })
    )

    const totalMessages = stats.reduce((sum, s) => sum + s.total, 0)

    return Response.json({
      success: true,
      data: {
        byChannel: stats,
        total: totalMessages,
      },
    })
  } catch (error) {
    console.error('Channel stats error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat statistik saluran' },
      { status: 500 }
    )
  }
}
