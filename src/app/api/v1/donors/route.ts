import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const donorCreateSchema = z.object({
  name: z.string().min(1, 'Nama penderma diperlukan'),
  ic: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.enum(['major', 'regular', 'occasional', 'lapsed']).default('occasional'),
  preferredContact: z.enum(['email', 'phone', 'whatsapp']).optional(),
  isAnonymous: z.boolean().default(false),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

const donorUpdateSchema = donorCreateSchema.partial()

// ============ HELPERS ============

async function generateDonorNumber(): Promise<string> {
  const last = await db.donor.findFirst({
    where: { isDeleted: false },
    orderBy: { donorNumber: 'desc' },
    select: { donorNumber: true },
  })
  const next = last ? parseInt(last.donorNumber.replace('DNR-', '')) + 1 : 1
  return `DNR-${String(next).padStart(4, '0')}`
}

// ============ GET — Paginated list with search, filters, stats ============

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)))
    const skip = (page - 1) * pageSize

    const search = searchParams.get('search') || ''
    const segment = searchParams.get('segment') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { donorNumber: { contains: search } },
        { ic: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (segment) {
      where.segment = segment
    }

    if (status) {
      where.status = status
    }

    const [
      items,
      total,
      activeCount,
      inactiveCount,
      majorCount,
      regularCount,
      occasionalCount,
      lapsedCount,
      totalDonatedSum,
    ] = await Promise.all([
      db.donor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.donor.count({ where }),
      db.donor.count({ where: { isDeleted: false, status: 'active' } }),
      db.donor.count({ where: { isDeleted: false, status: 'inactive' } }),
      db.donor.count({ where: { isDeleted: false, segment: 'major' } }),
      db.donor.count({ where: { isDeleted: false, segment: 'regular' } }),
      db.donor.count({ where: { isDeleted: false, segment: 'occasional' } }),
      db.donor.count({ where: { isDeleted: false, segment: 'lapsed' } }),
      db.donor.aggregate({
        where: { isDeleted: false },
        _sum: { totalDonated: true },
      }),
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
          total: activeCount + inactiveCount,
          active: activeCount,
          inactive: inactiveCount,
          bySegment: {
            major: majorCount,
            regular: regularCount,
            occasional: occasionalCount,
            lapsed: lapsedCount,
          },
          totalDonated: totalDonatedSum._sum.totalDonated ?? 0,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ POST — Create donor ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = donorCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data
    const donorNumber = await generateDonorNumber()

    const donor = await db.donor.create({
      data: {
        donorNumber,
        name: data.name,
        ic: data.ic || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        segment: data.segment,
        preferredContact: data.preferredContact || null,
        isAnonymous: data.isAnonymous,
        notes: data.notes || null,
        status: data.status,
      },
    })

    return NextResponse.json({ success: true, data: donor }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update donor ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID penderma diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.donor.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Penderma tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = donorUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const donor = await db.donor.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ic !== undefined && { ic: data.ic || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.state !== undefined && { state: data.state || null }),
        ...(data.segment !== undefined && { segment: data.segment }),
        ...(data.preferredContact !== undefined && { preferredContact: data.preferredContact || null }),
        ...(data.isAnonymous !== undefined && { isAnonymous: data.isAnonymous }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })

    return NextResponse.json({ success: true, data: donor })
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
        { success: false, error: 'ID penderma diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.donor.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Penderma tidak dijumpai' },
        { status: 404 }
      )
    }

    const donor = await db.donor.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: donor })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
