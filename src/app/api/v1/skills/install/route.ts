import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skillId, name, version, category, description, author, permissions } = body

    if (!skillId || !name) {
      return Response.json(
        { success: false, error: 'ID kemahiran dan nama diperlukan' },
        { status: 400 }
      )
    }

    // Check if already installed
    const existing = await db.installedSkill.findUnique({
      where: { skillId },
    })

    if (existing) {
      return Response.json(
        { success: false, error: 'Kemahiran sudah dipasang' },
        { status: 409 }
      )
    }

    const skill = await db.installedSkill.create({
      data: {
        skillId,
        name,
        version: version || '1.0.0',
        category: category || 'productivity',
        description: description || null,
        author: author || null,
        permissions: permissions ? JSON.stringify(permissions) : null,
        isEnabled: true,
      },
    })

    return Response.json({
      success: true,
      data: {
        ...skill,
        permissions: skill.permissions ? JSON.parse(skill.permissions) : null,
      },
    })
  } catch (error) {
    console.error('Install skill error:', error)
    return Response.json(
      { success: false, error: 'Ralat memasang kemahiran' },
      { status: 500 }
    )
  }
}
