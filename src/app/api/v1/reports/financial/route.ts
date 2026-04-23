import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    // Single aggregate query with monthly breakdown using SQLite
    const donations = await db.donation.findMany({
      where: {
        isDeleted: false,
        status: 'confirmed',
        donatedAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true, fundType: true, donatedAt: true },
    })

    const disbursements = await db.disbursement.findMany({
      where: {
        isDeleted: false,
        status: 'completed',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true, createdAt: true },
    })

    // Group by month
    const monthlyData: Record<number, { donations: number; disbursements: number; byFundType: Record<string, number> }> = {}
    for (let m = 0; m < 12; m++) {
      monthlyData[m] = { donations: 0, disbursements: 0, byFundType: {} }
    }

    for (const d of donations) {
      const month = new Date(d.donatedAt).getMonth()
      monthlyData[month].donations += d.amount
      monthlyData[month].byFundType[d.fundType] = (monthlyData[month].byFundType[d.fundType] || 0) + d.amount
    }

    for (const d of disbursements) {
      const month = new Date(d.createdAt).getMonth()
      monthlyData[month].disbursements += d.amount
    }

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i).toLocaleString('ms-MY', { month: 'long' }),
      donations: Math.round(monthlyData[i].donations * 100) / 100,
      disbursements: Math.round(monthlyData[i].disbursements * 100) / 100,
      net: Math.round((monthlyData[i].donations - monthlyData[i].disbursements) * 100) / 100,
      byFundType: monthlyData[i].byFundType,
    }))

    const totalDonations = monthlyBreakdown.reduce((sum, m) => sum + m.donations, 0)
    const totalDisbursements = monthlyBreakdown.reduce((sum, m) => sum + m.disbursements, 0)

    return NextResponse.json({
      success: true,
      data: {
        year,
        totalDonations: Math.round(totalDonations * 100) / 100,
        totalDisbursements: Math.round(totalDisbursements * 100) / 100,
        netPosition: Math.round((totalDonations - totalDisbursements) * 100) / 100,
        monthlyBreakdown,
      },
    })
  } catch (error) {
    console.error('Financial report error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan laporan kewangan' }, { status: 500 })
  }
}
