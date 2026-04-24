import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const bulkSchema = z.object({
  operation: z.enum(['delete', 'update_status', 'assign', 'export']),
  entity: z.string().min(1, 'Entiti diperlukan'),
  ids: z.array(z.string()).min(1, 'Sekurang-kurangnya satu ID diperlukan'),
  data: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bulkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { operation, entity, ids, data } = parsed.data
    let result: { affected: number } = { affected: 0 }

    switch (entity) {
      case 'member': {
        if (operation === 'delete') {
          result.affected = (await db.member.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true } })).count
        } else if (operation === 'update_status' && data?.status) {
          result.affected = (await db.member.updateMany({ where: { id: { in: ids } }, data: { status: data.status as string } })).count
        }
        break
      }
      case 'case': {
        if (operation === 'delete') {
          result.affected = (await db.case.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true } })).count
        } else if (operation === 'update_status' && data?.status) {
          result.affected = (await db.case.updateMany({ where: { id: { in: ids } }, data: { status: data.status as string } })).count
        }
        break
      }
      case 'donation': {
        if (operation === 'delete') {
          result.affected = (await db.donation.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true } })).count
        } else if (operation === 'update_status' && data?.status) {
          result.affected = (await db.donation.updateMany({ where: { id: { in: ids } }, data: { status: data.status as string } })).count
        }
        break
      }
      case 'volunteer': {
        if (operation === 'delete') {
          result.affected = (await db.volunteer.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true } })).count
        } else if (operation === 'update_status' && data?.status) {
          result.affected = (await db.volunteer.updateMany({ where: { id: { in: ids } }, data: { status: data.status as string } })).count
        }
        break
      }
      case 'workItem': {
        if (operation === 'update_status' && data?.status) {
          result.affected = (await db.workItem.updateMany({ where: { id: { in: ids } }, data: { status: data.status as string } })).count
        }
        break
      }
      default:
        return NextResponse.json({ success: false, error: `Entiti '${entity}' tidak disokong untuk operasi pukal` }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Ops bulk error:', error)
    return NextResponse.json({ success: false, error: 'Gagal melaksanakan operasi pukal' }, { status: 500 })
  }
}
