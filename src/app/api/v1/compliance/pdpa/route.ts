import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const pdpaItems = await db.complianceChecklist.findMany({
      where: { category: 'transparency' },
      orderBy: { order: 'asc' },
    })

    const membersWithEkyc = await db.eKYCVerification.count({
      where: { status: 'verified' },
    })

    const totalMembers = await db.member.count({ where: { isDeleted: false } })

    const consentRate = totalMembers > 0 ? Math.round((membersWithEkyc / totalMembers) * 100) : 0

    const checks = {
      privacyPolicy: pdpaItems.some(i => i.item.toLowerCase().includes('privasi') && i.isCompleted),
      dataConsent: pdpaItems.some(i => i.item.toLowerCase().includes('keizinan') && i.isCompleted),
      dataRetention: pdpaItems.some(i => i.item.toLowerCase().includes('penyimpanan') && i.isCompleted),
      dataAccess: pdpaItems.some(i => i.item.toLowerCase().includes('akses') && i.isCompleted),
      breachNotification: pdpaItems.some(i => i.item.toLowerCase().includes('pelanggaran') && i.isCompleted),
    }

    const allCompliant = Object.values(checks).every(Boolean)
    const completedCount = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.values(checks).length

    return NextResponse.json({
      success: true,
      data: {
        status: allCompliant ? 'compliant' : 'partial',
        checks,
        score: Math.round((completedCount / totalChecks) * 100),
        consentRate,
        membersWithEkyc,
        totalMembers,
        completedCount,
        totalChecks,
      },
    })
  } catch (error) {
    console.error('PDPA compliance error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan status pematuhan PDPA' }, { status: 500 })
  }
}
