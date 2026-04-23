import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const decisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  decidedBy: z.string().optional(),
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = decisionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { decision, decidedBy, reason } = parsed.data

    const workItem = await db.workItem.findUnique({ where: { id } })
    if (!workItem) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    if (workItem.status !== 'waiting_user') {
      return NextResponse.json({ success: false, error: 'Item kerja tidak menunggu kelulusan' }, { status: 400 })
    }

    const newStatus = decision === 'approved' ? 'in_progress' : 'failed'

    await db.executionEvent.create({
      data: {
        workItemId: id,
        type: decision === 'approved' ? 'approval_granted' : 'approval_rejected',
        summary: reason || (decision === 'approved' ? 'Kelulusan diberikan' : 'Kelulusan ditolak'),
        status: decision === 'approved' ? 'success' : 'failed',
      },
    })

    const updated = await db.workItem.update({
      where: { id },
      data: {
        status: newStatus,
        resolutionSummary: reason,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Ops work-item decision error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memproses keputusan kelulusan' }, { status: 500 })
  }
}
