import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const resumeSchema = z.object({
  workItemId: z.string().min(1, 'ID item kerja diperlukan'),
  nextAction: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resumeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { workItemId, nextAction, notes } = parsed.data

    const existing = await db.workItem.findUnique({ where: { id: workItemId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    if (existing.status !== 'waiting_user' && existing.status !== 'blocked') {
      return NextResponse.json({ success: false, error: 'Hanya item yang menunggu pengguna atau tersekat boleh disambung' }, { status: 400 })
    }

    const workItem = await db.workItem.update({
      where: { id: workItemId },
      data: {
        status: 'in_progress',
        nextAction: nextAction ?? existing.nextAction,
        blockerReason: null,
      },
    })

    await db.executionEvent.create({
      data: {
        workItemId,
        type: 'work_resume',
        summary: notes || 'Item kerja disambung',
        status: 'success',
      },
    })

    return NextResponse.json({ success: true, data: workItem })
  } catch (error) {
    console.error('Ops work-items resume error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menyambung item kerja' }, { status: 500 })
  }
}
