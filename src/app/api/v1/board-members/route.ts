import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const boardMemberSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  title: z.string().optional(),
  role: z.string().min(1, 'Peranan diperlukan'),
  appointmentDate: z.string().optional(),
  endDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  isCurrent: z.boolean().optional(),
})

export async function GET() {
  try {
    const members = await db.boardMember.findMany({
      where: { isDeleted: false },
      orderBy: [{ isCurrent: 'desc' }, { appointmentDate: 'desc' }],
    })
    return NextResponse.json({ success: true, data: members })
  } catch (error) {
    console.error('Board members GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan ahli lembaga' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = boardMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const member = await db.boardMember.create({
      data: {
        name: data.name,
        title: data.title,
        role: data.role,
        appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        phone: data.phone,
        email: data.email,
        photo: data.photo,
        bio: data.bio,
        isCurrent: data.isCurrent ?? true,
      },
    })

    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error) {
    console.error('Board members POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta ahli lembaga' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.boardMember.findFirst({ where: { id, isDeleted: false } })
    if (!existing) return NextResponse.json({ success: false, error: 'Ahli lembaga tidak dijumpai' }, { status: 404 })

    if (updateData.appointmentDate) updateData.appointmentDate = new Date(updateData.appointmentDate)
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate)

    const member = await db.boardMember.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error('Board members PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini ahli lembaga' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.boardMember.findFirst({ where: { id, isDeleted: false } })
    if (!existing) return NextResponse.json({ success: false, error: 'Ahli lembaga tidak dijumpai' }, { status: 404 })

    const member = await db.boardMember.update({ where: { id }, data: { isDeleted: true } })
    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error('Board members DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam ahli lembaga' }, { status: 500 })
  }
}
