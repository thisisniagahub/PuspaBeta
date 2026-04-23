import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const org = await db.organizationProfile.findFirst()
    if (!org) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'non_compliant',
          checks: {
            registrationNumber: false,
            rosCertificate: false,
            constitution: false,
            bankVerified: false,
            boardMembers: false,
          },
          message: 'Profil pertubuhan belum didaftarkan',
        },
      })
    }

    const boardMembers = await db.boardMember.count({ where: { isCurrent: true, isDeleted: false } })

    const checks = {
      registrationNumber: !!org.registrationNumber,
      rosCertificate: !!org.rosCertificateUrl,
      constitution: !!org.constitutionUrl,
      bankVerified: org.bankVerified,
      boardMembers: boardMembers >= 3,
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
        completedCount,
        totalChecks,
        organization: {
          legalName: org.legalName,
          registrationNumber: org.registrationNumber,
          registrationType: org.registrationType,
        },
      },
    })
  } catch (error) {
    console.error('ROS compliance error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan status pematuhan ROS' }, { status: 500 })
  }
}
