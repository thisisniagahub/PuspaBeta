import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const checklistSchema = z.object({
  category: z.string().min(1, 'Kategori diperlukan'),
  item: z.string().min(1, 'Item diperlukan'),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
  evidenceUrl: z.string().optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const items = await db.complianceChecklist.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Compliance GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan senarai pematuhan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = checklistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const item = await db.complianceChecklist.create({
      data: {
        category: data.category,
        item: data.item,
        description: data.description,
        isCompleted: data.isCompleted ?? false,
        completedAt: data.isCompleted ? new Date() : undefined,
        evidenceUrl: data.evidenceUrl,
        notes: data.notes,
        order: data.order ?? 0,
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Compliance POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta item pematuhan' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.complianceChecklist.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Item pematuhan tidak dijumpai' }, { status: 404 })

    if (updateData.isCompleted === true && !existing.isCompleted) {
      updateData.completedAt = new Date()
    } else if (updateData.isCompleted === false) {
      updateData.completedAt = null
    }

    const item = await db.complianceChecklist.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Compliance PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini item pematuhan' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.complianceChecklist.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Item pematuhan tidak dijumpai' }, { status: 404 })

    await db.complianceChecklist.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Compliance DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam item pematuhan' }, { status: 500 })
  }
}
