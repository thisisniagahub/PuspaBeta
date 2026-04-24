import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalMembers,
      activeMembers,
      totalDonations,
      confirmedDonations,
      activeProgrammes,
      totalVolunteers,
      activeVolunteers,
      pendingCases,
      complianceItems,
      completedCompliance,
    ] = await Promise.all([
      db.member.count({ where: { isDeleted: false } }),
      db.member.count({ where: { isDeleted: false, status: 'active' } }),
      db.donation.count({ where: { isDeleted: false } }),
      db.donation.aggregate({ where: { isDeleted: false, status: 'confirmed' }, _sum: { amount: true } }),
      db.programme.count({ where: { isDeleted: false, status: 'active' } }),
      db.volunteer.count({ where: { isDeleted: false } }),
      db.volunteer.count({ where: { isDeleted: false, status: 'active' } }),
      db.case.count({ where: { isDeleted: false, status: { in: ['submitted', 'verifying'] } } }),
      db.complianceChecklist.count(),
      db.complianceChecklist.count({ where: { isCompleted: true } }),
    ])

    const complianceScore = complianceItems > 0 ? Math.round((completedCompliance / complianceItems) * 100) : 0
    const totalDonationAmount = confirmedDonations._sum.amount || 0

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalDonationAmount,
        totalDonations,
        activeProgrammes,
        totalVolunteers,
        activeVolunteers,
        pendingCases,
        complianceScore,
        trendMembers: 5,
        trendProgrammes: 2,
        trendDonations: 12,
        trendVolunteers: 8,
        trendCompliance: 3,
      },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan data dashboard' }, { status: 500 })
  }
}
