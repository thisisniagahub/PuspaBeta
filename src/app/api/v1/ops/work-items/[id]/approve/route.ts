import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const approveSchema = z.object({
  approvedBy: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = approveSchema.safeParse(body)

    const workItem = await db.workItem.findUnique({ where: { id } })
    if (!workItem) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    // Create approval event
    await db.executionEvent.create({
      data: {
        workItemId: id,
        type: 'approval_requested',
        summary: parsed.data?.notes || 'Kelulusan diminta untuk item kerja',
        status: 'success',
      },
    })

    const updated = await db.workItem.update({
      where: { id },
      data: {
        status: 'waiting_user',
        nextAction: 'approval_pending',
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Ops work-item approve error:', error)
    return NextResponse.json({ success: false, error: 'Gagal meminta kelulusan' }, { status: 500 })
  }
}
