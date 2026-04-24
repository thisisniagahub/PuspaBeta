import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const memberCreateSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  ic: z.string().min(1, 'No. IC diperlukan'),
  phone: z.string().min(1, 'No. telefon diperlukan'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(1, 'Alamat diperlukan'),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  householdSize: z.coerce.number().min(0).default(1),
  monthlyIncome: z.coerce.number().min(0).default(0),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).default('single'),
  occupation: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blacklisted']).default('active'),
  notes: z.string().optional(),
})

const memberUpdateSchema = memberCreateSchema.partial()

// ============ HELPERS ============

async function generateMemberNumber(): Promise<string> {
  const last = await db.member.findFirst({
    where: { isDeleted: false },
    orderBy: { memberNumber: 'desc' },
    select: { memberNumber: true },
  })
  const next = last ? parseInt(last.memberNumber.replace('PUSPA-', '')) + 1 : 1
  return `PUSPA-${String(next).padStart(4, '0')}`
}

// ============ GET — Paginated list with search, filters, stats ============

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)))
    const skip = (page - 1) * pageSize

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const maritalStatus = searchParams.get('maritalStatus') || ''

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { memberNumber: { contains: search } },
        { ic: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (maritalStatus) {
      where.maritalStatus = maritalStatus
    }

    const [items, total, activeCount, inactiveCount, blacklistedCount] = await Promise.all([
      db.member.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.member.count({ where }),
      db.member.count({ where: { isDeleted: false, status: 'active' } }),
      db.member.count({ where: { isDeleted: false, status: 'inactive' } }),
      db.member.count({ where: { isDeleted: false, status: 'blacklisted' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        stats: {
          total: activeCount + inactiveCount + blacklistedCount,
          active: activeCount,
          inactive: inactiveCount,
          blacklisted: blacklistedCount,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ POST — Create member ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = memberCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    // Check unique IC
    const existing = await db.member.findFirst({
      where: { ic: data.ic, isDeleted: false },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'No. IC sudah wujud' },
        { status: 409 }
      )
    }

    const memberNumber = await generateMemberNumber()

    const member = await db.member.create({
      data: {
        memberNumber,
        name: data.name,
        ic: data.ic,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        householdSize: data.householdSize,
        monthlyIncome: data.monthlyIncome,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation || null,
        bankAccount: data.bankAccount || null,
        bankName: data.bankName || null,
        status: data.status,
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update member ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID ahli diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.member.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ahli tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = memberUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    // If IC is being updated, check uniqueness
    if (data.ic && data.ic !== existing.ic) {
      const icConflict = await db.member.findFirst({
        where: { ic: data.ic, isDeleted: false, NOT: { id } },
      })
      if (icConflict) {
        return NextResponse.json(
          { success: false, error: 'No. IC sudah wujud' },
          { status: 409 }
        )
      }
    }

    const member = await db.member.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ic !== undefined && { ic: data.ic }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.state !== undefined && { state: data.state || null }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode || null }),
        ...(data.householdSize !== undefined && { householdSize: data.householdSize }),
        ...(data.monthlyIncome !== undefined && { monthlyIncome: data.monthlyIncome }),
        ...(data.maritalStatus !== undefined && { maritalStatus: data.maritalStatus }),
        ...(data.occupation !== undefined && { occupation: data.occupation || null }),
        ...(data.bankAccount !== undefined && { bankAccount: data.bankAccount || null }),
        ...(data.bankName !== undefined && { bankName: data.bankName || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    })

    return NextResponse.json({ success: true, data: member })
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
        { success: false, error: 'ID ahli diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.member.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ahli tidak dijumpai' },
        { status: 404 }
      )
    }

    const member = await db.member.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
