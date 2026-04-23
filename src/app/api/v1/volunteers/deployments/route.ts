import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const deploymentSchema = z.object({
  volunteerId: z.string().min(1, 'ID sukarelawan diperlukan'),
  programmeId: z.string().optional(),
  activityId: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().min(1, 'Tarikh mula diperlukan'),
  endDate: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const volunteerId = searchParams.get('volunteerId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (volunteerId) where.volunteerId = volunteerId
    if (status) where.status = status

    const [deployments, total] = await Promise.all([
      db.volunteerDeployment.findMany({
        where,
        include: {
          volunteer: { select: { id: true, name: true, volunteerNumber: true } },
          programme: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'desc' },
      }),
      db.volunteerDeployment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { deployments, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Volunteer deployments GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan penempatan sukarelawan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = deploymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const volunteer = await db.volunteer.findFirst({ where: { id: data.volunteerId, isDeleted: false } })
    if (!volunteer) return NextResponse.json({ success: false, error: 'Sukarelawan tidak dijumpai' }, { status: 404 })

    const deployment = await db.volunteerDeployment.create({
      data: {
        volunteerId: data.volunteerId,
        programmeId: data.programmeId,
        activityId: data.activityId,
        role: data.role ?? 'participant',
        status: data.status ?? 'assigned',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location,
        notes: data.notes,
      },
    })

    return NextResponse.json({ success: true, data: deployment }, { status: 201 })
  } catch (error) {
    console.error('Volunteer deployments POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta penempatan sukarelawan' }, { status: 500 })
  }
}
