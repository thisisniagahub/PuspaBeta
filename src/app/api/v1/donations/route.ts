import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============ ZOD SCHEMAS ============

const donationCreateSchema = z.object({
  donorName: z.string().min(1, 'Nama penderma diperlukan'),
  donorIC: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal('')),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Amaun mesti lebih daripada 0'),
  status: z.enum(['pending', 'confirmed', 'failed', 'refunded']).default('pending'),
  method: z.enum(['cash', 'bank_transfer', 'online', 'cheque', 'ewallet']).default('cash'),
  channel: z.string().optional(),
  fundType: z.enum(['zakat', 'sadaqah', 'waqf', 'infaq', 'donation_general']).default('donation_general'),
  zakatCategory: z.string().optional(),
  zakatAuthority: z.string().optional(),
  shariahCompliant: z.boolean().default(true),
  isAnonymous: z.boolean().default(false),
  isTaxDeductible: z.boolean().default(false),
  receiptNumber: z.string().optional(),
  programmeId: z.string().optional(),
  caseId: z.string().optional(),
  notes: z.string().optional(),
  donatedAt: z.string().optional(),
})

const donationUpdateSchema = donationCreateSchema.partial()

// ============ HELPERS ============

async function generateDonationNumber(): Promise<string> {
  const last = await db.donation.findFirst({
    where: { isDeleted: false },
    orderBy: { donationNumber: 'desc' },
    select: { donationNumber: true },
  })
  const next = last ? parseInt(last.donationNumber.replace('DN-', '')) + 1 : 1
  return `DN-${String(next).padStart(4, '0')}`
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
    const fundType = searchParams.get('fundType') || ''

    const where: Record<string, unknown> = { isDeleted: false }

    if (search) {
      where.OR = [
        { donorName: { contains: search } },
        { donationNumber: { contains: search } },
        { donorEmail: { contains: search } },
        { donorPhone: { contains: search } },
        { receiptNumber: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (fundType) {
      where.fundType = fundType
    }

    const [items, total] = await Promise.all([
      db.donation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          programme: { select: { id: true, name: true } },
        },
      }),
      db.donation.count({ where }),
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

// ============ POST — Create donation ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = donationCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data
    const donationNumber = await generateDonationNumber()

    const donation = await db.donation.create({
      data: {
        donationNumber,
        donorName: data.donorName,
        donorIC: data.donorIC || null,
        donorEmail: data.donorEmail || null,
        donorPhone: data.donorPhone || null,
        amount: data.amount,
        status: data.status,
        method: data.method,
        channel: data.channel || null,
        fundType: data.fundType,
        zakatCategory: data.zakatCategory || null,
        zakatAuthority: data.zakatAuthority || null,
        shariahCompliant: data.shariahCompliant,
        isAnonymous: data.isAnonymous,
        isTaxDeductible: data.isTaxDeductible,
        receiptNumber: data.receiptNumber || null,
        programmeId: data.programmeId || null,
        caseId: data.caseId || null,
        notes: data.notes || null,
        donatedAt: data.donatedAt ? new Date(data.donatedAt) : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: donation }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============ PUT — Update donation ============

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID sumbangan diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.donation.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Sumbangan tidak dijumpai' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = donationUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: errors }, { status: 400 })
    }

    const data = parsed.data

    const donation = await db.donation.update({
      where: { id },
      data: {
        ...(data.donorName !== undefined && { donorName: data.donorName }),
        ...(data.donorIC !== undefined && { donorIC: data.donorIC || null }),
        ...(data.donorEmail !== undefined && { donorEmail: data.donorEmail || null }),
        ...(data.donorPhone !== undefined && { donorPhone: data.donorPhone || null }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.method !== undefined && { method: data.method }),
        ...(data.channel !== undefined && { channel: data.channel || null }),
        ...(data.fundType !== undefined && { fundType: data.fundType }),
        ...(data.zakatCategory !== undefined && { zakatCategory: data.zakatCategory || null }),
        ...(data.zakatAuthority !== undefined && { zakatAuthority: data.zakatAuthority || null }),
        ...(data.shariahCompliant !== undefined && { shariahCompliant: data.shariahCompliant }),
        ...(data.isAnonymous !== undefined && { isAnonymous: data.isAnonymous }),
        ...(data.isTaxDeductible !== undefined && { isTaxDeductible: data.isTaxDeductible }),
        ...(data.receiptNumber !== undefined && { receiptNumber: data.receiptNumber || null }),
        ...(data.programmeId !== undefined && { programmeId: data.programmeId || null }),
        ...(data.caseId !== undefined && { caseId: data.caseId || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.donatedAt !== undefined && { donatedAt: new Date(data.donatedAt) }),
      },
    })

    return NextResponse.json({ success: true, data: donation })
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
        { success: false, error: 'ID sumbangan diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.donation.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Sumbangan tidak dijumpai' },
        { status: 404 }
      )
    }

    const donation = await db.donation.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, data: donation })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ralat pelayan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
