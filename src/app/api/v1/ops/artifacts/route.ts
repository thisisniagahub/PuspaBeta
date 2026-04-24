import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const artifactSchema = z.object({
  workItemId: z.string().optional(),
  type: z.string().min(1, 'Jenis artifak diperlukan'),
  title: z.string().min(1, 'Tajuk diperlukan'),
  summary: z.string().optional(),
  pathOrRef: z.string().optional(),
  metadata: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workItemId = searchParams.get('workItemId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (workItemId) where.workItemId = workItemId
    if (type) where.type = type

    const [artifacts, total] = await Promise.all([
      db.artifact.findMany({
        where,
        include: { workItem: { select: { id: true, title: true, workItemNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.artifact.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { artifacts, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Ops artifacts GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan artifak' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = artifactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const artifact = await db.artifact.create({ data })

    return NextResponse.json({ success: true, data: artifact }, { status: 201 })
  } catch (error) {
    console.error('Ops artifacts POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta artifak' }, { status: 500 })
  }
}
