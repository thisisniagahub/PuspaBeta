import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const statusCounts = await db.workItem.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const domainCounts = await db.workItem.groupBy({
      by: ['domain'],
      _count: { id: true },
    })

    const intentCounts = await db.workItem.groupBy({
      by: ['intent'],
      _count: { id: true },
    })

    const automationStats = await db.automationJob.aggregate({
      _count: { id: true },
      _min: { nextRunAt: true },
    })

    const enabledAutomations = await db.automationJob.count({ where: { isEnabled: true } })

    return NextResponse.json({
      success: true,
      data: {
        byStatus: statusCounts.map(s => ({ status: s.status, count: s._count.id })),
        byDomain: domainCounts.map(d => ({ domain: d.domain, count: d._count.id })),
        byIntent: intentCounts.map(i => ({ intent: i.intent, count: i._count.id })),
        automations: {
          total: automationStats._count.id,
          enabled: enabledAutomations,
          nextRun: automationStats._min.nextRunAt,
        },
      },
    })
  } catch (error) {
    console.error('Ops stats error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan statistik ops' }, { status: 500 })
  }
}
