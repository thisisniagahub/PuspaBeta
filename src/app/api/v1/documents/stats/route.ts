import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const stats = await db.document.groupBy({
      by: ['category'],
      where: { status: { not: 'deleted' } },
      _count: { id: true },
    })

    const total = stats.reduce((sum, s) => sum + s._count.id, 0)
    const byCategory = stats.map(s => ({ category: s.category, count: s._count.id }))

    return NextResponse.json({
      success: true,
      data: { total, byCategory },
    })
  } catch (error) {
    console.error('Document stats error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan statistik dokumen' }, { status: 500 })
  }
}
