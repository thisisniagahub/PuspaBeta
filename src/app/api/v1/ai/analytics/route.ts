import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalMembers,
      activeMembers,
      totalDonations,
      totalDonationAmount,
      totalCases,
      openCases,
      totalVolunteers,
      totalVolunteerHours,
      totalProgrammes,
      pendingEkyc,
      pendingDisbursements,
    ] = await Promise.all([
      db.member.count({ where: { isDeleted: false } }),
      db.member.count({ where: { isDeleted: false, status: 'active' } }),
      db.donation.count({ where: { isDeleted: false, status: 'confirmed' } }),
      db.donation.aggregate({ where: { isDeleted: false, status: 'confirmed' }, _sum: { amount: true } }),
      db.case.count({ where: { isDeleted: false } }),
      db.case.count({ where: { isDeleted: false, status: { notIn: ['closed', 'rejected'] } } }),
      db.volunteer.count({ where: { isDeleted: false, status: 'active' } }),
      db.volunteer.aggregate({ where: { isDeleted: false }, _sum: { totalHours: true } }),
      db.programme.count({ where: { isDeleted: false, status: 'active' } }),
      db.eKYCVerification.count({ where: { status: 'pending' } }),
      db.disbursement.count({ where: { isDeleted: false, status: 'pending' } }),
    ])

    const memberGrowth = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0
    const caseResolutionRate = totalCases > 0 ? Math.round(((totalCases - openCases) / totalCases) * 100) : 0

    const insights = [
      {
        type: 'members',
        title: 'Pertumbuhan Ahli',
        value: activeMembers,
        total: totalMembers,
        percentage: memberGrowth,
        trend: memberGrowth > 70 ? 'positive' : 'neutral',
        description: `${activeMembers} ahli aktif daripada ${totalMembers} jumlah ahli`,
      },
      {
        type: 'donations',
        title: 'Jumlah Sumbangan',
        value: totalDonations,
        total: totalDonationAmount._sum.amount ?? 0,
        trend: 'positive',
        description: `${totalDonations} sumbangan disahkan berjumlah RM ${(totalDonationAmount._sum.amount ?? 0).toLocaleString()}`,
      },
      {
        type: 'cases',
        title: 'Kes Aktif',
        value: openCases,
        total: totalCases,
        percentage: caseResolutionRate,
        trend: openCases > 10 ? 'warning' : 'positive',
        description: `${openCases} kes terbuka, kadar penyelesaian ${caseResolutionRate}%`,
      },
      {
        type: 'ekyc',
        title: 'Pengesahan eKYC',
        value: pendingEkyc,
        trend: pendingEkyc > 5 ? 'warning' : 'positive',
        description: `${pendingEkyc} pengesahan eKYC menunggu pemprosesan`,
      },
      {
        type: 'disbursements',
        title: 'Pembayaran Tertunggak',
        value: pendingDisbursements,
        trend: pendingDisbursements > 3 ? 'warning' : 'positive',
        description: `${pendingDisbursements} pembayaran menunggu kelulusan`,
      },
      {
        type: 'volunteers',
        title: 'Sukarelawan',
        value: totalVolunteers,
        total: totalVolunteerHours._sum.totalHours ?? 0,
        trend: 'positive',
        description: `${totalVolunteers} sukarelawan aktif dengan ${Math.round(totalVolunteerHours._sum.totalHours ?? 0)} jam`,
      },
    ]

    return NextResponse.json({
      success: true,
      data: { insights, generatedAt: new Date().toISOString() },
    })
  } catch (error) {
    console.error('AI analytics error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan analitik AI' }, { status: 500 })
  }
}
