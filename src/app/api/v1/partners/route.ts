import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const partnerSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  type: z.string().optional(),
  relationship: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  address: z.string().optional(),
  verifiedStatus: z.string().optional(),
  verificationUrl: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { isDeleted: false }
    if (type) where.type = type
    if (search) where.name = { contains: search }

    const partners = await db.partner.findMany({ where, orderBy: { name: 'asc' } })
    return NextResponse.json({ success: true, data: partners })
  } catch (error) {
    console.error('Partners GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan rakan kongsi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = partnerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const partner = await db.partner.create({ data })
    return NextResponse.json({ success: true, data: partner }, { status: 201 })
  } catch (error) {
    console.error('Partners POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta rakan kongsi' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.partner.findFirst({ where: { id, isDeleted: false } })
    if (!existing) return NextResponse.json({ success: false, error: 'Rakan kongsi tidak dijumpai' }, { status: 404 })

    const partner = await db.partner.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: partner })
  } catch (error) {
    console.error('Partners PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini rakan kongsi' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.partner.findFirst({ where: { id, isDeleted: false } })
    if (!existing) return NextResponse.json({ success: false, error: 'Rakan kongsi tidak dijumpai' }, { status: 404 })

    const partner = await db.partner.update({ where: { id }, data: { isDeleted: true } })
    return NextResponse.json({ success: true, data: partner })
  } catch (error) {
    console.error('Partners DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam rakan kongsi' }, { status: 500 })
  }
}
