import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const caseCreateSchema = z.object({
  title: z.string().min(1, 'Tajuk kes diperlukan'),
  description: z.string().optional(),
  status: z.enum([
    'draft', 'submitted', 'verifying', 'verified', 'scoring',
    'scored', 'approved', 'disbursing', 'disbursed', 'follow_up',
    'closed', 'rejected',
  ]).default('draft'),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).default('normal'),
  category: z.enum(['zakat', 'sedekah', 'wakaf', 'infak', 'government_aid']).default('zakat'),
  amount: z.coerce.number().min(0).default(0),
  memberId: z.string().optional(),
  programmeId: z.string().optional(),
  assigneeId: z.string().optional(),
  verificationScore: z.coerce.number().min(0).optional(),
  welfareScore: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

const caseUpdateSchema = caseCreateSchema.partial()

// ============ HELPERS ============

async function generateCaseNumber(): Promise<string> {
  const last = await db.case.findFirst({
    where: { isDeleted: false },
    orderBy: { caseNumber: 'desc' },
    select: { caseNumber: true },
  })
  const next = last ? parseInt(last.caseNumber.replace('CS-', '')) + 1 : 1
  return `CS-${String(next).padStart(4, '0')}`
}

// ============ GET — Paginated list with search, filters ============

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)))
    const skip = (page - 1) * pageSize

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { caseNumber: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const [items, total] = await Promise.all([
      db.case.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          member: { select: { id: true, name: true, memberNumber: true } },
          programme: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
      }),
      db.case.count({ where }),
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

// ============ POST — Create case ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = caseCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    // Get or create a default user for creatorId
    let defaultUser = await db.user.findFirst()
    if (!defaultUser) {
      defaultUser = await db.user.create({
        data: {
          email: 'system@puspacare.org',
          password: 'system',
          name: 'System',
          role: 'admin',
        },
      })
    }

    const caseNumber = await generateCaseNumber()

    const newCase = await db.case.create({
      data: {
        caseNumber,
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        category: data.category,
        amount: data.amount,
        memberId: data.memberId || null,
        programmeId: data.programmeId || null,
        creatorId: defaultUser.id,
        assigneeId: data.assigneeId || null,
        verificationScore: data.verificationScore ?? 0,
        welfareScore: data.welfareScore ?? 0,
        notes: data.notes || null,
      },
      include: {
        member: { select: { id: true, name: true, memberNumber: true } },
        programme: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: newCase }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update case ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID kes diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.case.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kes tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = caseUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    // If status is 'closed', set closedAt
    const closedAt = data.status === 'closed' ? new Date() : undefined

    const updatedCase = await db.case.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.memberId !== undefined && { memberId: data.memberId || null }),
        ...(data.programmeId !== undefined && { programmeId: data.programmeId || null }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId || null }),
        ...(data.verificationScore !== undefined && { verificationScore: data.verificationScore }),
        ...(data.welfareScore !== undefined && { welfareScore: data.welfareScore }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(closedAt !== undefined && { closedAt }),
      },
      include: {
        member: { select: { id: true, name: true, memberNumber: true } },
        programme: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: updatedCase })
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
        { success: false, error: 'ID kes diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.case.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kes tidak dijumpai' },
        { status: 404 }
      )
    }

    const deletedCase = await db.case.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: deletedCase })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
