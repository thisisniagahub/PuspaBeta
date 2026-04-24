import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const triggerEvent = searchParams.get('triggerEvent')
    const isEnabled = searchParams.get('isEnabled')

    const where: Record<string, unknown> = {}
    if (triggerEvent) where.triggerEvent = triggerEvent
    if (isEnabled !== null && isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true'
    }

    const rules = await db.automationRule.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    return Response.json({
      success: true,
      data: rules.map((r) => ({
        ...r,
        actions: JSON.parse(r.actions),
        condition: r.condition ? JSON.parse(r.condition) : null,
      })),
    })
  } catch (error) {
    console.error('List automation rules error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat peraturan automasi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, triggerEvent, condition, actions, isEnabled, priority } = body

    if (!name || !triggerEvent || !actions) {
      return Response.json(
        { success: false, error: 'Nama, peristiwa pencetus dan tindakan diperlukan' },
        { status: 400 }
      )
    }

    const rule = await db.automationRule.create({
      data: {
        name,
        description: description || null,
        triggerEvent,
        condition: condition ? JSON.stringify(condition) : null,
        actions: typeof actions === 'string' ? actions : JSON.stringify(actions),
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        priority: priority || 0,
      },
    })

    return Response.json({
      success: true,
      data: {
        ...rule,
        actions: JSON.parse(rule.actions),
        condition: rule.condition ? JSON.parse(rule.condition) : null,
      },
    })
  } catch (error) {
    console.error('Create automation rule error:', error)
    return Response.json(
      { success: false, error: 'Ralat mencipta peraturan automasi' },
      { status: 500 }
    )
  }
}
