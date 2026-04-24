import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isEnabled = searchParams.get('isEnabled')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (isEnabled !== null && isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true'
    }

    const skills = await db.installedSkill.findMany({
      where,
      orderBy: { installedAt: 'desc' },
    })

    return Response.json({
      success: true,
      data: skills.map((s) => ({
        ...s,
        permissions: s.permissions ? JSON.parse(s.permissions) : null,
        config: s.config ? JSON.parse(s.config) : null,
      })),
    })
  } catch (error) {
    console.error('List installed skills error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat kemahiran dipasang' },
      { status: 500 }
    )
  }
}
