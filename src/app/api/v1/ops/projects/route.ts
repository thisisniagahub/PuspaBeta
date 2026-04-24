import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const projects = await db.workItem.groupBy({
      by: ['project'],
      _count: { id: true },
    })

    const projectList = projects.map(p => ({
      name: p.project,
      count: p._count.id,
    }))

    return NextResponse.json({ success: true, data: projectList })
  } catch (error) {
    console.error('Ops projects error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan senarai projek' }, { status: 500 })
  }
}
