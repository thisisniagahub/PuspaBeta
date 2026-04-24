import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MONTH_SHORT = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']

export async function GET() {
  try {
    const donations = await db.donation.findMany({
      where: { isDeleted: false, status: 'confirmed' },
      select: { amount: true, fundType: true, donatedAt: true },
      orderBy: { donatedAt: 'asc' },
    })

    const monthlyMap = new Map<string, { zakat: number; sadaqah: number; waqf: number; infaq: number; general: number }>()

    for (const d of donations) {
      const date = new Date(d.donatedAt)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { zakat: 0, sadaqah: 0, waqf: 0, infaq: 0, general: 0 })
      }
      const entry = monthlyMap.get(key)!
      const fundKey = (d.fundType === 'donation_general' ? 'general' : d.fundType) as keyof typeof entry
      if (fundKey in entry) entry[fundKey] += d.amount
    }

    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, values]) => {
        const [year, month] = key.split('-').map(Number)
        return { bulan: `${MONTH_SHORT[month]} ${year}`, ...values }
      })

    return NextResponse.json({ success: true, data: monthlyData })
  } catch (error) {
    console.error('Monthly donations error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan data sumbangan bulanan' }, { status: 500 })
  }
}
