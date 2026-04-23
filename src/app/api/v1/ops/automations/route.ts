import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const automationSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  description: z.string().optional(),
  kind: z.enum(['one_time', 'fixed_rate', 'cron']).optional(),
  expr: z.string().optional(),
  tz: z.string().optional(),
  domain: z.string().optional(),
  relatedProject: z.string().optional(),
  workItemId: z.string().optional(),
  isEnabled: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isEnabled = searchParams.get('isEnabled')
    const domain = searchParams.get('domain')

    const where: Record<string, unknown> = {}
    if (isEnabled !== null) where.isEnabled = isEnabled === 'true'
    if (domain) where.domain = domain

    const automations = await db.automationJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: automations })
  } catch (error) {
    console.error('Ops automations GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan automasi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = automationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const automation = await db.automationJob.create({ data })

    return NextResponse.json({ success: true, data: automation }, { status: 201 })
  } catch (error) {
    console.error('Ops automations POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta automasi' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.automationJob.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Automasi tidak dijumpai' }, { status: 404 })

    const automation = await db.automationJob.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: automation })
  } catch (error) {
    console.error('Ops automations PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini automasi' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.automationJob.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Automasi tidak dijumpai' }, { status: 404 })

    await db.automationJob.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Ops automations DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam automasi' }, { status: 500 })
  }
}
