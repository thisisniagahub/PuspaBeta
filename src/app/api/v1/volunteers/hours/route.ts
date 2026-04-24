import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const hourLogSchema = z.object({
  volunteerId: z.string().min(1, 'ID sukarelawan diperlukan'),
  deploymentId: z.string().optional(),
  date: z.string().min(1, 'Tarikh diperlukan'),
  hours: z.number().min(0.5, 'Jam mesti sekurang-kurangnya 0.5'),
  activity: z.string().optional(),
  approvedBy: z.string().optional(),
  status: z.string().optional(),
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

    const [hourLogs, total] = await Promise.all([
      db.volunteerHourLog.findMany({
        where,
        include: { volunteer: { select: { id: true, name: true, volunteerNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      db.volunteerHourLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { hourLogs, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Volunteer hours GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan log jam sukarelawan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = hourLogSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const volunteer = await db.volunteer.findFirst({ where: { id: data.volunteerId, isDeleted: false } })
    if (!volunteer) return NextResponse.json({ success: false, error: 'Sukarelawan tidak dijumpai' }, { status: 404 })

    const hourLog = await db.volunteerHourLog.create({
      data: {
        volunteerId: data.volunteerId,
        deploymentId: data.deploymentId,
        date: new Date(data.date),
        hours: data.hours,
        activity: data.activity,
        approvedBy: data.approvedBy,
        status: data.status ?? 'pending',
      },
    })

    // Update volunteer total hours
    await db.volunteer.update({
      where: { id: data.volunteerId },
      data: { totalHours: { increment: data.hours } },
    })

    return NextResponse.json({ success: true, data: hourLog }, { status: 201 })
  } catch (error) {
    console.error('Volunteer hours POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta log jam sukarelawan' }, { status: 500 })
  }
}
