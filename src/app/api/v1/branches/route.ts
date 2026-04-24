import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const branchSchema = z.object({
  name: z.string().min(1, 'Nama cawangan diperlukan'),
  code: z.string().min(1, 'Kod cawangan diperlukan'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  headName: z.string().optional(),
  headPhone: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: Record<string, unknown> = {}
    if (!includeInactive) where.isActive = true

    const branches = await db.branch.findMany({ where, orderBy: { name: 'asc' } })
    return NextResponse.json({ success: true, data: branches })
  } catch (error) {
    console.error('Branches GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan cawangan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = branchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const existing = await db.branch.findUnique({ where: { code: data.code } })
    if (existing) return NextResponse.json({ success: false, error: 'Kod cawangan sudah wujud' }, { status: 409 })

    const branch = await db.branch.create({ data })
    return NextResponse.json({ success: true, data: branch }, { status: 201 })
  } catch (error) {
    console.error('Branches POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta cawangan' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.branch.findFirst({ where: { id, isActive: true } })
    if (!existing) return NextResponse.json({ success: false, error: 'Cawangan tidak dijumpai' }, { status: 404 })

    const branch = await db.branch.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: branch })
  } catch (error) {
    console.error('Branches PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini cawangan' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.branch.findFirst({ where: { id, isActive: true } })
    if (!existing) return NextResponse.json({ success: false, error: 'Cawangan tidak dijumpai' }, { status: 404 })

    const branch = await db.branch.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true, data: branch })
  } catch (error) {
    console.error('Branches DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam cawangan' }, { status: 500 })
  }
}
