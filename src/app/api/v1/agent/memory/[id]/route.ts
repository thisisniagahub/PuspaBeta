import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.agentMemory.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Ingatan tidak dijumpai' },
        { status: 404 }
      )
    }

    await db.agentMemory.delete({ where: { id } })

    return Response.json({
      success: true,
      message: 'Ingatan berjaya dipadam',
    })
  } catch (error) {
    console.error('Delete agent memory error:', error)
    return Response.json(
      { success: false, error: 'Ralat memadam ingatan ejen' },
      { status: 500 }
    )
  }
}
