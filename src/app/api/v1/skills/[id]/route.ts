import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.installedSkill.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Kemahiran tidak dijumpai' },
        { status: 404 }
      )
    }

    await db.installedSkill.delete({ where: { id } })

    return Response.json({
      success: true,
      message: `Kemahiran "${existing.name}" berjaya dinyahpasang`,
    })
  } catch (error) {
    console.error('Uninstall skill error:', error)
    return Response.json(
      { success: false, error: 'Ralat menyahpasang kemahiran' },
      { status: 500 }
    )
  }
}
