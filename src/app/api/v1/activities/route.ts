import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const activityCreateSchema = z.object({
  title: z.string().min(1, 'Tajuk aktiviti diperlukan'),
  description: z.string().optional(),
  type: z.enum(['task', 'event', 'meeting', 'fieldwork']).default('task'),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
  date: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  programmeId: z.string().optional(),
  assignees: z.string().optional(),
  notes: z.string().optional(),
  order: z.coerce.number().min(0).default(0),
})

const activityUpdateSchema = activityCreateSchema.partial()

// ============ GET — Paginated list with search, filters ============

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)))
    const skip = (page - 1) * pageSize

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const [items, total] = await Promise.all([
      db.activity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          programme: { select: { id: true, name: true } },
        },
      }),
      db.activity.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ POST — Create activity ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = activityCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const activity = await db.activity.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type,
        status: data.status,
        date: data.date ? new Date(data.date) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location || null,
        programmeId: data.programmeId || null,
        assignees: data.assignees || null,
        notes: data.notes || null,
        order: data.order,
      },
      include: {
        programme: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: activity }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update activity ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID aktiviti diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.activity.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Aktiviti tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = activityUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const activity = await db.activity.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.programmeId !== undefined && { programmeId: data.programmeId || null }),
        ...(data.assignees !== undefined && { assignees: data.assignees || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.order !== undefined && { order: data.order }),
      },
      include: {
        programme: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ DELETE — Soft delete ============

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID aktiviti diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.activity.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Aktiviti tidak dijumpai' },
        { status: 404 }
      )
    }

    const activity = await db.activity.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
