import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [active, inactive, blacklisted] = await Promise.all([
      db.member.count({ where: { isDeleted: false, status: 'active' } }),
      db.member.count({ where: { isDeleted: false, status: 'inactive' } }),
      db.member.count({ where: { isDeleted: false, status: 'blacklisted' } }),
    ])

    return NextResponse.json({
      success: true,
      data: [
        { name: 'Aktif', value: active, color: '#7c3aed' },
        { name: 'Tidak Aktif', value: inactive, color: '#059669' },
        { name: 'Senarai Hitam', value: blacklisted, color: '#e11d48' },
      ],
    })
  } catch (error) {
    console.error('Member distribution error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan taburan ahli' }, { status: 500 })
  }
}
