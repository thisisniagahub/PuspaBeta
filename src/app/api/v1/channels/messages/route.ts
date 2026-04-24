import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const direction = searchParams.get('direction')
    const isProcessed = searchParams.get('isProcessed')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (channel) where.channel = channel
    if (direction) where.direction = direction
    if (isProcessed !== null && isProcessed !== undefined) {
      where.isProcessed = isProcessed === 'true'
    }

    const [messages, total] = await Promise.all([
      db.channelMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.channelMessage.count({ where }),
    ])

    return Response.json({
      success: true,
      data: messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Channel messages error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat mesej saluran' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      channel,
      direction,
      fromId,
      toId,
      content,
      messageType,
      metadata,
      agentName,
      sessionId,
    } = body

    if (!channel || !direction || !content) {
      return Response.json(
        { success: false, error: 'Saluran, arah dan kandungan diperlukan' },
        { status: 400 }
      )
    }

    const validChannels = ['whatsapp', 'telegram', 'web', 'sms']
    if (!validChannels.includes(channel)) {
      return Response.json(
        { success: false, error: `Saluran tidak sah: ${channel}` },
        { status: 400 }
      )
    }

    const validDirections = ['inbound', 'outbound']
    if (!validDirections.includes(direction)) {
      return Response.json(
        { success: false, error: `Arah tidak sah: ${direction}` },
        { status: 400 }
      )
    }

    const message = await db.channelMessage.create({
      data: {
        channel,
        direction,
        fromId: fromId || null,
        toId: toId || null,
        content,
        messageType: messageType || 'text',
        metadata: metadata ? JSON.stringify(metadata) : null,
        agentName: agentName || null,
        sessionId: sessionId || null,
        isProcessed: direction === 'outbound',
      },
    })

    return Response.json({ success: true, data: message })
  } catch (error) {
    console.error('Create channel message error:', error)
    return Response.json(
      { success: false, error: 'Ralat mencipta mesej saluran' },
      { status: 500 }
    )
  }
}
