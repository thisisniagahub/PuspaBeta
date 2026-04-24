import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rule = await db.automationRule.findUnique({ where: { id } })
    if (!rule) {
      return Response.json(
        { success: false, error: 'Peraturan automasi tidak dijumpai' },
        { status: 404 }
      )
    }

    if (!rule.isEnabled) {
      return Response.json(
        { success: false, error: 'Peraturan automasi tidak aktif' },
        { status: 400 }
      )
    }

    const actions = JSON.parse(rule.actions)
    const results: unknown[] = []

    // Simulate executing actions
    for (const action of actions) {
      switch (action.type) {
        case 'send_notification': {
          const notification = await db.notificationLog.create({
            data: {
              type: rule.triggerEvent,
              channel: action.channel || 'in-app',
              recipient: action.recipient || 'system',
              title: action.title || `Automasi: ${rule.name}`,
              message: action.message || `Dipicu oleh peristiwa: ${rule.triggerEvent}`,
              priority: action.priority || 'medium',
              status: 'sent',
              sentAt: new Date(),
            },
          })
          results.push({ action: 'send_notification', notificationId: notification.id })
          break
        }
        case 'create_work_item': {
          const workItem = await db.workItem.create({
            data: {
              workItemNumber: `WI-AUTO-${Date.now()}`,
              title: action.title || `Automasi: ${rule.name}`,
              domain: action.domain || 'general',
              sourceChannel: 'automation',
              requestText: action.description || `Dipicu oleh peraturan: ${rule.name}`,
              intent: action.intent || 'general',
              priority: action.priority || 'normal',
            },
          })
          results.push({ action: 'create_work_item', workItemId: workItem.id })
          break
        }
        case 'update_case': {
          if (action.caseId && action.status) {
            try {
              const updatedCase = await db.case.update({
                where: { id: action.caseId },
                data: { status: action.status },
              })
              results.push({ action: 'update_case', caseId: updatedCase.id })
            } catch {
              results.push({ action: 'update_case', error: 'Kes tidak dijumpai' })
            }
          }
          break
        }
        default:
          results.push({ action: action.type, status: 'skipped', reason: 'Jenis tindakan tidak disokong' })
      }
    }

    // Update rule trigger stats
    await db.automationRule.update({
      where: { id },
      data: {
        lastTriggeredAt: new Date(),
        triggerCount: { increment: 1 },
      },
    })

    return Response.json({
      success: true,
      data: {
        ruleId: rule.id,
        ruleName: rule.name,
        triggeredAt: new Date().toISOString(),
        actionsExecuted: results.length,
        results,
      },
    })
  } catch (error) {
    console.error('Trigger automation rule error:', error)
    return Response.json(
      { success: false, error: 'Ralat mencetus peraturan automasi' },
      { status: 500 }
    )
  }
}
