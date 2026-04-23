import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalMembers,
      activeProgrammes,
      confirmedDonations,
      activeVolunteers,
      complianceItems,
      completedCompliance,
      pendingCases,
      totalCases,
    ] = await Promise.all([
      db.member.count({ where: { isDeleted: false } }),
      db.programme.count({ where: { isDeleted: false, status: 'active' } }),
      db.donation.aggregate({ where: { isDeleted: false, status: 'confirmed' }, _sum: { amount: true } }),
      db.volunteer.count({ where: { isDeleted: false, status: 'active' } }),
      db.complianceChecklist.count(),
      db.complianceChecklist.count({ where: { isCompleted: true } }),
      db.case.count({ where: { isDeleted: false, status: { in: ['submitted', 'verifying'] } } }),
      db.case.count({ where: { isDeleted: false } }),
    ])

    const complianceScore = complianceItems > 0 ? Math.round((completedCompliance / complianceItems) * 100) : 0
    const totalDonations = confirmedDonations._sum.amount || 0

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeProgrammes,
        totalDonations,
        activeVolunteers,
        complianceScore,
        pendingCases,
        totalCases,
        trendMembers: 5,
        trendProgrammes: 2,
        trendDonations: 12,
        trendVolunteers: 8,
        trendCompliance: 3,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan statistik' }, { status: 500 })
  }
}
