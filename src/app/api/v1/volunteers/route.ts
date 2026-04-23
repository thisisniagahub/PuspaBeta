import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const volunteerCreateSchema = z.object({
  name: z.string().min(1, 'Nama sukarelawan diperlukan'),
  ic: z.string().min(1, 'No. IC diperlukan'),
  phone: z.string().min(1, 'No. telefon diperlukan'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  occupation: z.string().optional(),
  skills: z.string().optional(),
  availability: z.enum(['weekday', 'weekend', 'anytime']).optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blacklisted']).default('active'),
  totalHours: z.coerce.number().min(0).default(0),
})

const volunteerUpdateSchema = volunteerCreateSchema.partial()

// ============ HELPERS ============

async function generateVolunteerNumber(): Promise<string> {
  const last = await db.volunteer.findFirst({
    where: { isDeleted: false },
    orderBy: { volunteerNumber: 'desc' },
    select: { volunteerNumber: true },
  })
  const next = last ? parseInt(last.volunteerNumber.replace('VOL-', '')) + 1 : 1
  return `VOL-${String(next).padStart(4, '0')}`
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

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { volunteerNumber: { contains: search } },
        { ic: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [items, total, activeCount, inactiveCount, blacklistedCount, totalHoursSum] = await Promise.all([
      db.volunteer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.volunteer.count({ where }),
      db.volunteer.count({ where: { isDeleted: false, status: 'active' } }),
      db.volunteer.count({ where: { isDeleted: false, status: 'inactive' } }),
      db.volunteer.count({ where: { isDeleted: false, status: 'blacklisted' } }),
      db.volunteer.aggregate({
        where: { isDeleted: false },
        _sum: { totalHours: true },
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
          total: activeCount + inactiveCount + blacklistedCount,
          active: activeCount,
          inactive: inactiveCount,
          blacklisted: blacklistedCount,
          totalHours: totalHoursSum._sum.totalHours ?? 0,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ POST — Create volunteer ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = volunteerCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    // Check unique IC
    const existing = await db.volunteer.findFirst({
      where: { ic: data.ic, isDeleted: false },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'No. IC sudah wujud' },
        { status: 409 }
      )
    }

    const volunteerNumber = await generateVolunteerNumber()

    const volunteer = await db.volunteer.create({
      data: {
        volunteerNumber,
        name: data.name,
        ic: data.ic,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        occupation: data.occupation || null,
        skills: data.skills || null,
        availability: data.availability || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        status: data.status,
        totalHours: data.totalHours,
      },
    })

    return NextResponse.json({ success: true, data: volunteer }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update volunteer ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID sukarelawan diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.volunteer.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Sukarelawan tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = volunteerUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    // If IC is being updated, check uniqueness
    if (data.ic && data.ic !== existing.ic) {
      const icConflict = await db.volunteer.findFirst({
        where: { ic: data.ic, isDeleted: false, NOT: { id } },
      })
      if (icConflict) {
        return NextResponse.json(
          { success: false, error: 'No. IC sudah wujud' },
          { status: 409 }
        )
      }
    }

    const volunteer = await db.volunteer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ic !== undefined && { ic: data.ic }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.state !== undefined && { state: data.state || null }),
        ...(data.occupation !== undefined && { occupation: data.occupation || null }),
        ...(data.skills !== undefined && { skills: data.skills || null }),
        ...(data.availability !== undefined && { availability: data.availability || null }),
        ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact || null }),
        ...(data.emergencyPhone !== undefined && { emergencyPhone: data.emergencyPhone || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.totalHours !== undefined && { totalHours: data.totalHours }),
      },
    })

    return NextResponse.json({ success: true, data: volunteer })
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
        { success: false, error: 'ID sukarelawan diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.volunteer.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Sukarelawan tidak dijumpai' },
        { status: 404 }
      )
    }

    const volunteer = await db.volunteer.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: volunteer })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
