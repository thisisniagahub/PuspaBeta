import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const status = {
      service: 'OpenClaw Bridge',
      status: 'operational',
      version: '1.0.0',
      uptime: process.uptime(),
      lastSync: new Date().toISOString(),
      connections: {
        primary: true,
        secondary: false,
      },
      capabilities: [
        'snapshot',
        'sync',
        'webhook',
        'analytics',
      ],
      rateLimit: {
        remaining: 100,
        total: 100,
        resetAt: new Date(Date.now() + 3600000).toISOString(),
      },
    }

    return NextResponse.json({ success: true, data: status })
  } catch (error) {
    console.error('OpenClaw status error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan status OpenClaw' }, { status: 500 })
  }
}
