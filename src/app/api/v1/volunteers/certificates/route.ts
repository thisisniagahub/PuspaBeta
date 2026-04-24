import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const certificateSchema = z.object({
  volunteerId: z.string().min(1, 'ID sukarelawan diperlukan'),
  title: z.string().min(1, 'Tajuk diperlukan'),
  description: z.string().optional(),
  totalHours: z.number().optional(),
  issuedBy: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const volunteerId = searchParams.get('volunteerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (volunteerId) where.volunteerId = volunteerId

    const [certificates, total] = await Promise.all([
      db.volunteerCertificate.findMany({
        where,
        include: { volunteer: { select: { id: true, name: true, volunteerNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { issuedAt: 'desc' },
      }),
      db.volunteerCertificate.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { certificates, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Volunteer certificates GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan sijil sukarelawan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = certificateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const volunteer = await db.volunteer.findFirst({ where: { id: data.volunteerId, isDeleted: false } })
    if (!volunteer) return NextResponse.json({ success: false, error: 'Sukarelawan tidak dijumpai' }, { status: 404 })

    const existingCount = await db.volunteerCertificate.count()
    const certificateNumber = `CERT-${String(existingCount + 1).padStart(4, '0')}`

    const certificate = await db.volunteerCertificate.create({
      data: {
        volunteerId: data.volunteerId,
        certificateNumber,
        title: data.title,
        description: data.description,
        totalHours: data.totalHours ?? 0,
        issuedBy: data.issuedBy,
      },
    })

    return NextResponse.json({ success: true, data: certificate }, { status: 201 })
  } catch (error) {
    console.error('Volunteer certificates POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta sijil sukarelawan' }, { status: 500 })
  }
}
