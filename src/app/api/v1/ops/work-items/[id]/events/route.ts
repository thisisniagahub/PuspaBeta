import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const eventSchema = z.object({
  type: z.string().min(1, 'Jenis peristiwa diperlukan'),
  summary: z.string().min(1, 'Ringkasan diperlukan'),
  detail: z.string().optional(),
  toolName: z.string().optional(),
  status: z.string().optional(),
  latencyMs: z.number().optional(),
  errorCode: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workItem = await db.workItem.findUnique({ where: { id } })
    if (!workItem) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    const events = await db.executionEvent.findMany({
      where: { workItemId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Ops work-item events GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan peristiwa pelaksanaan' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = eventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const workItem = await db.workItem.findUnique({ where: { id } })
    if (!workItem) return NextResponse.json({ success: false, error: 'Item kerja tidak dijumpai' }, { status: 404 })

    const event = await db.executionEvent.create({
      data: {
        workItemId: id,
        type: parsed.data.type,
        summary: parsed.data.summary,
        detail: parsed.data.detail,
        toolName: parsed.data.toolName,
        status: parsed.data.status ?? 'success',
        latencyMs: parsed.data.latencyMs,
        errorCode: parsed.data.errorCode,
      },
    })

    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error) {
    console.error('Ops work-item events POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta peristiwa pelaksanaan' }, { status: 500 })
  }
}
