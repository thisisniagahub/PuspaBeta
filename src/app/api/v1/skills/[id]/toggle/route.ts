import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isEnabled } = body

    if (isEnabled === undefined) {
      return Response.json(
        { success: false, error: 'Status enable/disable diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.installedSkill.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Kemahiran tidak dijumpai' },
        { status: 404 }
      )
    }

    const skill = await db.installedSkill.update({
      where: { id },
      data: { isEnabled },
    })

    return Response.json({
      success: true,
      data: {
        ...skill,
        permissions: skill.permissions ? JSON.parse(skill.permissions) : null,
        config: skill.config ? JSON.parse(skill.config) : null,
      },
    })
  } catch (error) {
    console.error('Toggle skill error:', error)
    return Response.json(
      { success: false, error: 'Ralat menukar status kemahiran' },
      { status: 500 }
    )
  }
}
