import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalWorkItems,
      queuedItems,
      inProgressItems,
      completedItems,
      failedItems,
      totalAutomations,
      activeAutomations,
      totalArtifacts,
      recentEvents,
    ] = await Promise.all([
      db.workItem.count(),
      db.workItem.count({ where: { status: 'queued' } }),
      db.workItem.count({ where: { status: 'in_progress' } }),
      db.workItem.count({ where: { status: 'completed' } }),
      db.workItem.count({ where: { status: 'failed' } }),
      db.automationJob.count(),
      db.automationJob.count({ where: { isEnabled: true } }),
      db.artifact.count(),
      db.executionEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { workItem: { select: { id: true, title: true, workItemNumber: true } } },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        workItems: { total: totalWorkItems, queued: queuedItems, inProgress: inProgressItems, completed: completedItems, failed: failedItems },
        automations: { total: totalAutomations, active: activeAutomations },
        artifacts: { total: totalArtifacts },
        recentEvents,
      },
    })
  } catch (error) {
    console.error('Ops dashboard error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan papan pemuka ops' }, { status: 500 })
  }
}
