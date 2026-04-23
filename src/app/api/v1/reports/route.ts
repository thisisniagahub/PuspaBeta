import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalMembers,
      activeMembers,
      totalDonations,
      totalDonationAmount,
      totalDisbursements,
      totalDisbursementAmount,
      totalCases,
      activeCases,
      totalProgrammes,
      activeProgrammes,
      totalVolunteers,
      totalVolunteerHours,
    ] = await Promise.all([
      db.member.count({ where: { isDeleted: false } }),
      db.member.count({ where: { isDeleted: false, status: 'active' } }),
      db.donation.count({ where: { isDeleted: false } }),
      db.donation.aggregate({ where: { isDeleted: false, status: 'confirmed' }, _sum: { amount: true } }),
      db.disbursement.count({ where: { isDeleted: false } }),
      db.disbursement.aggregate({ where: { isDeleted: false, status: 'completed' }, _sum: { amount: true } }),
      db.case.count({ where: { isDeleted: false } }),
      db.case.count({ where: { isDeleted: false, status: { notIn: ['closed', 'rejected'] } } }),
      db.programme.count({ where: { isDeleted: false } }),
      db.programme.count({ where: { isDeleted: false, status: 'active' } }),
      db.volunteer.count({ where: { isDeleted: false } }),
      db.volunteer.aggregate({ where: { isDeleted: false }, _sum: { totalHours: true } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        members: { total: totalMembers, active: activeMembers },
        donations: { total: totalDonations, totalAmount: totalDonationAmount._sum.amount ?? 0 },
        disbursements: { total: totalDisbursements, totalAmount: totalDisbursementAmount._sum.amount ?? 0 },
        cases: { total: totalCases, active: activeCases },
        programmes: { total: totalProgrammes, active: activeProgrammes },
        volunteers: { total: totalVolunteers, totalHours: totalVolunteerHours._sum.totalHours ?? 0 },
      },
    })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan laporan ringkasan' }, { status: 500 })
  }
}
