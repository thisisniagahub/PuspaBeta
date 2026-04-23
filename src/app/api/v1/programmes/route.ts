import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const programmeCreateSchema = z.object({
  name: z.string().min(1, 'Nama program diperlukan'),
  description: z.string().optional(),
  category: z.enum([
    'food_aid', 'education', 'skills_training', 'healthcare',
    'financial_assistance', 'community', 'emergency_relief', 'dawah',
  ]),
  status: z.enum(['active', 'completed', 'suspended', 'planned']).default('active'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  targetBeneficiaries: z.coerce.number().min(0).optional(),
  actualBeneficiaries: z.coerce.number().min(0).default(0),
  budget: z.coerce.number().min(0).default(0),
  totalSpent: z.coerce.number().min(0).default(0),
  partners: z.string().optional(),
  notes: z.string().optional(),
})

const programmeUpdateSchema = programmeCreateSchema.partial()

// ============ GET — Paginated list with search, filters ============

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)))
    const skip = (page - 1) * pageSize

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    const [items, total] = await Promise.all([
      db.programme.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.programme.count({ where }),
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

// ============ POST — Create programme ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = programmeCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const programme = await db.programme.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location || null,
        targetBeneficiaries: data.targetBeneficiaries ?? null,
        actualBeneficiaries: data.actualBeneficiaries,
        budget: data.budget,
        totalSpent: data.totalSpent,
        partners: data.partners || null,
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ success: true, data: programme }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update programme ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID program diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.programme.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Program tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = programmeUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const programme = await db.programme.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.targetBeneficiaries !== undefined && { targetBeneficiaries: data.targetBeneficiaries ?? null }),
        ...(data.actualBeneficiaries !== undefined && { actualBeneficiaries: data.actualBeneficiaries }),
        ...(data.budget !== undefined && { budget: data.budget }),
        ...(data.totalSpent !== undefined && { totalSpent: data.totalSpent }),
        ...(data.partners !== undefined && { partners: data.partners || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    })

    return NextResponse.json({ success: true, data: programme })
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
        { success: false, error: 'ID program diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.programme.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Program tidak dijumpai' },
        { status: 404 }
      )
    }

    const programme = await db.programme.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: programme })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
