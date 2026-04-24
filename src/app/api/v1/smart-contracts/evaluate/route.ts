import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { disbursementId, contractType, conditions } = body

    if (!contractType || !conditions) {
      return Response.json(
        { success: false, error: 'Jenis kontrak dan syarat diperlukan' },
        { status: 400 }
      )
    }

    const validContractTypes = [
      'auto_release',
      'conditional_approval',
      'kyc_required',
      'fund_sufficient',
    ]
    if (!validContractTypes.includes(contractType)) {
      return Response.json(
        { success: false, error: `Jenis kontrak tidak sah: ${contractType}` },
        { status: 400 }
      )
    }

    // Evaluate conditions
    const evaluationResults: Record<string, { condition: string; passed: boolean; detail: string }> = {}

    // Default conditions to evaluate if not provided
    const conditionsToEvaluate = Array.isArray(conditions)
      ? conditions
      : ['kyc_verified', 'programme_approved', 'fund_sufficient', 'admin_approved']

    for (const cond of conditionsToEvaluate) {
      switch (cond) {
        case 'kyc_verified': {
          // Check if the member has verified eKYC
          let passed = false
          if (disbursementId) {
            const disbursement = await db.disbursement.findUnique({
              where: { id: disbursementId },
              select: { memberId: true },
            })
            if (disbursement?.memberId) {
              const ekyc = await db.eKYCVerification.findUnique({
                where: { memberId: disbursement.memberId },
              })
              passed = ekyc?.status === 'verified'
            }
          }
          evaluationResults[cond] = {
            condition: 'Pengesahan KYC',
            passed,
            detail: passed ? 'Identiti telah disahkan' : 'Pengesahan identiti belum selesai',
          }
          break
        }
        case 'programme_approved': {
          let passed = false
          if (disbursementId) {
            const disbursement = await db.disbursement.findUnique({
              where: { id: disbursementId },
              select: { programmeId: true, status: true },
            })
            passed = disbursement?.status === 'approved' || disbursement?.status === 'processing'
          }
          evaluationResults[cond] = {
            condition: 'Kelulusan program',
            passed,
            detail: passed ? 'Program diluluskan' : 'Program belum diluluskan',
          }
          break
        }
        case 'fund_sufficient': {
          // Check if there are sufficient funds
          const totalFunds = await db.donation.aggregate({
            _sum: { amount: true },
            where: { status: 'confirmed', isDeleted: false },
          })
          const totalDisbursed = await db.disbursement.aggregate({
            _sum: { amount: true },
            where: { status: 'completed', isDeleted: false },
          })
          const available = (totalFunds._sum.amount || 0) - (totalDisbursed._sum.amount || 0)

          let requiredAmount = 0
          if (disbursementId) {
            const disbursement = await db.disbursement.findUnique({
              where: { id: disbursementId },
              select: { amount: true },
            })
            requiredAmount = disbursement?.amount || 0
          }

          const passed = available >= requiredAmount
          evaluationResults[cond] = {
            condition: 'Kemampuan dana',
            passed,
            detail: passed
              ? `Dana mencukupi (RM${available.toFixed(2)} tersedia)`
              : `Dana tidak mencukupi (RM${available.toFixed(2)} tersedia, RM${requiredAmount.toFixed(2)} diperlukan)`,
          }
          break
        }
        case 'admin_approved': {
          let passed = false
          if (disbursementId) {
            const disbursement = await db.disbursement.findUnique({
              where: { id: disbursementId },
              select: { approvedBy: true },
            })
            passed = !!disbursement?.approvedBy
          }
          evaluationResults[cond] = {
            condition: 'Kelulusan pentadbir',
            passed,
            detail: passed ? 'Diluluskan oleh pentadbir' : 'Belum diluluskan oleh pentadbir',
          }
          break
        }
        default:
          evaluationResults[cond] = {
            condition: cond,
            passed: false,
            detail: 'Syarat tidak dikenali',
          }
      }
    }

    const canRelease = Object.values(evaluationResults).every((r) => r.passed)

    // Save evaluation log
    const log = await db.smartContractLog.create({
      data: {
        disbursementId: disbursementId || null,
        contractType,
        conditions: JSON.stringify(conditionsToEvaluate),
        evaluationResult: JSON.stringify(evaluationResults),
        canRelease,
        evaluatedBy: 'smart-contract-engine',
      },
    })

    return Response.json({
      success: true,
      data: {
        canRelease,
        contractType,
        conditions: evaluationResults,
        evaluatedAt: log.evaluatedAt,
        logId: log.id,
      },
    })
  } catch (error) {
    console.error('Evaluate smart contract error:', error)
    return Response.json(
      { success: false, error: 'Ralat menilai kontrak pintar' },
      { status: 500 }
    )
  }
}
