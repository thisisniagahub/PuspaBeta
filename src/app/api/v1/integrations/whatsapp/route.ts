import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const whatsappSchema = z.object({
  to: z.string().min(1, 'Nombor penerima diperlukan'),
  message: z.string().min(1, 'Mesej diperlukan'),
  template: z.string().optional(),
})

export async function GET() {
  try {
    // Simulated WhatsApp integration status
    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        provider: 'WhatsApp Business API (Simulated)',
        phoneNumber: '+60123456789',
        dailyLimit: 1000,
        sentToday: 0,
        templates: [
          { name: 'welcome', language: 'ms', status: 'approved' },
          { name: 'donation_receipt', language: 'ms', status: 'approved' },
          { name: 'appointment_reminder', language: 'ms', status: 'approved' },
          { name: 'ekyc_reminder', language: 'ms', status: 'approved' },
        ],
      },
    })
  } catch (error) {
    console.error('WhatsApp GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan status WhatsApp' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = whatsappSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data

    // Simulated WhatsApp message send
    const result = {
      messageId: `WA-${Date.now()}`,
      to: data.to,
      status: 'sent',
      timestamp: new Date().toISOString(),
      template: data.template || null,
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('WhatsApp POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghantar mesej WhatsApp' }, { status: 500 })
  }
}
