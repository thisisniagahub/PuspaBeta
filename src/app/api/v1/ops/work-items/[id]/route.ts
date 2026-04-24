import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const workItemUpdateSchema = z.object({
  title: z.string().optional(),
  project: z.string().optional(),
  domain: z.string().optional(),
  intent: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  currentStep: z.string().optional(),
  nextAction: z.string().optional(),
  blockerReason: z.string().optional(),
  resolutionSummary: z.string().optional(),
  tags: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workItem = await db.workItem.findUnique({
      where: { id },
      include: {
        executionEvents: { orderBy: { createdAt: 'desc' } },
        artifacts: { orderBy: { createdAt: 'desc' } },
        automationJobs: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!workItem) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    return NextResponse.json({ success: true, data: workItem })
  } catch (error) {
    console.error('Ops work-item GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan item kerja' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = workItemUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const existing = await db.workItem.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    const updateData: Record<string, unknown> = { ...parsed.data }

    // Handle status transitions
    if (parsed.data.status === 'in_progress' && existing.status === 'queued') {
      updateData.startedAt = new Date()
    }
    if (parsed.data.status === 'completed' || parsed.data.status === 'failed') {
      updateData.completedAt = new Date()
    }

    const workItem = await db.workItem.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: workItem })
  } catch (error) {
    console.error('Ops work-item PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini item kerja' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.workItem.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    // Archive instead of delete
    const workItem = await db.workItem.update({ where: { id }, data: { status: 'archived' } })
    return NextResponse.json({ success: true, data: workItem })
  } catch (error) {
    console.error('Ops work-item DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam item kerja' }, { status: 500 })
  }
}
