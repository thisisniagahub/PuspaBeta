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
      activeCases,
      totalVolunteers,
      totalWorkItems,
      pendingWorkItems,
      totalAutomations,
      activeAutomations,
    ] = await Promise.all([
      db.member.count({ where: { isDeleted: false } }),
      db.member.count({ where: { isDeleted: false, status: 'active' } }),
      db.donation.count({ where: { isDeleted: false, status: 'confirmed' } }),
      db.donation.aggregate({ where: { isDeleted: false, status: 'confirmed' }, _sum: { amount: true } }),
      db.case.count({ where: { isDeleted: false } }),
      db.case.count({ where: { isDeleted: false, status: { notIn: ['closed', 'rejected'] } } }),
      db.volunteer.count({ where: { isDeleted: false, status: 'active' } }),
      db.workItem.count(),
      db.workItem.count({ where: { status: { in: ['queued', 'in_progress', 'waiting_user'] } } }),
      db.automationJob.count(),
      db.automationJob.count({ where: { isEnabled: true } }),
    ])

    const snapshot = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      system: {
        members: { total: totalMembers, active: activeMembers },
        donations: { total: totalDonations, totalAmount: totalDonationAmount._sum.amount ?? 0 },
        cases: { total: totalCases, active: activeCases },
        volunteers: { total: totalVolunteers },
        ops: {
          workItems: { total: totalWorkItems, pending: pendingWorkItems },
          automations: { total: totalAutomations, active: activeAutomations },
        },
      },
    }

    return NextResponse.json({ success: true, data: snapshot })
  } catch (error) {
    console.error('OpenClaw snapshot error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan tangkap OpenClaw' }, { status: 500 })
  }
}
