import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const disbursementCreateSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amaun mesti lebih daripada 0'),
  purpose: z.string().min(1, 'Tujuan diperlukan'),
  status: z.enum(['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled']).default('pending'),
  recipientName: z.string().min(1, 'Nama penerima diperlukan'),
  recipientIC: z.string().optional(),
  recipientBank: z.string().optional(),
  recipientAcc: z.string().optional(),
  scheduledDate: z.string().optional(),
  processedDate: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  caseId: z.string().optional(),
  programmeId: z.string().optional(),
  memberId: z.string().optional(),
})

const disbursementUpdateSchema = disbursementCreateSchema.partial()

// ============ HELPERS ============

async function generateDisbursementNumber(): Promise<string> {
  const last = await db.disbursement.findFirst({
    where: { isDeleted: false },
    orderBy: { disbursementNumber: 'desc' },
    select: { disbursementNumber: true },
  })
  const next = last ? parseInt(last.disbursementNumber.replace('DB-', '')) + 1 : 1
  return `DB-${String(next).padStart(4, '0')}`
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

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { disbursementNumber: { contains: search } },
        { recipientName: { contains: search } },
        { purpose: { contains: search } },
        { recipientIC: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [items, total] = await Promise.all([
      db.disbursement.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          case: { select: { id: true, caseNumber: true, title: true } },
          programme: { select: { id: true, name: true } },
          member: { select: { id: true, name: true, memberNumber: true } },
        },
      }),
      db.disbursement.count({ where }),
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

// ============ POST — Create disbursement ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = disbursementCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data
    const disbursementNumber = await generateDisbursementNumber()

    const disbursement = await db.disbursement.create({
      data: {
        disbursementNumber,
        amount: data.amount,
        purpose: data.purpose,
        status: data.status,
        recipientName: data.recipientName,
        recipientIC: data.recipientIC || null,
        recipientBank: data.recipientBank || null,
        recipientAcc: data.recipientAcc || null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        processedDate: data.processedDate ? new Date(data.processedDate) : null,
        receiptUrl: data.receiptUrl || null,
        notes: data.notes || null,
        approvedBy: data.approvedBy || null,
        caseId: data.caseId || null,
        programmeId: data.programmeId || null,
        memberId: data.memberId || null,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        programme: { select: { id: true, name: true } },
        member: { select: { id: true, name: true, memberNumber: true } },
      },
    })

    return NextResponse.json({ success: true, data: disbursement }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update disbursement ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pencairan diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.disbursement.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = disbursementUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const disbursement = await db.disbursement.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.purpose !== undefined && { purpose: data.purpose }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.recipientName !== undefined && { recipientName: data.recipientName }),
        ...(data.recipientIC !== undefined && { recipientIC: data.recipientIC || null }),
        ...(data.recipientBank !== undefined && { recipientBank: data.recipientBank || null }),
        ...(data.recipientAcc !== undefined && { recipientAcc: data.recipientAcc || null }),
        ...(data.scheduledDate !== undefined && { scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null }),
        ...(data.processedDate !== undefined && { processedDate: data.processedDate ? new Date(data.processedDate) : null }),
        ...(data.receiptUrl !== undefined && { receiptUrl: data.receiptUrl || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.approvedBy !== undefined && { approvedBy: data.approvedBy || null }),
        ...(data.caseId !== undefined && { caseId: data.caseId || null }),
        ...(data.programmeId !== undefined && { programmeId: data.programmeId || null }),
        ...(data.memberId !== undefined && { memberId: data.memberId || null }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        programme: { select: { id: true, name: true } },
        member: { select: { id: true, name: true, memberNumber: true } },
      },
    })

    return NextResponse.json({ success: true, data: disbursement })
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
        { success: false, error: 'ID pencairan diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.disbursement.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak dijumpai' },
        { status: 404 }
      )
    }

    const disbursement = await db.disbursement.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: disbursement })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
