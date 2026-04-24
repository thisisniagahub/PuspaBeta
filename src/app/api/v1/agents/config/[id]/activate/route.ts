import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    if (isActive === undefined) {
      return Response.json(
        { success: false, error: 'Status aktif diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.agentConfig.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Konfigurasi ejen tidak dijumpai' },
        { status: 404 }
      )
    }

    const config = await db.agentConfig.update({
      where: { id },
      data: {
        isActive,
        lastActiveAt: isActive ? new Date() : existing.lastActiveAt,
        totalSessions: isActive ? { increment: 1 } : existing.totalSessions,
      },
    })

    return Response.json({
      success: true,
      data: {
        ...config,
        channels: JSON.parse(config.channels),
        skills: JSON.parse(config.skills),
      },
      message: isActive
        ? `Ejen "${config.displayName}" diaktifkan`
        : `Ejen "${config.displayName}" dinyahaktifkan`,
    })
  } catch (error) {
    console.error('Activate agent config error:', error)
    return Response.json(
      { success: false, error: 'Ralat mengaktifkan konfigurasi ejen' },
      { status: 500 }
    )
  }
}
