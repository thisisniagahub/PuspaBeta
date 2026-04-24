import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
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

    return Response.json({
      success: true,
      data: {
        ...rule,
        actions: JSON.parse(rule.actions),
        condition: rule.condition ? JSON.parse(rule.condition) : null,
      },
    })
  } catch (error) {
    console.error('Get automation rule error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat peraturan automasi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, triggerEvent, condition, actions, isEnabled, priority } = body

    const existing = await db.automationRule.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Peraturan automasi tidak dijumpai' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (triggerEvent !== undefined) updateData.triggerEvent = triggerEvent
    if (condition !== undefined) updateData.condition = JSON.stringify(condition)
    if (actions !== undefined) updateData.actions = typeof actions === 'string' ? actions : JSON.stringify(actions)
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (priority !== undefined) updateData.priority = priority

    const rule = await db.automationRule.update({
      where: { id },
      data: updateData,
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
    console.error('Update automation rule error:', error)
    return Response.json(
      { success: false, error: 'Ralat mengemaskini peraturan automasi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.automationRule.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Peraturan automasi tidak dijumpai' },
        { status: 404 }
      )
    }

    await db.automationRule.delete({ where: { id } })

    return Response.json({
      success: true,
      message: 'Peraturan automasi berjaya dipadam',
    })
  } catch (error) {
    console.error('Delete automation rule error:', error)
    return Response.json(
      { success: false, error: 'Ralat memadam peraturan automasi' },
      { status: 500 }
    )
  }
}
