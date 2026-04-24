import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const workItemSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  project: z.string().optional(),
  domain: z.string().min(1, 'Domain diperlukan'),
  sourceChannel: z.string().optional(),
  requestText: z.string().min(1, 'Teks permintaan diperlukan'),
  intent: z.string().min(1, 'Niat diperlukan'),
  priority: z.string().optional(),
  tags: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const domain = searchParams.get('domain')
    const intent = searchParams.get('intent')
    const project = searchParams.get('project')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (domain) where.domain = domain
    if (intent) where.intent = intent
    if (project) where.project = project

    const [workItems, total] = await Promise.all([
      db.workItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.workItem.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { workItems, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Ops work-items GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan item kerja' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = workItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const existingCount = await db.workItem.count()
    const workItemNumber = `WI-${String(existingCount + 1).padStart(4, '0')}`

    const workItem = await db.workItem.create({
      data: {
        workItemNumber,
        title: data.title,
        project: data.project ?? 'PUSPA',
        domain: data.domain,
        sourceChannel: data.sourceChannel ?? 'conductor',
        requestText: data.requestText,
        intent: data.intent,
        status: 'queued',
        priority: data.priority ?? 'normal',
        tags: data.tags,
      },
    })

    // Create initial execution event
    await db.executionEvent.create({
      data: {
        workItemId: workItem.id,
        type: 'intent_routed',
        summary: `Item kerja dicipta dengan niat: ${data.intent}`,
        status: 'success',
      },
    })

    return NextResponse.json({ success: true, data: workItem }, { status: 201 })
  } catch (error) {
    console.error('Ops work-items POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta item kerja' }, { status: 500 })
  }
}
