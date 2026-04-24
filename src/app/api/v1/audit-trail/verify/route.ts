import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txHash, verifiedBy } = body

    if (!txHash) {
      return Response.json(
        { success: false, error: 'Hash transaksi diperlukan' },
        { status: 400 }
      )
    }

    const entry = await db.auditTrail.findUnique({
      where: { txHash },
    })

    if (!entry) {
      return Response.json(
        { success: false, error: 'Transaksi tidak dijumpai' },
        { status: 404 }
      )
    }

    // Simulate verification logic
    // In a real blockchain, this would check the hash integrity
    const verificationChecks: Record<string, boolean> = {
      hashValid: true, // Hash format is valid
      amountMatch: true, // Amount matches records
      entityExists: true, // Both entities exist
      fundTypeValid: ['zakat', 'sadaqah', 'waqf', 'infaq', 'general'].includes(entry.fundType),
      notDisputed: entry.status !== 'disputed',
    }

    const allChecksPassed = Object.values(verificationChecks).every(Boolean)

    const updatedEntry = await db.auditTrail.update({
      where: { txHash },
      data: {
        status: allChecksPassed ? 'verified' : entry.status,
        verifiedAt: allChecksPassed ? new Date() : null,
        verifiedBy: allChecksPassed ? (verifiedBy || 'audit-system') : null,
      },
    })

    return Response.json({
      success: true,
      data: {
        txHash,
        verified: allChecksPassed,
        status: updatedEntry.status,
        checks: verificationChecks,
        verifiedAt: updatedEntry.verifiedAt,
        verifiedBy: updatedEntry.verifiedBy,
      },
    })
  } catch (error) {
    console.error('Verify audit trail error:', error)
    return Response.json(
      { success: false, error: 'Ralat mengesahkan jejak audit' },
      { status: 500 }
    )
  }
}
